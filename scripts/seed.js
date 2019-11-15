const faker = require('faker');
const { writeFileSync } = require('fs');
const { join } = require('path');

const { User } = require('../models/user');
const { Bookmark } = require('../models/bookmark');
const { Message } = require('../models/message');
const { Driver } = require('../models/driver');
const { Car } = require('../models/car');
const { Trip } = require('../models/trip');
const { Stop } = require('../models/stop');
const { Bid } = require('../models/bid');
const { Review } = require('../models/review');

const USER_COUNT = 100;
const BOOKMARK_COUNT = 1000;
const MESSAGE_COUNT = 10000;
const CAR_COUNT = 500;
const TRIP_COUNT = 1000;
const STOP_COUNT = 3000;
const BID_COUNT = 3000;

const DRIVER_PROBABILITY = 0.5;
const ONGOING_TRIP_PROBABILITY = 0.05;
const FINISHED_TRIP_PROBABILITY = 0.8;
const FAILED_BID_PROBABILITY = 0.3;
const WON_BID_PROBABILITY = 0.5;
const REVIEW_PROBABILITY = 0.5;

const USERS = [];
const DRIVER_EMAILS = [];
const CARS = [];
const TRIPS = [];
const STOPS = [];
const BIDS = [];

const USERS_OUTPUT_FILENAME = 'users.json';

const getRandomArrayElement = array => {
  const random = Math.random();
  const index = Math.floor(random * array.length);
  return array[index];
};

const getRandomIntegerBetweenBounds = (lowerBound, upperBound) => {
  const numbers = Array(upperBound - lowerBound + 1)
    .fill(0)
    .map((_, index) => index + lowerBound);
  return getRandomArrayElement(numbers);
};

const getRandomFloatBetweenBounds = (lowerBound, upperBound) => {
  const range = upperBound - lowerBound;
  return Math.round((Math.random() * range + lowerBound) * 10) / 10;
};

const getRandomGender = () => {
  const genders = ['male', 'female', 'non binary'];
  return getRandomArrayElement(genders);
};

const getRandomUserEmail = () => {
  return getRandomArrayElement(USERS.map(user => user.email));
};

const getRandomDriverEmail = () => {
  return getRandomArrayElement(DRIVER_EMAILS);
};

const getRandomCar = () => {
  return getRandomArrayElement(CARS);
};

const getRandomTrip = () => {
  return getRandomArrayElement(TRIPS);
};

const getRandomStopFromTid = tid => {
  const stops = STOPS.filter(stop => stop.tid === tid);
  return getRandomArrayElement(stops);
};

const getRandomLicense = () => {
  return Array(8)
    .fill(0)
    .map(() => faker.random.alphaNumeric())
    .join('')
    .toUpperCase();
};

const getRandomYear = () => {
  const years = Array(50)
    .fill(0)
    .map((_, index) => index + 1960);
  return getRandomArrayElement(years);
};

const seedUsers = async () => {
  console.log('Seeding users...');

  const users = Array(USER_COUNT)
    .fill(0)
    .map(() => {
      const email = faker.internet.email();
      const password = faker.internet.password();

      const user = new User(
        email,
        password,
        faker.name.findName(),
        getRandomGender(),
        faker.phone.phoneNumber(),
        faker.image.avatar()
      );

      USERS.push(user);

      return user;
    });

  await Promise.all(users.map(user => user.save()));
};

const seedBookmarks = async () => {
  console.log('Seeding bookmarks...');

  const userEmailToBookmarkNameSet = new Map();

  const bookmarks = Array(BOOKMARK_COUNT)
    .fill(0)
    .map(() => {
      // Get unique (email, name) pair
      const email = getRandomUserEmail();
      let name = faker.random.word();
      while (
        userEmailToBookmarkNameSet.has(email) &&
        userEmailToBookmarkNameSet.get(email).has(name)
      ) {
        name = faker.random.word();
      }

      // Update userEmailToBookmarkNameSet for future iterations
      if (userEmailToBookmarkNameSet.has(email)) {
        userEmailToBookmarkNameSet.get(email).add(name);
      } else {
        const bookmarkNameSet = new Set();
        bookmarkNameSet.add(name);
        userEmailToBookmarkNameSet.set(email, bookmarkNameSet);
      }

      return new Bookmark(email, name, faker.address.streetAddress());
    });

  await Promise.all(bookmarks.map(bookmark => bookmark.save()));
};

const seedMessages = async () => {
  console.log('Seeding messages...');

  const messages = Array(MESSAGE_COUNT)
    .fill(0)
    .map(() => {
      const senderEmail = getRandomUserEmail();
      let receiverEmail = getRandomUserEmail();
      while (receiverEmail === senderEmail) {
        receiverEmail = getRandomUserEmail();
      }
      return new Message(
        undefined,
        senderEmail,
        receiverEmail,
        faker.lorem.sentence()
      );
    });

  await Promise.all(messages.map(message => message.save()));
};

const seedDrivers = async () => {
  console.log('Seeding drivers...');

  await Promise.all(
    USERS.map(async user => {
      const random = Math.random();
      if (random < DRIVER_PROBABILITY) {
        DRIVER_EMAILS.push(user.email);
        await Driver.register(user.email);
      }
    })
  );
};

const seedCars = async () => {
  console.log('Seeding cars...');

  const cars = Array(CAR_COUNT)
    .fill(0)
    .map(() => {
      const car = new Car(
        getRandomLicense(),
        getRandomDriverEmail(),
        faker.commerce.productName(),
        getRandomIntegerBetweenBounds(4, 9),
        getRandomYear()
      );

      CARS.push(car);

      return car;
    });

  await Promise.all(cars.map(car => car.save()));
};

const seedTrips = async () => {
  console.log('Seeding trips...');

  const trips = Array(TRIP_COUNT)
    .fill(0)
    .map(() => {
      const car = getRandomCar();
      const seats = getRandomIntegerBetweenBounds(1, car.seats);

      return new Trip(
        undefined,
        car.license,
        undefined,
        faker.address.streetAddress(),
        seats,
        faker.date.between('2019-01-01', '2019-12-31')
      );
    });

  const savedTrips = await Promise.all(trips.map(trip => trip.save()));

  // Update trip status
  const driversWithOngoingTrips = new Set();
  const statusUpdatedTrips = await Promise.all(
    savedTrips.map(trip => {
      const driverEmail = CARS.find(car => car.license === trip.license).email;

      const random = Math.random();
      if (
        !driversWithOngoingTrips.has(driverEmail) &&
        random < ONGOING_TRIP_PROBABILITY
      ) {
        trip.status = 'ongoing';
        driversWithOngoingTrips.add(driverEmail);
      } else if (random < FINISHED_TRIP_PROBABILITY) {
        trip.status = 'finished';
      }

      return trip.update();
    })
  );

  statusUpdatedTrips.forEach(trip => TRIPS.push(trip));
};

const seedStops = async () => {
  console.log('Seeding stops...');

  const stops = TRIPS.map(trip => {
    // Ensure that every trip has at least one stop
    const stop = new Stop(
      getRandomIntegerBetweenBounds(0, 10),
      faker.address.streetAddress(),
      trip.tid
    );

    STOPS.push(stop);

    return stop;
  }).concat(
    Array(STOP_COUNT - TRIP_COUNT)
      .fill(0)
      .map(() => {
        const stop = new Stop(
          getRandomFloatBetweenBounds(0, 10),
          faker.address.streetAddress(),
          getRandomTrip().tid
        );

        STOPS.push(stop);

        return stop;
      })
  );

  await Promise.all(stops.map(stop => stop.save()));
};

const seedBids = async () => {
  console.log('Seeding bids...');

  const bidPrimaryKeySet = new Set();

  const bids = Array(BID_COUNT)
    .fill(0)
    .map(() => {
      // Ensure every bid created uphold pk uniqueness
      let trip = getRandomTrip();
      let email = getRandomUserEmail();
      let driverEmail = CARS.find(car => car.license === trip.license).email;
      while (
        email === driverEmail ||
        bidPrimaryKeySet.has(JSON.stringify([trip.tid, email]))
      ) {
        trip = getRandomTrip();
        email = getRandomUserEmail();
        driverEmail = CARS.find(car => car.license === trip.license).email;
      }
      bidPrimaryKeySet.add(JSON.stringify([trip.tid, email]));

      const stop = getRandomStopFromTid(trip.tid);

      return new Bid(
        email,
        trip.tid,
        stop.address,
        undefined,
        getRandomFloatBetweenBounds(stop.minPrice, 20)
      );
    });

  const savedBids = await Promise.all(bids.map(bid => bid.save()));

  // Update bid status
  const statusUpdatedBids = await Promise.all(
    savedBids.map(bid => {
      const random = Math.random();
      if (random < WON_BID_PROBABILITY) {
        bid.status = 'won';
      } else if (random < WON_BID_PROBABILITY + FAILED_BID_PROBABILITY) {
        bid.status = 'failed';
      }
      return bid.update();
    })
  );

  statusUpdatedBids.forEach(bid => BIDS.push(bid));
};

const seedReviews = async () => {
  console.log('Seeding reviews...');

  const reviews = [];

  BIDS.filter(bid => bid.status === 'won').forEach(wonBid => {
    const trip = TRIPS.find(trip => trip.tid === wonBid.tid);
    if (trip.status === 'finished' && Math.random() < REVIEW_PROBABILITY) {
      reviews.push(
        new Review(
          wonBid.email,
          trip.tid,
          getRandomFloatBetweenBounds(0, 5),
          faker.lorem.lines()
        )
      );
    }
  });

  await Promise.all(reviews.map(review => review.save()));
};

const writeUserDataToFile = () => {
  const path = join(__dirname, `./${USERS_OUTPUT_FILENAME}`);

  console.log(`Storing generated user data at ${path}`);

  writeFileSync(
    path,
    JSON.stringify(
      USERS.map(user => ({
        name: user.name,
        email: user.email,
        secret: user.secret,
      })),
      undefined,
      2
    )
  );

  console.log(`Generated user data is stored at ${path}`);
};

const seedTables = async () => {
  await seedUsers();
  await seedBookmarks();
  await seedMessages();
  await seedDrivers();
  await seedCars();
  await seedTrips();
  await seedStops();
  await seedBids();
  await seedReviews();

  // Save users data in a file for login purposes
  writeUserDataToFile();
};

seedTables()
  .then(() => {
    console.log('Tables seeded!');
    process.exit(0);
  })
  .catch(error => {
    console.log('Table seed failed:', error);
    process.exit(1);
  });

module.exports = { seedTables };

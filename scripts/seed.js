const faker = require('faker');

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
const BID_COUNT = 1000;

const DRIVER_PROBABILITY = 0.5;
const ONGOING_TRIP_PROBABILITY = 0.05;
const FINISHED_TRIP_PROBABILITY = 0.8;

const USERS = [];
const DRIVER_EMAILS = [];
const CARS = [];
const TRIPS = [];
const STOPS = [];

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

  const bids = Array(BID_COUNT)
    .fill(0)
    .map(() => {
      const trip = getRandomTrip();
      const stop = getRandomStopFromTid(trip.tid);

      const driverEmail = CARS.find(car => car.license === trip.license).email;
      let email = getRandomUserEmail();
      while (email === driverEmail) {
        email = getRandomUserEmail();
      }

      return new Bid(
        email,
        trip.tid,
        stop.address,
        undefined,
        getRandomFloatBetweenBounds(stop.minPrice, 20)
      );
    });

  const savedBids = await Promise.all(bids.map(bid => bid.save()));

  // const trip2 = savedBids[1];
  // trip2.status = 'won';
  // await trip2.update();

  // const trip3 = savedBids[2];
  // trip3.status = 'failed';
  // await trip3.update();
};

const seedReviews = async () => {
  const reviews = [new Review(EMAILS[1], TID[1], 4.9, 'Awesome driver!')];
  await Promise.all(reviews.map(review => review.save()));
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
  // await seedReviews();
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

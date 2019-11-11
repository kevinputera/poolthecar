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

const BOOKMARK_PER_USER_LOWER_BOUND = 5;
const BOOKMARK_PER_USER_UPPER_BOUND = 15;

const MESSAGE_PER_USER_LOWER_BOUND = 50;
const MESSAGE_PER_USER_UPPER_BOUND = 100;

const DRIVER_PROBABILITY = 0.5;

const CAR_PER_DRIVER_LOWER_BOUND = 1;
const CAR_PER_DRIVER_UPPER_BOUND = 5;

const TRIP_PER_DRIVER_LOWER_BOUND = 10;
const TRIP_PER_DRIVER_UPPER_BOUND = 30;

// Users
// { email: string, password: string }[]
const USERS = [];

// Driver emails
// string[]
const DRIVERS = [];

// Driver emails to cars mapping
// { driver: { license: string, seats: number }[] }
const DRIVERS_TO_CARS = [];

// Trips
// { tid: number, status: string }[]
const TRIPS = [];

const getRandomArrayElement = array => {
  const random = Math.random();
  const index = Math.floor(random * array.length);
  return array[index];
};

const getRandomBetweenBounds = (lowerBound, upperBound) => {
  const numbers = Array(upperBound - lowerBound + 1)
    .fill(0)
    .map((_, index) => index + lowerBound);
  return getRandomArrayElement(numbers);
};

const getRandomGender = () => {
  const genders = ['male', 'female', 'non binary'];
  return getRandomArrayElement(genders);
};

const getRandomTripStatus = () => {
  const tripStatus = ['created', 'ongoing', 'finished'];
  return getRandomArrayElement(tripStatus);
};

const getRandomUserEmail = () => {
  return getRandomArrayElement(USERS.map(user => user.email));
};

const getRandomCarByDriver = driver => {
  return getRandomArrayElement(DRIVERS_TO_CARS[driver]);
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
      USERS.push({ email, password });

      return new User(
        email,
        password,
        faker.name.findName(),
        getRandomGender(),
        faker.phone.phoneNumber(),
        faker.image.avatar()
      );
    });

  await Promise.all(users.map(user => user.save()));
};

const seedBookmarks = async () => {
  console.log('Seeding bookmarks...');

  const bookmarks = [];

  USERS.forEach(user => {
    const names = new Set();

    Array(
      getRandomBetweenBounds(
        BOOKMARK_PER_USER_LOWER_BOUND,
        BOOKMARK_PER_USER_UPPER_BOUND
      )
    )
      .fill(0)
      .forEach(() => {
        let name = faker.random.word();
        while (names.has(name)) {
          name = faker.random.word();
        }
        names.add(name);

        bookmarks.push(
          new Bookmark(user.email, name, faker.address.streetAddress())
        );
      });
  });

  await Promise.all(bookmarks.map(bookmark => bookmark.save()));
};

const seedMessages = async () => {
  console.log('Seeding messages...');

  const messages = [];

  USERS.forEach(user => {
    Array(
      getRandomBetweenBounds(
        MESSAGE_PER_USER_LOWER_BOUND,
        MESSAGE_PER_USER_UPPER_BOUND
      )
    )
      .fill(0)
      .forEach(() => {
        let receiverEmail = getRandomUserEmail();
        while (receiverEmail === user.email) {
          receiverEmail = getRandomUserEmail();
        }

        messages.push(
          new Message(
            undefined,
            user.email,
            receiverEmail,
            faker.lorem.sentence()
          )
        );
      });
  });

  await Promise.all(messages.map(message => message.save()));
};

const seedDrivers = async () => {
  console.log('Seeding drivers...');

  await Promise.all(
    USERS.map(async user => {
      const random = Math.random();
      if (random < DRIVER_PROBABILITY) {
        DRIVERS.push(user.email);
        await Driver.register(user.email);
      }
    })
  );
};

const seedCars = async () => {
  console.log('Seeding cars...');

  const cars = [];

  DRIVERS.forEach(driver => {
    Array(
      getRandomBetweenBounds(
        CAR_PER_DRIVER_LOWER_BOUND,
        CAR_PER_DRIVER_UPPER_BOUND
      )
    )
      .fill(0)
      .forEach(() => {
        const license = getRandomLicense();
        const seats = getRandomBetweenBounds(4, 9);
        if (driver in DRIVERS_TO_CARS) {
          DRIVERS_TO_CARS[driver] = [
            ...DRIVERS_TO_CARS[driver],
            { license, seats },
          ];
        } else {
          DRIVERS_TO_CARS[driver] = [{ license, seats }];
        }

        cars.push(
          new Car(
            license,
            driver,
            faker.commerce.productName(),
            seats,
            getRandomYear()
          )
        );
      });
  });

  await Promise.all(cars.map(car => car.save()));
};

const seedTrips = async () => {
  console.log('Seeding trips...');

  const trips = [];

  // Create trips
  DRIVERS.forEach(driver => {
    Array(
      getRandomBetweenBounds(
        TRIP_PER_DRIVER_LOWER_BOUND,
        TRIP_PER_DRIVER_UPPER_BOUND
      )
    )
      .fill(0)
      .forEach(() => {
        const car = getRandomCarByDriver(driver);
        const seats = getRandomBetweenBounds(1, car.seats);
        trips.push(
          new Trip(
            undefined,
            car.license,
            undefined,
            faker.address.streetAddress(),
            seats,
            faker.date.between('2019-01-01', '2019-12-31')
          )
        );
      });
  });
  const savedTrips = await Promise.all(trips.map(trip => trip.save()));

  // Update trip status
  // await Promise.all(
  //   savedTrips.map(trip => {
  //     const status = getRandomTripStatus();
  //     trip.status = status;
  //     TRIPS.push({ tid: trip.tid, status });

  //     return trip.update();
  //   })
  // );
};

const seedStops = async () => {
  const stops = [
    new Stop(4.5, 'Kent Ridge', TID[0]),
    new Stop(5.5, 'Buona Vista', TID[0]),
    new Stop(10.3, 'Orchard Rd', TID[0]),
    new Stop(2.4, 'Somerset', TID[1]),
    new Stop(5.5, 'Ang Mo Kio', TID[1]),
    new Stop(5, 'Jurong East', TID[2]),
  ];
  await Promise.all(stops.map(stop => stop.save()));
};

const seedBids = async () => {
  const bids = [
    new Bid(EMAILS[1], TID[0], 'Kent Ridge', undefined, 4.5),
    new Bid(EMAILS[1], TID[1], 'Somerset', undefined, 6),
    new Bid(EMAILS[1], TID[2], 'Jurong East', undefined, 5),
  ];

  const savedBids = await Promise.all(bids.map(bid => bid.save()));

  const trip2 = savedBids[1];
  trip2.status = 'won';
  await trip2.update();

  const trip3 = savedBids[2];
  trip3.status = 'failed';
  await trip3.update();
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
  // await seedStops();
  // await seedBids();
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

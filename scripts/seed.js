const { User } = require('../models/user');
const { Bookmark } = require('../models/bookmark');
const { Message } = require('../models/message');
const { Driver } = require('../models/driver');
const { Car } = require('../models/car');
const { Trip } = require('../models/trip');
const { Stop } = require('../models/stop');
const { Bid } = require('../models/bid');
const { Review } = require('../models/review');

const EMAILS = ['admin@poolthecar.com', 'member@poolthecar.com'];
const LICENSES = ['A12345', 'B54321', 'C10000'];
const TID = [1, 2, 3];

const seedUsers = async () => {
  const users = [
    new User(
      EMAILS[0],
      'password',
      'Bob',
      'male',
      12345678,
      'https://avatars2.githubusercontent.com/u/46835051?s=460&v=4'
    ),
    new User(
      EMAILS[1],
      'password',
      'Alice',
      'female',
      87654321,
      'https://avatars2.githubusercontent.com/u/46835051?s=460&v=4'
    ),
  ];
  await Promise.all(users.map(user => user.save()));
};

const seedBookmarks = async () => {
  const bookmarks = [
    new Bookmark(EMAILS[0], 'Home', 'College Ave'),
    new Bookmark(EMAILS[0], 'Work', 'Clementi West'),
    new Bookmark(EMAILS[1], 'School', 'Bugis'),
  ];
  await Promise.all(bookmarks.map(bookmark => bookmark.save()));
};

const seedMessages = async () => {
  const messages = [
    new Message(null, EMAILS[0], EMAILS[1], 'Hello there!'),
    new Message(null, EMAILS[0], EMAILS[1], 'How are you doing?'),
    new Message(null, EMAILS[1], EMAILS[0], 'Hello back!'),
  ];
  await Promise.all(messages.map(message => message.save()));
};

const seedDrivers = async () => {
  const drivers = [new Driver(EMAILS[0])];
  await Promise.all(drivers.map(driver => driver.save()));
};

const seedCars = async () => {
  const cars = [
    new Car(LICENSES[0], EMAILS[0], 'Nissan GTR', 3, 2014),
    new Car(LICENSES[1], EMAILS[0], 'Ford Mustang', 2, 2009),
    new Car(LICENSES[2], EMAILS[0], 'Toyota Innova', 6, 2015),
  ];
  await Promise.all(cars.map(car => car.save()));
};

const seedTrips = async () => {
  const trips = [
    new Trip(TID[0], LICENSES[0], 'created', 'College Ave', 2, new Date()),
    new Trip(TID[1], LICENSES[0], 'finished', 'Bugis', 3, new Date()),
    new Trip(TID[2], LICENSES[1], 'finished', 'Clementi East', 2, new Date()),
  ];
  await Promise.all(trips.map(trip => trip.save()));
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
    new Bid(EMAILS[1], TID[0], 'Kent Ridge', 'pending', 4),
    new Bid(EMAILS[1], TID[1], 'Somerset', 'failed', 1),
    new Bid(EMAILS[1], TID[2], 'Jurong East', 'won', 7.5),
  ];
  await Promise.all(bids.map(bid => bid.save()));
};

const seedReviews = async () => {
  const reviews = [
    new Review(EMAILS[0], TID[2], 4.5, 'Good ride!'),
    new Review(EMAILS[1], TID[1], 4.9, 'Awesome driver!'),
  ];
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
  await seedReviews();
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

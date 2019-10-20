const { User } = require('../models/user');
const { Driver } = require('../models/driver');
const { Car } = require('../models/car');
const { Trip } = require('../models/trip');

async function initTestData() {
  const user1 = new User('1', '1', '1', 'male', '1', '1');
  await user1.save();

  const driver1 = new Driver('1');
  await driver1.save();

  const car1 = new Car('1', '1', '1', 4, '1');
  await car1.save();

  const trip1 = new Trip(
    '1',
    '1',
    'created',
    '1',
    2,
    '2004-10-19 10:23:54',
    null,
    null
  );
  await trip1.save();
}

module.exports = { initTestData };

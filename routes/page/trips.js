const express = require('express');
const { Trip } = require('../../models/trip');
const { Car } = require('../../models/car');
const { Driver } = require('../../models/driver');
const { checkIsDriver } = require('../../utils/checkIsDriver');

const router = express.Router();

router.get('/', async (req, res) => {
  const email = req.session.email;
  const address = req.query.address;
  const isDriver = await checkIsDriver(email);

  let trips;
  if (address) {
    trips = await Trip.findAllByDriverEmailAndAddressWithStops(email, address);
  } else {
    trips = await Trip.findAllByDriverEmail(email);
  }

  res.render('trips', {
    title: 'Trips',
    isLoggedIn: true,
    isDriver,
    trips,
    query: req.query,
  });
});

router.get('/new', async (req, res) => {
  const { email } = req.session;
  const isDriver = await checkIsDriver(email);
  const cars = await Car.findAllByEmail(email);
  res.render('trip/newTrip', { title: 'New trip', isDriver, cars });
});

router.get('/:tid/bids/new', async (req, res) => {
  const { email } = req.session;
  const { tid } = req.params;
  const isDriver = await checkIsDriver(email);

  const tripWithDriver = await Trip.findByTidWithDriver(tid);
  const driverOverallRating = await Driver.getOverallRating(
    tripWithDriver.driver.email
  );

  res.render('bid/newBid', {
    title: 'New bid',
    isDriver,
    tripWithDriver,
    driverOverallRating,
  });
});

module.exports = { tripPageRoutes: router };

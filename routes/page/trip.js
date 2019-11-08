const express = require('express');
const { Trip } = require('../../models/trip');
const { Car } = require('../../models/car');
const { Bid } = require('../../models/bid');
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

  res.render('trip/trips', {
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

  const tripWithDriverAndStops = await Trip.findByTidWithDriverAndStops(tid);
  const driverOverallRating = await Driver.getOverallRating(
    tripWithDriverAndStops.driver.email
  );

  res.render('bid/newBid', {
    title: 'New bid',
    isDriver,
    tripWithDriverAndStops,
    driverOverallRating,
  });
});

router.get('/:tid/bids/detail', async (req, res) => {
  const { email } = req.session;
  const { tid } = req.params;
  const isDriver = checkIsDriver(email);

  const driver = await Driver.findByTid(tid);
  const bidMapWithStop = await Bid.findAllByTidAndCustomerWithStops(email, tid);
  const tripWithStops = await Trip.findByTidWithStops(tid);
  const wonBidWithReview = await Bid.findWonBidByTidAndCustomerWithReview(
    tid,
    email
  );

  res.render('bid/bidDetail', {
    title: 'Bid detail',
    isDriver,
    driver,
    bidMapWithStop,
    tripWithStops,
    wonBidWithReview,
  });
});

module.exports = { tripPageRoutes: router };

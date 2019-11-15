const express = require('express');
const { Trip } = require('../../models/trip');
const { Car } = require('../../models/car');
const { Bid } = require('../../models/bid');
const { Driver } = require('../../models/driver');
const { checkIsDriver } = require('../../utils/checkIsDriver');

const router = express.Router();

const TRIPS_PAGE_LIMIT = 15;

/**
 * Route to render trip browse page
 */
router.get('/', async (req, res) => {
  const { search = '', page = 1 } = req.query;
  const { email } = req.session;

  const {
    hasNextPage,
    tripsWithStops,
  } = await Trip.findAllByDriverEmailAndSearchQueryWithStops(
    email,
    search,
    +page,
    TRIPS_PAGE_LIMIT
  );

  let nextPageUrl;
  let prevPageUrl;
  if (search) {
    nextPageUrl = `/p/trips?search=${search}&page=${+page + 1}`;
    prevPageUrl = `/p/trips?search=${search}&page=${+page - 1}`;
  } else {
    nextPageUrl = `/p/trips?page=${+page + 1}`;
    prevPageUrl = `/p/trips?page=${+page - 1}`;
  }

  const isDriver = await checkIsDriver(email);

  res.render('trip/trips', {
    title: 'Trips',
    isDriver,
    hasPrevPage: +page !== 1,
    hasNextPage,
    nextPageUrl,
    prevPageUrl,
    search,
    tripsWithStops,
  });
});

/**
 * Route to render trip detail page
 */
router.get('/:tid/detail', async (req, res) => {
  const { tid } = req.params;
  const { email } = req.session;
  const isDriver = await checkIsDriver(email);

  const tripWithStops = await Trip.findByTidWithStops(tid);
  const bidsWithStopsAndCustomerAndReview = await Bid.findAllByTidWithStopsAndCustomerAndReview(
    tid
  );

  let nextStatus;
  if (tripWithStops.status === 'created') {
    nextStatus = 'ongoing';
  }
  if (tripWithStops.status === 'ongoing') {
    nextStatus = 'finished';
  }

  res.render('trip/tripDetail', {
    title: 'Trip detail',
    isDriver,
    tripWithStops,
    bidsWithStopsAndCustomerAndReview,
    nextStatus,
  });
});

/**
 * Route to render trip creation form
 */
router.get('/new', async (req, res) => {
  const { email } = req.session;
  const isDriver = await checkIsDriver(email);
  const cars = await Car.findAllByEmail(email);
  res.render('trip/newTrip', { title: 'New trip', isDriver, cars });
});

/**
 * Route to render bid creation form
 */
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

/**
 * Route to render bid detail page
 */
router.get('/:tid/bids/detail', async (req, res) => {
  const { email } = req.session;
  const { tid } = req.params;
  const isDriver = await checkIsDriver(email);

  const driver = await Driver.findByTid(tid);
  const bidMapWithStop = await Bid.findByTidAndCustomerWithStop(email, tid);
  const tripWithStops = await Trip.findByTidWithStops(tid);
  const wonBidWithReview = await Bid.findWonBidByTidAndCustomerWithReview(
    tid,
    email
  );

  const driverRating = await Driver.getOverallRating(driver.email);

  res.render('bid/bidDetail', {
    title: 'Bid detail',
    isDriver,
    driver,
    driverRating,
    bidMapWithStop,
    tripWithStops,
    wonBidWithReview,
  });
});

module.exports = { tripPageRoutes: router };

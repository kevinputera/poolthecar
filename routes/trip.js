const express = require('express');
const { Review } = require('../models/review');
const { Trip } = require('../models/trip');
const { ok, badRequestMessage, internalError } = require('../utils/response');

const router = express.Router();

router.post('/:tid/reviews', async (req, res) => {
  const tid = req.params.tid;
  const { email, score, content } = req.body;
  const review = new Review(email, tid, score, content);
  try {
    const savedReview = await review.save();
    ok(res, savedReview);
  } catch (error) {
    internalError(res, error);
  }
});

router.put('/:tid/reviews/:email', async (req, res) => {
  const { tid, email } = req.params;
  const { score, content } = req.query;
  try {
    const review = await Review.findByEmailAndTid(email, tid);
    if (!review) {
      badRequestMessage(res, 'Review does not exist');
      return;
    }
    review.score = score;
    review.content = content;
    const updatedReview = await review.update();
    ok(res, updatedReview);
  } catch (error) {
    internalError(res, error);
  }
});

// TODO: Remove this
router.get('/:tid/reviews/:email', async (req, res) => {
  const { tid, email } = req.params;
  try {
    const review = await Review.findByEmailAndTid(email, tid);
    if (!review) {
      badRequestMessage(res, 'Review does not exist');
      return;
    }
    ok(res, review);
  } catch (error) {
    internalError(res, error);
  }
});

router.delete('/:tid/reviews/:email', async (req, res) => {
  const { tid, email } = req.params;
  try {
    const review = await Review.findByEmailAndTid(email, tid);
    if (!review) {
      badRequestMessage(res, 'Review does not exist');
      return;
    }
    const deletedReview = await review.delete();
    ok(res, deletedReview);
  } catch (error) {
    internalError(res, error);
  }
});

// TODO: Remove this
router.get('/:tid/reviews', async (req, res) => {
  const tid = req.params.tid;
  try {
    const reviews = await Review.findByTrip(tid);
    ok(res, reviews);
  } catch (error) {
    internalError(res, error);
  }
});

router.get('/driver/:email', async (req, res) => {
  const email = req.params.email;
  try {
    const trips = await Trip.findByDriverEmailWithCarAndStops(id);
    ok(res, trips);
  } catch (error) {
    internalError(res, error);
  }
});

router.get('/address/:address', async (req, res) => {
  const address = req.params.id;
  try {
    const trips = await Trip.findByAddressWithCarAndStops(address);
    ok(res, trips);
  } catch (error) {
    internalError(res, error);
  }
});

router.post('/', async (req, res) => {
  const { tid, license, status, origin, seats, departingOn } = req.query;
  const trip = new Trip(
    tid,
    license,
    status,
    origin,
    seats,
    departingOn,
    null,
    null
  );
  try {
    const savedTrip = await trip.save();
    ok(res, savedTrip);
  } catch (error) {
    internalError(res, error);
  }
});

router.delete('/:tid', async (req, res) => {
  const tid = req.params.tid;
  try {
    const trip = await Trip.findByTid(tid);
    if (!trip) {
      badRequestMessage(res, 'Trip does not exist');
      return;
    }
    const deletedTrip = await trip.delete();
    ok(res, deletedTrip);
  } catch (error) {
    internalError(res, error);
  }
});

router.get('/', async (req, res) => {
  try {
    const trips = Trip.findAllCreatedWithStops();
    ok(res, trips);
  } catch (error) {
    internalError(res, error);
  }
});

router.put('/update/:tid', async (req, res) => {
  const tid = req.params.tid;
  const { license, status, origin, seats, departingOn } = req.query;
  try {
    const trip = await Trip.findByTid(tid);
    if (!trip) {
      badRequestMessage(res, 'Trip does not exist');
      return;
    }
    trip.license = license;
    trip.status = status;
    trip.origin = origin;
    trip.seats = seats;
    trip.departingOn = departingOn;
    const updatedTrip = await trip.update();
    ok(res, updatedTrip);
  } catch (error) {
    internalError(res, error);
  }
});

module.exports = { tripRoutes: router };

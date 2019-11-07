const express = require('express');
const { Trip } = require('../../models/trip');
const { Review } = require('../../models/review');
const { Stop } = require('../../models/stop');
const {
  ok,
  badRequestMessage,
  internalError,
} = require('../../utils/response');

const router = express.Router();

router.post('/:tid/reviews', async (req, res) => {
  const { email } = req.session;
  const tid = req.params.tid;
  const { score, content } = req.body;
  const review = new Review(email, tid, score, content);
  try {
    const savedReview = await review.save();
    ok(res, savedReview);
  } catch (error) {
    internalError(res, error);
  }
});

router.put('/:tid/reviews', async (req, res) => {
  const { email } = req.session;
  const { tid } = req.params;
  const { score, content } = req.body;
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

router.delete('/:tid/reviews', async (req, res) => {
  const { email } = req.session;
  const { tid } = req.params;
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

//Save bid
router.post('/:tid/bidding/stop/:address', async (req, res) => {
  const { tid, address } = req.params;
  const { status, value } = req.body;
  const { email } = req.session;
  const bid = new Bid(email, tid, address, status, value);
  try {
    savedBid = await bid.save();
    ok(res, savedBid);
  } catch (error) {
    internalError(res, error);
  }
});

//Update bid
router.put('/:tid/bidding/stop/:address', async (req, res) => {
  const { tid, address } = req.params;
  const { value } = req.body;
  const { email } = req.session;
  try {
    let bid = await Bid.findByUserAndStop(email, tid, address);
    if (!bid) {
      badRequestMessage(res, 'Bid does not exist');
      return;
    }
    if (bid.status !== 'pending') {
      badRequestMessage(res, 'Bid not in pending stage');
      return;
    }
    bid.value = value;
    const updatedBid = await bid.update();
    ok(res, updatedBid);
  } catch (error) {
    internalError(res, error);
  }
});

//Delete bid
router.delete('/:tid/bidding/stop/:address', async (req, res) => {
  const { tid, address } = req.params;
  const { email } = req.session;
  const bid = new Bid(email, tid, address);
  try {
    const deletedBid = await bid.delete();
    ok(res, deletedBid);
  } catch (error) {
    internalError(res, error);
  }
});

router.post('/', async (req, res) => {
  const { license, origin, seats, departingOn } = req.body;
  try {
    const trip = new Trip(
      undefined,
      license,
      undefined,
      origin,
      seats,
      departingOn,
      undefined,
      undefined
    );
    const savedTrip = await trip.save();
    ok(res, savedTrip);
  } catch (error) {
    internalError(res, error);
  }
});

router.put('/:tid', async (req, res) => {
  const { tid } = req.params;
  const { status, origin, seats, departingOn } = req.body;
  try {
    const trip = await Trip.findByTid(tid);

    if (!trip) {
      badRequestMessage(res, 'Trip does not exist');
      return;
    }

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

router.delete('/:tid', async (req, res) => {
  const { tid } = req.params;
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

router.post('/:tid/stops', async (req, res) => {
  const { tid } = req.params;
  const { address, minPrice } = req.body;
  try {
    const stop = new Stop(minPrice, address, tid);
    const savedStop = await stop.save();
    ok(res, savedStop);
  } catch (error) {
    internalError(res, error);
  }
});

module.exports = { tripRoutes: router };

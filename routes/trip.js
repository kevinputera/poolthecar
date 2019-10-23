const express = require('express');
const { Review } = require('../models/review');
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

// TODO: Remove this
router.get('/:tid/reviews/', async (req, res) => {
  const { tid } = req.params;
  const email = req.query.email;
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

//Save bid
router.post('/:tid/stop/:address', async (req, res) => {});
//Update bid
//Delete bid
//Get pending bid by trip
//Get won bid by trip

module.exports = { tripRoutes: router };

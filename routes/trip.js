const express = require('express');
const router = express.Router();
const { Review } = require('../models/review');

router.post('/:tid/reviews/:email', async (req, res) => {
  const email = req.params.email;
  const tid = req.params.tid;
  const score = req.query.score;
  const content = req.query.content;
  const review = new Review(email, tid, score, content);
  try {
    await review.save();
    res.send(review);
  } catch (err) {
    res.status(500);
    res.send(err);
  }
});

router.put('/:tid/reviews/:email', async (req, res) => {
  const email = req.params.email;
  const tid = req.params.tid;
  const score = req.query.score;
  const content = req.query.content;
  try {
    const review = await Review.findByEmailAndTid(email, tid);
    if (!review) {
      res.status(400);
      res.send({ Message: 'Review not found' });
      return;
    }
    review.score = score;
    review.content = content;
    await review.update();
    res.send(review);
  } catch (err) {
    res.status(500);
    res.send(err);
  }
});

router.get('/:tid/reviews/:email', async (req, res) => {
  const tid = req.params.tid;
  const email = req.params.email;
  try {
    const review = await Review.findByEmailAndTid(email, tid);
    if (!review) {
      res.status(400);
      res.send({ Message: 'Review not found' });
      return;
    }
    res.send(review);
  } catch (err) {
    res.status(500);
    res.send(err);
  }
});

router.delete('/:tid/reviews/:email', async (req, res) => {
  const tid = req.params.tid;
  const email = req.params.email;
  try {
    const review = await Review.findByEmailAndTid(email, tid);
    if (!review) {
      res.status(400);
      res.send({ Message: 'Review not found' });
      return;
    }
    await review.delete();
    res.send(review);
  } catch (err) {
    res.status(500);
    res.send(err);
  }
});

router.get('/:tid/reviews', async (req, res) => {
  const tid = req.params.tid;
  try {
    const reviews = await Review.findByTrip(tid);
    res.send(reviews);
  } catch (err) {
    res.status(500);
    res.send(err);
  }
});

module.exports = { tripRoutes: router };

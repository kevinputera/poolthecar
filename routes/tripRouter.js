const express = require('express');
const router = express.Router();
const { Review } = require('../models/review');

router.post('/:tid/reviews/:email', async (req, res) => {
  const email = req.params.email;
  const tid = req.params.tid;
  const score = req.query.score;
  const content = req.query.content;
  const review = new Review(email, tid, score, content, null, null);
  try {
    await review.save();
  } catch (err) {
    console.log(err);
    res.status(500);
    res.send('DB exception');
    return;
  }
  res.send(review);
});

router.put('/:tid/reviews/:email', async (req, res) => {
  const email = req.params.email;
  const tid = req.params.tid;
  const score = req.query.score;
  const content = req.query.content;
  var review;
  try {
    review = await Review.find(email, tid);
  } catch (err) {
    console.log(err);
    res.status(500);
    res.send('DB exception');
    return;
  }
  if (review == null) {
    res.status(400);
    res.send({ Error: 'Review not found' });
    return;
  }
  review.score = score;
  review.content = content;
  try {
    await review.update();
  } catch (err) {
    console.log(err);
    res.status(500);
    res.send('DB exception');
    return;
  }
  res.send(review);
});

router.get('/:tid/reviews/:email', async (req, res) => {
  const tid = req.params.tid;
  const email = req.params.email;
  var review;
  try {
    review = await Review.find(email, tid);
  } catch (err) {
    console.log(err);
    res.status(500);
    res.send('DB exception');
    return;
  }
  if (review == null) {
    res.status(400);
    res.send({ Error: 'Review not found' });
    return;
  }
  res.send(review);
});

router.delete('/:tid/reviews/:email', async (req, res) => {
  const tid = req.params.tid;
  const email = req.params.email;
  var review;
  try {
    review = await Review.find(email, tid);
  } catch (err) {
    console.log(err);
    res.status(500);
    res.send('DB exception');
    return;
  }
  if (review == null) {
    res.status(400);
    res.send({ Error: 'Review not found' });
    return;
  }
  try {
    await review.delete();
  } catch (err) {
    console.log(err);
    res.status(500);
    res.send('DB exception');
    return;
  }
  res.send(review);
});

router.get('/:tid/reviews/', async (req, res) => {
  const tid = req.params.tid;
  var reviews;
  try {
    reviews = await Review.findByTrip(tid);
  } catch (err) {
    console.log(err);
    res.status(500);
    res.send('DB exception');
    return;
  }
  res.send(reviews);
});

module.exports = { tripRouter: router };

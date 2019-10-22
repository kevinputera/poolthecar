const express = require('express');
const { Car } = require('../models/car.js');

const router = express.Router();

router.get('/driver', async (req, res) => {
  const email = req.query.email;
  const page = req.query.page;
  const limit = req.query.limit;
  try {
    const cars = await Car.findByDriver(email, page, limit);
    res.json(cars);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/license', async (req, res) => {
  const license = req.query.license;
  try {
    const cars = await Car.findByLicense(license);
    res.json(cars);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post('/', async (req, res) => {
  const { license, email, model, seats, manufacturedOn } = req.body;
  const car = new Car(license, email, model, seats, manufacturedOn);
  try {
    await car.save();
    res.json(car);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.delete('/:license', async (req, res) => {
  const license = req.params.license;
  try {
    const car = await Car.findByLicense(license);
    if (!car) {
      res.status(401).send('car does not exist');
      return;
    }
    await car.delete();
    res.json(car);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = { carRoutes: router };

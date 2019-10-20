const express = require('express');
const { Database } = require('../db');
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

router.get('/license/', async (req, res) => {
  const license = req.query.license;
  const page = req.query.page;
  const limit = req.query.limit;
  try {
    const cars = await Car.findByLicense(license, page, limit);
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

module.exports = { carRoutes: router };

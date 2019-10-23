const express = require('express');
const { Car } = require('../models/car.js');
const { ok, badRequestMessage, internalError } = require('../utils/response');

const router = express.Router();

// TODO: Remove this
router.get('/driver', async (req, res) => {
  const { email, page, limit } = req.query;
  try {
    const cars = await Car.findByDriver(email, page, limit);
    ok(res, cars);
  } catch (error) {
    internalError(res, error);
  }
});

// TODO: Remove this
router.get('/license', async (req, res) => {
  const license = req.query.license;
  try {
    const cars = await Car.findByLicense(license);
    ok(res, cars);
  } catch (error) {
    internalError(res, error);
  }
});

router.post('/', async (req, res) => {
  const { license, email, model, seats, manufacturedOn } = req.body;
  const car = new Car(license, email, model, seats, manufacturedOn);
  try {
    const savedCar = await car.save();
    ok(res, savedCar);
  } catch (error) {
    internalError(res, error);
  }
});

router.delete('/:license', async (req, res) => {
  const license = req.params.license;
  try {
    const car = await Car.findByLicense(license);
    if (!car) {
      badRequestMessage(res, 'Car does not exist');
      return;
    }
    const deletedCar = await car.delete();
    ok(res, deletedCar);
  } catch (error) {
    internalError(res, error);
  }
});

module.exports = { carRoutes: router };

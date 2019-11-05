const express = require('express');
const { Car } = require('../../models/car.js');
const {
  ok,
  badRequestMessage,
  internalError,
} = require('../../utils/response');

const router = express.Router();

router.post('/', async (req, res) => {
  const { email } = req.session;
  const { license, model, seats, manufacturedOn } = req.body;
  const car = new Car(license, email, model, seats, manufacturedOn);
  try {
    const savedCar = await car.save();
    ok(res, savedCar);
  } catch (error) {
    internalError(res, error);
  }
});

router.put('/:license', async (req, res) => {
  const { license } = req.params;
  const { model, seats, manufacturedOn } = req.body;
  try {
    const car = await Car.findByLicense(license);

    car.model = model;
    car.seats = seats;
    car.manufacturedOn = manufacturedOn;
    const updatedCar = await car.update();

    ok(res, updatedCar);
  } catch (error) {
    internalError(res, error);
  }
});

router.delete('/:license', async (req, res) => {
  const { license } = req.params;
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

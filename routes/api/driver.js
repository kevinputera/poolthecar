const express = require('express');
const { Driver } = require('../../models/driver');
const { Trip } = require('../../models/trip');
const { ok, internalError } = require('../../utils/response');

const router = express.Router();

router.post('/', async (req, res) => {
  const email = req.session.email;
  try {
    const driver = new Driver(email);
    const savedDriver = await driver.save();
    ok(res, savedDriver);
  } catch (error) {
    internalError(res, error);
  }
});

router.get('/:email/trips', async (req, res) => {
  const email = req.params.email;
  try {
    const trips = await Trip.findByDriverEmailWithCarAndStops(email);
    ok(res, trips);
  } catch (error) {
    internalError(res, error);
  }
});

module.exports = { driverRoutes: router };

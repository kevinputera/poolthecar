const express = require('express');
const { Database } = require('../db');
const { Trips } = require('../models/trip.js');
const { Stop } = require('../models/stop');
const { Car } = require('../models/car');
const { Driver } = require('../models/driver');

const router = express.Router();

router.get('/:email/trips', async (req, res) => {
  const email = req.params.email;
  const tripsByDriver = await Trips.findByDriverEmailWithCarAndStops(email);
  res.json(tripsByDriver);
});

router.post('/:email/trips', async (req, res) => {
  const email = req.params.email;
});

module.exports = { driverRoutes: router };

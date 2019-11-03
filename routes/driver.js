const express = require('express');
const { Database } = require('../db');
const { Trips } = require('../models/trip.js');
const { Stop } = require('../models/stop');
const { Car } = require('../models/car');
const { Driver } = require('../models/driver');

const router = express.Router();

router.get('/:email', async (req, res) => {
  const email = req.params.email;
  const tripsByDriver = await Trips.findByDriverEmailWithCarAndStops(email);
  res.json(tripsByDriver);
});

router.post('/trips', async (req, res) => {
  console.log(req.body);
  const {
    tid,
    license,
    status,
    origin,
    seats,
    departingOn,
    email,
    model,
    num_seats,
    manufacturedOn,
    min_price,
    address,
  } = req.body;
  const trip = new Trips(
    tid,
    license,
    status,
    origin,
    seats,
    departingOn,
    null,
    null
  );
  const stops = new Stop(min_price, address, tid);
  const cars = new Car(license, email, model, num_seats, manufacturedOn);
  const drivers = new Driver(email);
  await drivers.save();
  await cars.save();
  await trip.save();
  await stops.save();
  res.json(drivers);
  res.json(cars);
  res.json(trip);
  res.json(stops);
});

module.exports = { driverRoutes: router };

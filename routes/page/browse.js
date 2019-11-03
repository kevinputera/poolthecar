const express = require('express');
const { Trip } = require('../../models/trip');

const router = express.Router();

router.get('/', async (req, res) => {
  const { address } = req.query;

  let tripsWithStops;
  if (address) {
    tripsWithStops = await Trip.findAllCreatedByAddressWithStops(address);
  } else {
    tripsWithStops = await Trip.findAllCreatedWithStops();
  }
  res.render('browse', { title: 'Browse', query: req.query, tripsWithStops });
});

module.exports = { browsePageRoutes: router };

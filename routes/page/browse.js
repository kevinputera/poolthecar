const express = require('express');
const { Trip } = require('../../models/trip');
const { checkIsDriver } = require('../../utils/checkIsDriver');

const router = express.Router();

router.get('/', async (req, res) => {
  const { address } = req.query;

  let tripsWithStops;
  if (address) {
    tripsWithStops = await Trip.findAllCreatedByAddressWithStops(address);
  } else {
    tripsWithStops = await Trip.findAllCreatedWithStops();
  }

  const isDriver = await checkIsDriver(req.session.email);

  res.render('browse', {
    title: 'Browse',
    query: req.query,
    isDriver,
    tripsWithStops,
  });
});

module.exports = { browsePageRoutes: router };

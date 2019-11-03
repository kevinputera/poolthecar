const express = require('express');
const { Trip } = require('../../models/trip');

const router = express.Router();

router.get('/', async (req, res) => {
  const email = req.session.email;
  const address = req.query.address;

  let trips;
  if (address) {
    trips = await Trip.findByDriverEmailAndAddressWithStops(email, address);
  } else {
    trips = await Trip.findByDriverEmail(email);
  }

  res.render('trips', {
    title: 'Trips',
    trips,
    query: req.query,
  });
});

module.exports = { tripPageRoutes: router };

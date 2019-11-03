const express = require('express');
const { Trip } = require('../../models/trip');
const { checkIsDriver } = require('../../utils/checkIsDriver');

const router = express.Router();

router.get('/', async (req, res) => {
  const email = req.session.email;
  const address = req.query.address;
  const isDriver = await checkIsDriver(email);

  let trips;
  if (address) {
    trips = await Trip.findAllByDriverEmailAndAddressWithStops(email, address);
  } else {
    trips = await Trip.findAllByDriverEmail(email);
  }

  res.render('trips', {
    title: 'Trips',
    isLoggedIn: true,
    isDriver,
    trips,
    query: req.query,
  });
});

module.exports = { tripPageRoutes: router };

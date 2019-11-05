const express = require('express');
const { checkIsDriver } = require('../../utils/checkIsDriver');
const { Driver } = require('../../models/driver');
const { Bid } = require('../../models/bid');
const { Trip } = require('../../models/trip');

const router = express.Router();

router.get('/:tid', async (req, res) => {
  const { email } = req.session;
  const { tid } = req.params;
  const isDriver = checkIsDriver(email);

  const tripWithStops = await Trip.findByTidWithStops(tid);
  const bidsWithStopsAndCustomer = await Bid.findAllByTidWithStopsAndCustomer(
    tid
  );

  res.render('detailTrip', {
    title: 'Detailed Trip',
    isLoggedIn: true,
    isDriver,
    tripWithStops,
    bidsWithStopsAndCustomer,
  });
});

module.exports = { detailTripRoutes: router };

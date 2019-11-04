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

  const trip = await Trip.findByTid(tid);
  const bidsWithStopsAndCustomer = await Bid.findAllByTidWithStopsAndCustomer(
    tid
  );

  res.render('detailTrip', {
    title: 'Detailed Trip',
    isLoggedIn: true,
    isDriver,
    trip,
    bidsWithStopsAndCustomer,
  });
});

module.exports = { detailTripRoutes: router };

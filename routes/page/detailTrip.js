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
  const bidsWithStopsAndCustomerAndReview = await Bid.findAllByTidWithStopsAndCustomerAndReview(
    tid
  );

  console.log(bidsWithStopsAndCustomerAndReview);

  res.render('detailTrip', {
    title: 'Detailed Trip',
    isLoggedIn: true,
    isDriver,
    tripWithStops,
    bidsWithStopsAndCustomerAndReview,
  });
});

module.exports = { detailTripRoutes: router };

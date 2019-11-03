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

  const driver = await Driver.findByTid(tid);
  const bidWithTripAndStops = await Bid.findByTidAndCustomerWithTripAndStops(
    email,
    tid
  );
  const tripWithStops = await Trip.findByTidWithStops(tid);

  let stopBiddingMap = {};
  if (bidWithTripAndStops) {
    for (var stop of bidWithTripAndStops.trip.stops) {
      stopBiddingMap[stop.address] = stop;
    }
  }

  res.render('detailBid', {
    title: 'Detailed Bidding',
    isLoggedIn: true,
    isDriver,
    driver,
    bidWithTripAndStops,
    tripWithStops,
    stopBiddingMap,
  });
});

module.exports = { detailBidRoutes: router };

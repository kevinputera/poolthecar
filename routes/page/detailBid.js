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
  const bidMapWithStop = await Bid.findAllByTidAndCustomerWithStops(email, tid);
  const tripWithStops = await Trip.findByTidWithStops(tid);
  const wonBid = await Bid.findWonBidByTidAndCustomer(tid, email);

  res.render('detailBid', {
    title: 'Detailed Bidding',
    isLoggedIn: true,
    isDriver,
    driver,
    bidMapWithStop,
    tripWithStops,
    wonBid,
  });
});

module.exports = { detailBidRoutes: router };

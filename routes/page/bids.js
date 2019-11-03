const express = require('express');
const { Bid } = require('../../models/bid');
const { Trip } = require('../../models/trip');

const router = express.Router();

router.get('/', async (req, res) => {
  const email = req.session.email;
  const address = req.query.address;

  let bidsWithTrip;
  if (address) {
    bidsWithTrip = await Bid.findByCustomerAndAddressWithTrip(email, address);
  } else {
    bidsWithTrip = await Bid.findByCustomerWithTrip(email);
  }

  res.render('bids', {
    title: 'Biddings',
    bidsWithTrip,
    query: req.query,
  });
});

module.exports = { bidPageRoutes: router };

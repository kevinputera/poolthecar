const express = require('express');
const { Bid } = require('../../models/bid');
const { checkIsDriver } = require('../../utils/checkIsDriver');

const router = express.Router();

router.get('/', async (req, res) => {
  const email = req.session.email;
  const address = req.query.address;
  const isDriver = await checkIsDriver(email);

  let bidsWithTrip;
  if (address) {
    bidsWithTrip = await Bid.findAllByCustomerAndAddressWithTrip(
      email,
      address
    );
  } else {
    bidsWithTrip = await Bid.findAllByCustomerWithTrip(email);
  }

  res.render('bids', {
    title: 'Biddings',
    isLoggedIn: true,
    isDriver,
    bidsWithTrip,
    query: req.query,
  });
});

module.exports = { bidPageRoutes: router };

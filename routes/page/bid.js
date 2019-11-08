const express = require('express');
const { Bid } = require('../../models/bid');
const { checkIsDriver } = require('../../utils/checkIsDriver');

const router = express.Router();

const BIDS_PAGE_LIMIT = 15;

router.get('/', async (req, res) => {
  const { search = '', page = 1 } = req.query;
  const { email } = req.session;

  const {
    hasNextPage,
    bidsWithTrip,
  } = await Bid.findAllByEmailAndSearchQueryWithTrip(
    email,
    search,
    +page,
    BIDS_PAGE_LIMIT
  );

  let nextPageUrl;
  let prevPageUrl;
  if (search) {
    nextPageUrl = `/p/bids?search=${search}&page=${+page + 1}`;
    prevPageUrl = `/p/bids?search=${search}&page=${+page - 1}`;
  } else {
    nextPageUrl = `/p/bids?page=${+page + 1}`;
    prevPageUrl = `/p/bids?page=${+page - 1}`;
  }

  const isDriver = await checkIsDriver(email);

  res.render('bid/bids', {
    title: 'Bids',
    isDriver,
    hasPrevPage: +page !== 1,
    hasNextPage,
    nextPageUrl,
    prevPageUrl,
    search,
    bidsWithTrip,
  });
});

module.exports = { bidPageRoutes: router };

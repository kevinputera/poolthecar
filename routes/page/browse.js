const express = require('express');
const { Trip } = require('../../models/trip');
const { checkIsDriver } = require('../../utils/checkIsDriver');

const router = express.Router();

const BROWSE_PAGE_LIMIT = 15;

router.get('/', async (req, res) => {
  const { search = '', page = 1 } = req.query;
  const { email } = req.session;

  const {
    hasNextPage,
    tripsWithStops,
  } = await Trip.findAllCreatedBySearchQueryWithStops(
    search,
    +page,
    BROWSE_PAGE_LIMIT
  );

  let nextPageUrl;
  let prevPageUrl;
  if (search) {
    nextPageUrl = `/p/browse?search=${search}&page=${+page + 1}`;
    prevPageUrl = `/p/browse?search=${search}&page=${+page - 1}`;
  } else {
    nextPageUrl = `/p/browse?page=${+page + 1}`;
    prevPageUrl = `/p/browse?page=${+page - 1}`;
  }

  const isDriver = await checkIsDriver(email);

  res.render('browse', {
    title: 'Browse',
    isDriver,
    hasPrevPage: +page !== 1,
    hasNextPage,
    nextPageUrl,
    prevPageUrl,
    search,
    tripsWithStops,
  });
});

module.exports = { browsePageRoutes: router };

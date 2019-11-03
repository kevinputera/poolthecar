const express = require('express');
const { Car } = require('../../models/car');
const { checkIsDriver } = require('../../utils/checkIsDriver');

const router = express.Router();

const CARS_PAGE_LIMIT = 1;

router.get('/', async (req, res) => {
  const { search = '', page = 1 } = req.query;
  const { email } = req.session;

  const { hasNextPage, cars } = await Car.findAllByEmailAndSearchQuery(
    email,
    search,
    +page,
    CARS_PAGE_LIMIT
  );
  const isDriver = await checkIsDriver(email);

  let nextPageUrl;
  let prevPageUrl;
  if (search) {
    nextPageUrl = `/p/cars?search=${search}&page=${+page + 1}`;
    prevPageUrl = `/p/cars?search=${search}&page=${+page - 1}`;
  } else {
    nextPageUrl = `/p/cars?page=${+page + 1}`;
    prevPageUrl = `/p/cars?page=${+page - 1}`;
  }

  res.render('cars', {
    title: 'Cars',
    hasPrevPage: +page !== 1,
    hasNextPage,
    nextPageUrl,
    prevPageUrl,
    search,
    isDriver,
    cars,
  });
});

router.get('/new', async (req, res) => {
  res.render('newCar', { title: 'New car' });
});

router.get('/:license/update', async (req, res) => {
  const { license } = req.params;
  const car = await Car.findByLicense(license);
  res.render('updateCar', {
    title: 'Update car',
    car,
  });
});

module.exports = { carPageRoutes: router };

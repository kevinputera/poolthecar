const express = require('express');
const { Car } = require('../../models/car');
const { checkIsDriver } = require('../../utils/checkIsDriver');

const router = express.Router();

const CARS_PAGE_LIMIT = 15;

router.get('/', async (req, res) => {
  const { search = '', page = 1 } = req.query;
  const { email } = req.session;

  const { hasNextPage, cars } = await Car.findAllByEmailAndSearchQuery(
    email,
    search,
    +page,
    CARS_PAGE_LIMIT
  );

  let nextPageUrl;
  let prevPageUrl;
  if (search) {
    nextPageUrl = `/p/cars?search=${search}&page=${+page + 1}`;
    prevPageUrl = `/p/cars?search=${search}&page=${+page - 1}`;
  } else {
    nextPageUrl = `/p/cars?page=${+page + 1}`;
    prevPageUrl = `/p/cars?page=${+page - 1}`;
  }

  const isDriver = await checkIsDriver(email);

  res.render('car/cars', {
    title: 'Cars',
    isDriver,
    hasPrevPage: +page !== 1,
    hasNextPage,
    nextPageUrl,
    prevPageUrl,
    search,
    cars,
  });
});

router.get('/new', async (req, res) => {
  const isDriver = await checkIsDriver(email);
  res.render('car/newCar', { title: 'New car', isDriver });
});

router.get('/:license/update', async (req, res) => {
  const { license } = req.params;
  const car = await Car.findByLicense(license);
  const isDriver = await checkIsDriver(email);
  res.render('car/updateCar', {
    title: 'Update car',
    isDriver,
    car,
  });
});

module.exports = { carPageRoutes: router };

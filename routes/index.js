const express = require('express');

router = express.Router();

router.get('/', (req, res) => {
  res.render('index', { title: 'Pool the Car', message: 'Welcome' });
});

router.get('/profile', (req, res) => {
  res.render('index', {
    title: 'Pool the Car',
    message: 'Welcome',
    pageShown: 'Profile',
  });
});

router.get('/Trips', (req, res) => {
  res.render('index', {
    title: 'Pool the Car',
    message: 'Welcome',
    pageShown: 'Trips',
  });
});

module.exports = { indexRoutes: router };

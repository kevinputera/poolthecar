const express = require('express');

const router = express.Router();

router.get('/trips', async (req, res) => {
  res.render('trips', { title: 'Trips' });
});

router.get('/account', async (req, res) => {
  res.render('account', { title: 'Account' });
});

module.exports = { pageRoutes: router };

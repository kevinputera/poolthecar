const express = require('express');

const router = express.Router();

router.get('/', async (req, res) => {
  res.render('trips', { title: 'Trips' });
});

module.exports = { tripPageRoutes: router };

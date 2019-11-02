const express = require('express');

const router = express.Router();

router.get('/', async (req, res) => {
  res.render('account', { title: 'Account' });
});

module.exports = { accountPageRoutes: router };

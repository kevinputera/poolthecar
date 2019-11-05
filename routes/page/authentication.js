const express = require('express');

const router = express.Router();

router.get('/login', async (req, res) => {
  res.render('authentication/login', { title: 'Log in' });
});

router.get('/signup', async (req, res) => {
  res.render('authentication/signup', { title: 'Sign up' });
});

module.exports = { authenticationPageRoutes: router };

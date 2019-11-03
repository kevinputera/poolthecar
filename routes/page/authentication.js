const express = require('express');

const router = express.Router();

router.get('/login', async (req, res) => {
  res.render('login', { title: 'Log in', isLoggedIn: false });
});

router.get('/signup', async (req, res) => {
  res.render('signup', { title: 'Sign up', isLoggedIn: false });
});

module.exports = { authenticationPageRoutes: router };

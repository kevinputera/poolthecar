const express = require('express');

const router = express.Router();
const authenticationRouter = express.Router();

authenticationRouter.get('/login', async (req, res) => {
  res.render('login', { title: 'Log in' });
});

authenticationRouter.get('/signup', async (req, res) => {
  res.render('signup', { title: 'Sign up' });
});

router.get('/trips', async (req, res) => {
  res.render('trips', { title: 'Trips' });
});

router.get('/account', async (req, res) => {
  res.render('account', { title: 'Account' });
});

module.exports = {
  authenticationPageRoutes: authenticationRouter,
  pageRoutes: router,
};

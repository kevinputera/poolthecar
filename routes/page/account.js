const express = require('express');
const { User } = require('../../models/user');
const { checkIsDriver } = require('../../utils/checkIsDriver');

const router = express.Router();

router.get('/', async (req, res) => {
  const { email } = req.session;
  const currentUser = await User.findByEmail(email);
  const isDriver = await checkIsDriver(email);
  res.render('account/account', {
    title: 'Account',
    isDriver,
    currentUser,
  });
});

module.exports = { accountPageRoutes: router };

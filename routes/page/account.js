const express = require('express');
const { User } = require('../../models/user');
const { checkIsDriver } = require('../../utils/checkIsDriver');

const router = express.Router();

router.get('/', async (req, res) => {
  const currentUser = await User.findByEmail(req.session.email);
  const isDriver = await checkIsDriver(req.session.email);
  res.render('account', {
    title: 'Account',
    isDriver,
    currentUser,
  });
});

module.exports = { accountPageRoutes: router };

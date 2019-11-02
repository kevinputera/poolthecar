const express = require('express');
const { User } = require('../../models/user');

const router = express.Router();

router.get('/', async (req, res) => {
  const currentUser = await User.findByEmail(req.session.email);
  res.render('account', { title: 'Account', currentUser });
});

module.exports = { accountPageRoutes: router };

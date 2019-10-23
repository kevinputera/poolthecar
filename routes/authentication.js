const express = require('express');
const { SHA256 } = require('crypto-js');
const { User } = require('../models/user');
const {
  okMessage,
  badRequestMessage,
  internalError,
} = require('../utils/response');

const router = express.Router();

router.post('/authenticate', async (req, res) => {
  const { email, secret } = req.body;
  try {
    const user = await User.findByEmail(email);
    if (!user || user.secret !== SHA256(secret).toString()) {
      req.session.email = null;
      badRequestMessage(res, 'Authentication failed');
      return;
    }
    req.session.email = email;
    okMessage(res, 'Authentication successful');
  } catch (error) {
    req.session.email = null;
    internalError(res, error);
  }
});

router.post('/deauthenticate', async (req, res) => {
  req.session.email = null;
  okMessage(res, 'Deauthentication successful');
});

module.exports = { authenticationRoutes: router };

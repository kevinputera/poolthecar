const express = require('express');
const { SHA256 } = require('crypto-js');
const { User } = require('../models/user');

const router = express.Router();

router.post('/authenticate', async (req, res) => {
  const { email, secret } = req.body;
  try {
    const user = await User.findByEmail(email);
    if (!user || user.secret !== SHA256(secret).toString()) {
      req.session.email = null;
      res.status(401).send('Authentication failed');
      return;
    }
    req.session.email = email;
    res.send('Authentication successful');
  } catch (error) {
    req.session.email = null;
    res.status(500).send(error.message);
  }
});

router.post('/deauthenticate', async (req, res) => {
  req.session.email = null;
  res.send('Deauthentication successful');
});

module.exports = { authenticationRoutes: router };

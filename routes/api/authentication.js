const express = require('express');
const { SHA256 } = require('crypto-js');
const { User } = require('../../models/user');
const { redirect, internalError } = require('../../utils/response');

const router = express.Router();

router.post('/authenticate', async (req, res) => {
  const { email, secret } = req.body;
  try {
    const user = await User.findByEmail(email);
    if (!user || user.secret !== SHA256(secret).toString()) {
      req.session.email = null;
      redirect(res, '/p/auth/login');
      return;
    }
    req.session.email = email;
    redirect(res, '/p/trips');
  } catch (error) {
    req.session.email = null;
    internalError(res, error);
  }
});

router.post('/deauthenticate', async (req, res) => {
  req.session.email = null;
  redirect(res, '/p/auth/login');
});

module.exports = { authenticationRoutes: router };

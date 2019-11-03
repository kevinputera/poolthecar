const express = require('express');
const { SHA256 } = require('crypto-js');
const { User } = require('../../models/user');
const { Driver } = require('../../models/driver');
const {
  redirect,
  badRequestMessage,
  internalError,
} = require('../../utils/response');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, secret } = req.body;
  try {
    const user = await User.findByEmail(email);
    if (!user || user.secret !== SHA256(secret).toString()) {
      req.session.email = null;
      badRequestMessage(res, 'Login failed');
      return;
    }
    req.session.email = email;
    redirect(res, '/p/browse');
  } catch (error) {
    req.session.email = null;
    console.log(error);
    internalError(res, error);
  }
});

router.post('/new', async (req, res) => {
  const { email, secret, name, gender, phone, profilePhotoUrl } = req.body;
  try {
    const user = new User(email, secret, name, gender, phone, profilePhotoUrl);
    const newUser = await user.save();
    req.session.email = email;
    redirect(res, '/p/browse');
  } catch (error) {
    req.session.email = null;
    internalError(res, error);
  }
});

router.post('/logout', async (req, res) => {
  req.session.email = null;
  redirect(res, '/p/auth/login');
});

module.exports = { authenticationRoutes: router };

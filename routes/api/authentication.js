const express = require('express');
const { SHA256 } = require('crypto-js');
const { User } = require('../../models/user');
const {
  ok,
  okMessage,
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
    ok(res, 'Login successful');
  } catch (error) {
    req.session.email = null;
    internalError(res, error);
  }
});

router.post('/new', async (req, res) => {
  const { email, secret, name, gender, phone, profilePhotoUrl } = req.body;
  try {
    const user = new User(email, secret, name, gender, phone, profilePhotoUrl);
    const newUser = await user.save();
    req.session.email = email;
    okMessage(res, newUser);
  } catch (error) {
    req.session.email = null;
    internalError(res, error);
  }
});

router.post('/logout', async (req, res) => {
  req.session.email = null;
  okMessage(res, 'Logout successful');
});

module.exports = { authenticationRoutes: router };

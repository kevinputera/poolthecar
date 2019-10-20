const express = require('express');
const { User } = require('../models/user');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post('/', async (req, res) => {
  const { email, secret, name, gender, phone, profilePhotoUrl } = req.body;
  try {
    const user = new User(email, secret, name, gender, phone, profilePhotoUrl);
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = { userRoutes: router };

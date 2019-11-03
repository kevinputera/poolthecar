const express = require('express');
const { User } = require('../../models/user');
const { ok, badRequestMessage } = require('../../utils/response');

const router = express.Router();

router.put('/', async (req, res) => {
  const { email } = req.session;
  const { name, gender, phone, profilePhotoUrl } = req.body;
  try {
    const user = await User.findByEmail(email);

    if (!user) {
      badRequestMessage(res, 'User does not exist');
      return;
    }

    user.name = name;
    user.gender = gender;
    user.phone = phone;
    user.profilePhotoUrl = profilePhotoUrl;
    const updatedUser = await user.update();

    ok(res, updatedUser);
  } catch (error) {
    internalEror(res, error);
  }
});

module.exports = { userRoutes: router };

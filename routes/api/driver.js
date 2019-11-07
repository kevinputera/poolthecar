const express = require('express');
const { Driver } = require('../../models/driver');
const { okMessage, internalError } = require('../../utils/response');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email } = req.session;
  try {
    await Driver.register(email);
    okMessage(res, 'Registered as driver');
  } catch (error) {
    internalError(res, error);
  }
});

module.exports = { driverRoutes: router };

const { Driver } = require('../models/driver');

const checkIsDriver = async email => {
  const driver = await Driver.findByEmail(email);
  if (driver) {
    return true;
  }
  return false;
};

module.exports = { checkIsDriver };

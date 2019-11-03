const { Driver } = require('../models/driver');

const checkIsDriver = async email => {
  const driver = await Driver.findByEmailWithUser(email);
  if (driver) {
    return true;
  }
  return false;
};

module.exports = { checkIsDriver };

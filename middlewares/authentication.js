const { redirect } = require('../utils/response');

const requireAuthentication = (req, res, next) => {
  if (!req.session.email) {
    redirect(res, '/p/auth/login');
    return;
  }
  next();
};

module.exports = { requireAuthentication };

const requireAuthentication = (req, res, next) => {
  if (!req.session.email) {
    // TODO: Change this to a redirection response to login page
    res.status(401).send('Unauthorized');
    return;
  }
  next();
};

module.exports = { requireAuthentication };

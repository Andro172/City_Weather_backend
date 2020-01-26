const checkAdmin = (req, res, next) => {
  if (req.user.roles.indexOf('admin') === -1) {
    return res.status(401).send({
      success: false,
      error: 'user is not admin',
    });
  }
  return next();
};

module.exports = checkAdmin;

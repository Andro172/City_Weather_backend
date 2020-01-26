/* eslint-disable consistent-return */
const jwt = require('../services/JWT.service');
const config = require('../config/authConfig');

const checkToken = (req, res, next) => {
  if (config.authExceptions.indexOf(req.url) !== -1) {
    // If route is public
    next();
  } else {
    // Get token from request headers
    let token = req.headers.authorization;
    if (token && token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    }
    if (token) {
      const authUser = jwt.validateToken(token);
      if (!authUser) {
        return res.status(401).send({
          success: false,
          error: 'invalid_token',
        });
      }
      // Set decoded user from token as req.user
      req.user = authUser;
      next();
    } else {
      return res.status(401).send({ success: false, error: 'no_token' });
    }
  }
};

module.exports = checkToken;

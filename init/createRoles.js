require('dotenv').config();
const debug = require('debug')('server:init');
const mongoose = require('mongoose');
const db = require('../database');
const roles = require('../config/roles');

async function init() {
  try {
    const promises = [];
    roles.forEach((name) => {
      const role = new db.Role({
        name,
      });
      promises.push(role.save());
    });

    await Promise.all(promises);
    process.exit(0);
  } catch (err) {
    debug(err);
  }
}

mongoose.connection.on('connected', () => {
  debug('Mongoose default connection open');
  init();
});

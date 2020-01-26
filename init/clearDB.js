require('dotenv').config();
const debug = require('debug')('server:init');
const mongoose = require('mongoose');
const db = require('../database');


async function init() {
  try {
    await Promise.all([
      db.User.deleteMany(),
      db.Role.deleteMany(),
      db.City.deleteMany(),
    ]);
    process.exit(0);
  } catch (err) {
    process.exit(2);
  }
}

mongoose.connection.on('connected', () => {
  debug('Mongoose default connection open');
  init();
});

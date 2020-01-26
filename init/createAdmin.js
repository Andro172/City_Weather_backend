require('dotenv').config();
const debug = require('debug')('server:init');
const mongoose = require('mongoose');
const db = require('../database');

const username = process.argv[2];

async function init() {
  try {
    const user = await db.User.findOne({ username });
    if (!user) {
      debug("couldn't set admin, user not found");
      process.exit(1);
    }
    const adminRole = await db.Role.findOne({ name: 'admin' });
    if (user.roles.indexOf(adminRole._id) === -1) {
      user.roles.push(adminRole._id);
      user.markModified('roles');
      await user.save();
    }
    debug(user.username, 'is set as admin!');
    process.exit(0);
  } catch (err) {
    debug(err, 'create admin error');
    process.exit(2);
  }
}

mongoose.connection.on('connected', () => {
  debug('Mongoose default connection open');
  init();
});

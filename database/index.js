const debug = require('debug')('server:mongo');
const mongoose = require('mongoose');
const User = require('./Schemas/user');
const City = require('./Schemas/city');
const Role = require('./Schemas/role');

// Build the connection string
const dbURI = `mongodb://${process.env.MONGODB_IP}/${process.env.DATABASE_NAME}`;

// Create the database connection
mongoose.connect(dbURI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', () => {
  debug(`Mongoose default connection open to ${dbURI}`);
});

// If the connection throws an error
mongoose.connection.on('error', (err) => {
  debug(`Mongoose default connection error: ${err}`);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', () => {
  debug('Mongoose default connection disconnected');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    debug('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});

// BRING IN YOUR SCHEMAS & MODELS //
module.exports = {
  User,
  City,
  Role,
};

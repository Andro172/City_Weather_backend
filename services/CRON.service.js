/* eslint-disable no-restricted-syntax */
const debug = require('debug')('server:cron');
const mongoose = require('mongoose');
const cron = require('node-cron');
const db = require('../database');
const WeatherService = require('./Weather.service');
const io = require('./Socket.service');

async function updateWeather() {
  debug('cron job started - update weather');
  // Mongoose async iterator
  for await (const city of db.City.find()) {
    const weatherInfo = await WeatherService.getWeatherById(city.apiId);
    let grow = null;
    // If temperature changed
    if (weatherInfo.temp !== city.temp) {
      grow = weatherInfo.temp > city.temp ? 'up' : 'down';
    }
    city.tempGrows = grow;
    city.temp = weatherInfo.temp;
    city.humidity = weatherInfo.humidity;
    city.pressure = weatherInfo.pressure;
    city.description = weatherInfo.description;
    city.weatherCode = weatherInfo.weathercode;

    // emit to all users listening this city
    io.to(String(city._id)).emit(String(city._id), city);

    await city.save();
  }
  debug('cron job finnished - update weather');
}

mongoose.connection.on('connected', () => {
  updateWeather();
  cron.schedule('*/10 * * * *', updateWeather); // Every 10 minutes
});

mongoose.connection.on('disconnected', () => {
  process.exit();
});

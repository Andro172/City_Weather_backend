/* eslint-disable no-restricted-syntax */
/* eslint-disable consistent-return */
/* eslint-disable no-await-in-loop */
const express = require('express');
const debug = require('debug')('server:api');
const db = require('../database');
const Weather = require('../services/Weather.service');

const router = express.Router();

/**
 * Get all non admin users
 */
router.get('/all_users', async (req, res) => {
  try {
    const usersToSend = [];
    const adminRoleId = (await db.Role.findOne({ name: 'admin' }))._id;

    // Mongoose async iterator
    for await (const user of db.User.find()) {
      if (user.roles.indexOf(adminRoleId) === -1) {
        usersToSend.push({
          _id: user._id,
          username: user.username,
          email: user.email,
          cities: user.cities.length,
        });
      }
    }

    res.status(200).send({
      success: true,
      users: usersToSend,
    });
  } catch (err) {
    debug(err.message);
    res.status(500).send({
      success: false,
      error: err.message,
    });
  }
});

/**
 * Delete user
 */
router.delete('/delete_user/:id', async (req, res) => {
  try {
    const user = await db.User.findOne({ _id: req.params.id });

    // Removue user reference from cities
    const citySavePromises = [];
    for await (const city of db.City.find(user.cities)) {
      city.users.remove(user._id);
      city.markModified('users');
      citySavePromises.push(city.save());
    }

    await Promise.all([
      ...citySavePromises,
      db.User.deleteOne({ _id: user._id }),
    ]);

    res.status(200).send({
      success: true,
    });
  } catch (err) {
    debug(err.message);
    res.status(500).send({
      success: false,
      error: err.message,
    });
  }
});

/**
 * Update user
 */
router.put('/update_user', async (req, res) => {
  const { form } = req.body;
  try {
    const user = await db.User.findOne({ _id: form._id });
    // Check for email and username change and availability
    if (user.email !== form.email) {
      if (await db.User.findOne({ email: form.email })) {
        return res.status(400).send({
          success: false,
          error: 'user with that email already exists',
        });
      }
    } else if (user.username !== form.username) {
      if (await db.User.findOne({ username: form.username })) {
        return res.status(400).send({
          success: false,
          error: 'user with that username already exists',
        });
      }
    }

    // set username and email
    user.username = form.username;
    user.email = form.email;

    const promises = [];
    if (form.city) {
      const id = form.cityId ? form.cityId : await Weather.getCityId(form.city);
      const cityWeather = await Weather.getWeatherById(id);
      if (!cityWeather) {
        return res.status(404).send({
          success: false,
          error: 'wrong city id',
        });
      }

      let city = await db.City.findOne({ apiId: id });
      if (!city) {
        // If city is not in database, make new
        city = new db.City({
          name: form.city,
          apiId: id,
          temp: cityWeather.temp,
          humidity: cityWeather.humidity,
          pressure: cityWeather.pressure,
          description: cityWeather.description,
          weatherCode: cityWeather.weathercode,
        });
      }

      // Add reference to user
      if (city.users.indexOf(user._id) === -1) {
        city.users.push(user._id);
        city.markModified('users');
        promises.push(city.save());
      }
      // Set user city
      if (user.cities.indexOf(city._id) === -1) {
        user.cities.push(city._id);
        user.markModified('cties');
      }
    }

    promises.push(user.save());
    // Wait for all promises
    await Promise.all(promises);

    res.status(200).send({
      success: true,
    });
  } catch (err) {
    debug(err.message);
    res.status(500).send({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;

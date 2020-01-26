/* eslint-disable no-restricted-syntax */
/* eslint-disable consistent-return */
const express = require('express');
const debug = require('debug')('server:api');
const db = require('../database');
const jwt = require('../services/JWT.service');
const Weather = require('../services/Weather.service');

const router = express.Router();

// Test token validity
router.get('/me', async (req, res) => {
  const decodedUser = req.user;
  res.status(200).send({
    username: decodedUser.username,
    roles: decodedUser.roles,
  });
});

/**
 * Add new city
 */
router.put('/add_city', async (req, res) => {
  const decodedUser = req.user;
  const { form } = req.body;
  try {
    // Get city apiId and check if valid
    const id = form.cityId ? form.cityId : await Weather.getCityId(form.city);
    const cityWeather = await Weather.getWeatherById(id);
    if (!cityWeather) {
      return res.status(404).send({
        success: false,
        error: 'wrong city id',
      });
    }
    // If apiId is valid check if city is already in database
    let city = await db.City.findOne({ apiId: id });
    if (!city) {
      // If not, make new city
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

    const user = await db.User.findOne({ _id: decodedUser._id });

    // Check if city already saved to user
    if (user.cities.indexOf(city._id) !== -1) {
      return res.status(400).send({
        success: false,
        error: 'You are already tracking weather for that city!',
      });
    }

    const promises = [];
    // Add user reference to city
    if (city.users.indexOf(user._id) === -1) {
      city.users.push(user._id);
      city.markModified('users');
    }
    promises.push(city.save());

    // Set user city
    user.cities.push(city._id);
    user.markModified('cities');
    promises.push(user.save());

    await Promise.all(promises);

    return res.status(200).send({
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
 * Remove user city
 */
router.put('/remove_city/:id', async (req, res) => {
  const decodedUser = req.user;
  try {
    const city = await db.City.findOne({ _id: req.params.id });
    if (!city) {
      return res.status(400).send({
        success: false,
        error: 'City not found!',
      });
    }

    const promises = [];
    const user = await db.User.findOne({ _id: decodedUser._id });

    // Remove user reference in city
    city.users.remove(user._id);
    city.markModified('users');
    promises.push(city.save());

    // Remove city reference in user
    user.cities.remove(city._id);
    user.markModified('cities');
    promises.push(user.save());

    await Promise.all(promises);

    return res.status(200).send({
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
 * Change user password
 */
router.put('/change_password', async (req, res) => {
  const decodedUser = req.user;
  const { form } = req.body;
  try {
    const user = await db.User.findOne({ _id: decodedUser._id });

    // Check if old password is valid
    const isPassValid = await jwt.ComparePasswords(form.oldPassword, user.password);
    if (!isPassValid) {
      return res.status(401).send({
        success: false,
        error: 'old password mismatch',
      });
    }

    // Hash new password and save
    user.password = await jwt.HashPassword(form.newPassword);
    await user.save();

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
 * Delete user account
 */
router.delete('/delete_me', async (req, res) => {
  const decodedUser = req.user;
  try {
    const user = await db.User.findOne({ _id: decodedUser._id });

    // Remove reference in current cities
    const citySavePromises = [];
    for await (const city of db.City.find(user.cities)) {
      city.users.remove(user._id);
      city.markModified('users');
      citySavePromises.push(city.save());
    }

    // Save city and delete user
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

module.exports = router;

/* eslint-disable consistent-return */
const express = require('express');
const debug = require('debug')('server:api');
const db = require('../database');
const Weather = require('../services/Weather.service');
const jwt = require('../services/JWT.service');

const router = express.Router();

/**
 * Register user
 */
router.post('/register', async (req, res) => {
  const { form } = req.body;
  try {
    // Check if email and username is available
    if (await db.User.findOne({
      $or: [
        { email: form.email },
        { username: form.username.toLowerCase() },
      ],
    })) {
      return res.status(400).send({
        success: false,
        error: 'user with that email or username already registered',
      });
    }

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

    // Make new user with user role
    const role = await db.Role.findOne({ name: 'user' });
    const hashedPass = await jwt.HashPassword(form.password);
    const user = new db.User({
      username: form.username.toLowerCase(),
      email: form.email,
      password: hashedPass,
    });
    user.cities.push(city._id);
    user.markModified('cities');
    user.roles.push(role._id);
    user.markModified('roles');

    // Add user reference to city
    city.users.push(user._id);
    city.markModified('users');

    // Wait until saved
    await Promise.all([
      city.save(),
      user.save(),
    ]);

    debug(user.username, 'has registered');
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
 * Login user
 */
router.post('/login', async (req, res) => {
  const { form } = req.body;
  try {
    // Check if user exists
    const user = await db.User.findOne({
      $or: [
        { email: form.emailOrUsername },
        { username: form.emailOrUsername },
      ],
    });

    if (!user) {
      return res.status(404).send({
        success: false,
        error: 'user not registered',
      });
    }

    // Check if password is valid
    const isPassValid = await jwt.ComparePasswords(form.password, user.password);
    if (!isPassValid) {
      return res.status(401).send({
        success: false,
        error: 'password mismatch',
      });
    }

    const roles = await db.Role.find({ _id: user.roles });
    const roleNames = roles.map((role) => role.name);

    // Generate token
    const tokenUser = {
      _id: user._id,
      username: user.username,
      roles: roleNames,
    };
    const token = jwt.GenerateToken(tokenUser, 86400); // valid for 24 hours

    debug(user.username, 'has logged in');
    res.status(200).send({
      success: true,
      token,
      user: {
        username: user.username,
        roles: roleNames,
      },
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

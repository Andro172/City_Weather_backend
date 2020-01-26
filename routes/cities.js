/* eslint-disable consistent-return */
const express = require('express');
const debug = require('debug')('server:api');
const db = require('../database');
const Weather = require('../services/Weather.service');

const router = express.Router();

/**
 * Test if city can be found just by name
 */
router.post('/test-name', async (req, res) => {
  const { name } = req.body;
  try {
    const id = await Weather.getCityId(name);
    if (!id) {
      return res.status(404).send({
        success: false,
        error: 'city not found!',
      });
    }
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
 * Get user cities ids
 */
router.get('/my', async (req, res) => {
  const decodedUser = req.user;
  try {
    const user = await db.User.findOne({ _id: decodedUser._id });

    res.status(200).send({
      success: true,
      cities: user.cities,
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
 * Get city info from id
 */
router.get('/city_info/:id', async (req, res) => {
  try {
    const city = await db.City.findOne({ _id: req.params.id });
    if (!city) {
      return res.status(404).send({
        success: false,
        error: 'city not found!',
      });
    }

    res.status(200).send({
      success: true,
      city,
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

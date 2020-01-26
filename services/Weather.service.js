const weather = require('openweather-apis');

class WeatherService {
  constructor() {
    this.weather = weather;
    this.init();
  }

  /**
   * Initialize with API_KEY and english language
   */
  init() {
    this.weather.setAPPID(process.env.WEATHER_API_KEY);
    this.weather.setLang('en');
  }

  /**
   * Get city id from city name
   * @param {string} name
   * @returns {promise}
   */
  getCityId(name) {
    return new Promise((resolve, reject) => {
      this.weather.setCityId(null);
      this.weather.setCity(name);
      this.weather.getAllWeather((err, allInfo) => {
        if (err) {
          reject(err);
        }
        resolve(allInfo.id);
      });
    });
  }

  /**
   * Get weather info with city id
   * @param {number} id
   * @returns {promise}
   */
  getWeatherById(id) {
    return new Promise((resolve, reject) => {
      this.weather.setCityId(id);
      this.weather.getSmartJSON((err, info) => {
        if (err) {
          reject(err);
        }
        resolve(info);
      });
    });
  }
}

module.exports = new WeatherService();

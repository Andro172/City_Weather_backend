const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const saltRounds = 10;

class JWT {
  /**
   * Validate token
   * @param {string} token
   * @returns {object}
   */
  static validateToken(token) {
    let buffer = null;
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
      if (err) {
        return;
      }
      buffer = decoded;
    });
    if (!buffer) {
      return null;
    }
    const user = JSON.parse(buffer.user);
    const exp = new Date(buffer.exp * 1000); // to turn it into miliseconds;
    const now = new Date();
    // If token expired return null
    if (exp <= now) {
      return null;
    }
    return user;
  }

  /**
   * Compare password with hashed password
   * @param {string} password
   * @param {string} hash
   * @returns {boolean}
   */
  static async ComparePasswords(password, hash) {
    const match = await bcrypt.compare(password, hash);
    return match;
  }

  /**
   * Generate token
   * @param {object} info
   * @param {number} expire // Milliseconds
   * @returns {string}
   */
  static GenerateToken(info, expire) {
    return jwt.sign({ user: JSON.stringify(info) }, process.env.SECRET, { expiresIn: expire });
  }

  /**
   * Hash password
   * @param {string} password
   * @returns {string}
   */
  static async HashPassword(password) {
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
  }
}

module.exports = JWT;

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, index: true, text: true },
  email: { type: String, index: true, text: true },
  password: { type: String },
  cities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'City' }],
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
});

userSchema.index({ name: 'text', email: 'text' });

module.exports = mongoose.model('User', userSchema);

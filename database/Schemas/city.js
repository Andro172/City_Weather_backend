const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  name: { type: String, index: true, text: true },
  apiId: { type: Number },
  temp: Number,
  humidity: Number,
  pressure: Number,
  description: String,
  weatherCode: Number,
  tempGrows: String,
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

citySchema.index({ name: 'text' });

module.exports = mongoose.model('City', citySchema);

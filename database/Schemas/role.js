const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { type: String, index: true, text: true },
});

roleSchema.index({ name: 'text' });

module.exports = mongoose.model('Role', roleSchema);

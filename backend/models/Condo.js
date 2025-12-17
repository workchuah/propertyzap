const mongoose = require('mongoose');

// Flexible schema: keep all CSV columns as-is
const condoSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model('Condo', condoSchema);



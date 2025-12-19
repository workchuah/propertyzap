const mongoose = require('mongoose');

// Flexible schema: keep all CSV columns as-is
const newProjectSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model('NewProject', newProjectSchema);


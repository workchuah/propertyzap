const mongoose = require('mongoose');

// Flexible schema for PropertyZap_PastTransaction.csv
const pastTransactionSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model('PastTransaction', pastTransactionSchema);



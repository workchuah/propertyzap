const mongoose = require('mongoose');

// Flexible schema for PropertyZap_All_Ads.csv
const adListingSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model('AdListing', adListingSchema);



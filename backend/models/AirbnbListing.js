const mongoose = require('mongoose');

// Flexible schema for PropertyZap_Airbnb.csv
const airbnbListingSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model('AirbnbListing', airbnbListingSchema);



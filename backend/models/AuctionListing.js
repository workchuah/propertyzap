const mongoose = require('mongoose');

// Flexible schema: keep all CSV columns as-is
const auctionListingSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model('AuctionListing', auctionListingSchema);


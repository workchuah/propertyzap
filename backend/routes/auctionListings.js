const express = require('express');
const router = express.Router();
const AuctionListing = require('../models/AuctionListing');

// GET /api/auction-listings - Get all auction listings (optionally filter by apartment name or coordinates)
router.get('/', async (req, res) => {
  try {
    const { apartmentName, lat, lng, radius } = req.query;
    let filter = {};

    // Filter by apartment name (case-insensitive partial match)
    if (apartmentName) {
      filter['Apartment Name'] = { $regex: apartmentName, $options: 'i' };
    }

    // Filter by coordinates within radius (in meters)
    if (lat && lng && radius) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      const radiusNum = parseFloat(radius);

      // MongoDB geospatial query (requires 2dsphere index, but we'll do a simple filter for now)
      // For more accurate results, you'd want to use $geoNear or create a 2dsphere index
      filter.latitude = { $exists: true, $ne: '' };
      filter.longitude = { $exists: true, $ne: '' };
    }

    const listings = await AuctionListing.find(filter).lean();
    
    // If coordinates are provided, filter by distance
    let filteredListings = listings;
    if (lat && lng && radius) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      const radiusNum = parseFloat(radius);

      filteredListings = listings.filter(listing => {
        const listingLat = parseFloat(listing.latitude);
        const listingLng = parseFloat(listing.longitude);
        
        if (isNaN(listingLat) || isNaN(listingLng)) return false;

        // Calculate distance using Haversine formula
        const R = 6371000; // Earth radius in meters
        const dLat = (listingLat - latNum) * Math.PI / 180;
        const dLng = (listingLng - lngNum) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(latNum * Math.PI / 180) * Math.cos(listingLat * Math.PI / 180) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return distance <= radiusNum;
      });
    }

    res.json(filteredListings);
  } catch (err) {
    console.error('Get auction listings error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


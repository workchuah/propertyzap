const express = require('express');
const router = express.Router();
const Property = require('../models/Property');

// GET /api/properties
// Optional query params: ownerName, ownerRole
router.get('/', async (req, res) => {
  try {
    const { ownerName, ownerRole } = req.query;
    const filter = {};
    if (ownerName) {
      // Normalize ownerName to lowercase for consistent querying
      filter.ownerName = ownerName.toLowerCase().trim();
    }
    if (ownerRole) {
      filter.ownerRole = ownerRole;
    }

    console.log('GET /api/properties - Query params:', { ownerName, ownerRole });
    console.log('GET /api/properties - Normalized filter:', filter);

    const properties = await Property.find(filter).sort({ createdAt: -1 }).lean();
    console.log('GET /api/properties - Found properties:', properties.length);
    if (properties.length > 0) {
      console.log('GET /api/properties - Sample property:', {
        id: properties[0]._id,
        ownerName: properties[0].ownerName,
        ownerRole: properties[0].ownerRole,
        address: properties[0].address
      });
    }
    res.json(properties);
  } catch (err) {
    console.error('Get properties error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/properties/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id).lean();
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json(property);
  } catch (err) {
    console.error('Get property by id error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/properties
// Create new or update existing (if body.id is provided)
router.post('/', async (req, res) => {
  try {
    const {
      id,
      ownerName,
      ownerRole,
      address,
      unitNumber,
      askingPrice,
      landArea,
      buildUpSize,
      numBedroom,
      numBathroom,
      numCarpark,
      lat,
      lng,
      photoData
    } = req.body;

    console.log('POST /api/properties - Received data:', {
      id,
      ownerName,
      ownerRole,
      address
    });

    const payload = {
      ownerName: ownerName ? ownerName.toLowerCase().trim() : ownerName, // Normalize to lowercase
      ownerRole: ownerRole || 'seller', // Default to 'seller' if not provided
      address,
      unitNumber,
      askingPrice,
      landArea,
      buildUpSize,
      numBedroom,
      numBathroom,
      numCarpark,
      lat,
      lng,
      photoData
    };

    console.log('POST /api/properties - Payload:', payload);

    let property;
    if (id) {
      property = await Property.findByIdAndUpdate(
        id,
        { $set: payload },
        { new: true }
      );
    } else {
      property = await Property.create(payload);
    }

    console.log('POST /api/properties - Saved property:', {
      id: property._id,
      ownerName: property.ownerName,
      ownerRole: property.ownerRole
    });

    res.status(id ? 200 : 201).json(property);
  } catch (err) {
    console.error('Save property error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/properties/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Property.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json({ message: 'Property deleted' });
  } catch (err) {
    console.error('Delete property error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;



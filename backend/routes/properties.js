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
      filter.ownerName = ownerName;
    }
    if (ownerRole) {
      filter.ownerRole = ownerRole;
    }

    const properties = await Property.find(filter).sort({ createdAt: -1 }).lean();
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

    const payload = {
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
    };

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



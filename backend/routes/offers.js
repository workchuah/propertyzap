const express = require('express');
const router = express.Router();
const Offer = require('../models/Offer');
const Property = require('../models/Property');

// POST /api/offers - Create a new offer
router.post('/', async (req, res) => {
  try {
    const { propertyId, buyerName, buyerEmail, offerAmount } = req.body;

    if (!propertyId || !buyerName || !offerAmount) {
      return res.status(400).json({ message: 'Property ID, buyer name, and offer amount are required' });
    }

    // Verify property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const offer = await Offer.create({
      propertyId,
      buyerName: buyerName.toLowerCase().trim(),
      buyerEmail,
      offerAmount: parseFloat(offerAmount),
      status: 'pending'
    });

    res.status(201).json(offer);
  } catch (err) {
    console.error('Create offer error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/offers/:id - Update offer status (seller actions)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, counterOfferAmount, sellerResponse } = req.body;

    const update = {};
    if (status) {
      update.status = status;
    }
    if (counterOfferAmount !== undefined) {
      update.counterOfferAmount = parseFloat(counterOfferAmount);
      if (status !== 'counter-offer') {
        update.status = 'counter-offer';
      }
    }
    if (sellerResponse !== undefined) {
      update.sellerResponse = sellerResponse;
    }

    const offer = await Offer.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    );

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    res.json(offer);
  } catch (err) {
    console.error('Update offer error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/offers - Get offers (filterable by propertyId or buyerName)
router.get('/', async (req, res) => {
  try {
    const { propertyId, buyerName } = req.query;
    const filter = {};
    if (propertyId) {
      filter.propertyId = propertyId;
    }
    if (buyerName) {
      filter.buyerName = buyerName.toLowerCase().trim();
    }

    const offers = await Offer.find(filter).sort({ createdAt: -1 }).lean();
    res.json(offers);
  } catch (err) {
    console.error('Get offers error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


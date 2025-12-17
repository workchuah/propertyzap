const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    buyerName: { type: String, required: true },
    buyerEmail: { type: String },
    offerAmount: { type: Number, required: true },
    message: { type: String },
    status: { type: String, enum: ['pending', 'kiv', 'accepted', 'rejected', 'counter-offer', 'withdrawn'], default: 'pending' },
    counterOfferAmount: { type: Number }, // Seller's counter offer
    sellerResponse: { type: String } // Additional seller response/notes
  },
  { timestamps: true }
);

module.exports = mongoose.model('Offer', offerSchema);


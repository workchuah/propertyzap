const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    buyerName: { type: String, required: true },
    buyerEmail: { type: String },
    offerAmount: { type: Number, required: true },
    message: { type: String },
    status: { type: String, enum: ['pending', 'accepted', 'rejected', 'withdrawn'], default: 'pending' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Offer', offerSchema);


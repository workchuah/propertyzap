const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    ownerName: { type: String },
    ownerRole: { type: String, enum: ['buyer', 'seller'], default: 'seller' },
    address: { type: String, required: true },
    unitNumber: { type: String },
    askingPrice: { type: Number },
    landArea: { type: Number },
    buildUpSize: { type: Number },
    numBedroom: { type: Number },
    numBathroom: { type: Number },
    numCarpark: { type: Number },
    lat: { type: Number },
    lng: { type: Number },
    photoData: { type: String }, // base64 string (for demo only)
    extra: { type: mongoose.Schema.Types.Mixed }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Property', propertySchema);



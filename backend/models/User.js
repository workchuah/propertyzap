const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true }, // NOTE: plain text for demo; use bcrypt for real apps
    role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
    name: { type: String },
    email: { type: String },
    profile: { type: mongoose.Schema.Types.Mixed },       // freeCashFlow, value ranges, etc.
    pinnedLocations: [{ type: mongoose.Schema.Types.Mixed }],
    monitoredCondos: [{ type: mongoose.Schema.Types.Mixed }],  // User-specific monitored condos
    // Filter preferences
    purpose: { type: String, enum: ['own-stay', 'investment'], default: 'own-stay' },
    budgetMin: { type: Number },
    budgetMax: { type: Number },
    propertySizeMin: { type: Number },
    propertySizeMax: { type: Number },
    investmentType: { type: String, enum: ['long-stay', 'short-stay'] },
    minimumROI: { type: Number }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);



require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const propertyRoutes = require('./routes/properties');
const offerRoutes = require('./routes/offers');
const auctionListingRoutes = require('./routes/auctionListings');
const newProjectRoutes = require('./routes/newProjects');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // allow base64 images
app.use(morgan('dev'));

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'PropertyZap backend is running' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/auction-listings', auctionListingRoutes);
app.use('/api/new-projects', newProjectRoutes);

// MongoDB connection
async function start() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set. Please configure it in your environment or .env file.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB Atlas');

    app.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB', err);
    process.exit(1);
  }
}

start();



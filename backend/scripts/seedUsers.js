// backend/scripts/seedUsers.js
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set in backend/.env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  const users = [
    {
      username: 'buyer',
      password: 'buyer',  // plain text demo
      role: 'buyer',
      name: 'Demo Buyer',
      email: 'buyer@example.com'
    },
    {
      username: 'seller',
      password: 'seller',
      role: 'seller',
      name: 'Demo Seller',
      email: 'seller@example.com'
    }
  ];

  for (const u of users) {
    const existing = await User.findOne({ username: u.username });
    if (existing) {
      console.log(`ℹ️  User '${u.username}' already exists, skipping`);
    } else {
      await User.create(u);
      console.log(`✅ Created user '${u.username}'`);
    }
  }

  await mongoose.disconnect();
  console.log('🎉 Seeding done');
  process.exit(0);
}

main().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
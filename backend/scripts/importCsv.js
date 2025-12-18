const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const Condo = require('../models/Condo');
const AdListing = require('../models/AdListing');
const PastTransaction = require('../models/PastTransaction');
const AirbnbListing = require('../models/AirbnbListing');
const AuctionListing = require('../models/AuctionListing');

function splitCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]).map(h => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitCsvLine(lines[i]);
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] !== undefined ? values[idx] : '';
    });
    rows.push(obj);
  }

  return rows;
}

async function importFile(relativePath, Model, label) {
  const fullPath = path.join(__dirname, '..', '..', 'frontend', relativePath);
  console.log(`\n📄 Importing ${label} from ${fullPath} ...`);

  try {
    const csvText = await fs.readFile(fullPath, 'utf8');
    const docs = parseCsv(csvText);
    console.log(`   Parsed ${docs.length} rows.`);

    if (!docs.length) return;

    await Model.deleteMany({});
    const result = await Model.insertMany(docs, { ordered: false });
    console.log(`   ✅ Inserted ${result.length} ${label} records.`);
  } catch (err) {
    console.error(`   ❌ Error importing ${label}:`, err.message || err);
  }
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set in backend/.env');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  await importFile('condos-sample.csv', Condo, 'condos');
  await importFile('PropertyZap_All_Ads.csv', AdListing, 'ads');
  await importFile('PropertyZap_PastTransaction.csv', PastTransaction, 'past transactions');
  await importFile('PropertyZap_Airbnb.csv', AirbnbListing, 'Airbnb listings');
  await importFile('PropertyZap_Auction_listings.csv', AuctionListing, 'auction listings');

  await mongoose.disconnect();
  console.log('\n🎉 Import completed.');
  process.exit(0);
}

main().catch(err => {
  console.error('Unexpected error during import:', err);
  process.exit(1);
});



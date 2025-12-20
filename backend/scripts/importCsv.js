const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const Condo = require('../models/Condo');
const AdListing = require('../models/AdListing');
const PastTransaction = require('../models/PastTransaction');
const AirbnbListing = require('../models/AirbnbListing');
const AuctionListing = require('../models/AuctionListing');
const NewProject = require('../models/NewProject');

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

    if (!docs.length) {
      console.log(`   ⚠️  No documents to import.`);
      return;
    }

    // Log first document structure for debugging
    if (docs.length > 0) {
      console.log(`   📋 Sample document keys:`, Object.keys(docs[0]).slice(0, 10).join(', '), '...');
    }

    await Model.deleteMany({});
    
    // Clean and validate documents before insertion
    const cleanedDocs = docs.map((doc, index) => {
      const cleaned = {};
      for (const [key, value] of Object.entries(doc)) {
        // Remove empty keys or keys with only whitespace
        if (key && key.trim()) {
          const cleanKey = key.trim();
          
          // Rename 'id' to 'project_id' to avoid MongoDB _id conflict
          // MongoDB automatically maps 'id' to '_id', but our IDs are not valid ObjectIds
          if (cleanKey === 'id') {
            cleaned['project_id'] = value !== undefined ? value : '';
          } else {
            // Keep the value as-is (can be string, number, or empty string)
            cleaned[cleanKey] = value !== undefined ? value : '';
          }
        }
      }
      // Explicitly remove _id to let MongoDB generate it
      delete cleaned._id;
      return cleaned;
    }).filter(doc => Object.keys(doc).length > 0); // Remove completely empty docs
    
    console.log(`   📝 Cleaned ${cleanedDocs.length} documents (removed ${docs.length - cleanedDocs.length} empty).`);
    
    if (cleanedDocs.length === 0) {
      console.log(`   ⚠️  No valid documents to import after cleaning.`);
      return;
    }
    
    // Try inserting with better error handling
    try {
      const result = await Model.insertMany(cleanedDocs, { ordered: false });
      
      // Check if all documents were inserted
      if (result.length === 0 && cleanedDocs.length > 0) {
        throw new Error(`insertMany returned 0 documents but expected ${cleanedDocs.length}`);
      }
      
      if (result.length < cleanedDocs.length) {
        console.log(`   ⚠️  Only inserted ${result.length} of ${cleanedDocs.length} documents. Attempting individual inserts for remaining...`);
        // Try inserting remaining documents individually
        const insertedIds = new Set(result.map(r => r._id?.toString() || r.id?.toString()));
        const remainingDocs = cleanedDocs.filter((doc, idx) => {
          // If we can't identify which were inserted, try all individually
          return !insertedIds.has(doc._id?.toString() || doc.id?.toString());
        });
        
        if (remainingDocs.length > 0) {
          let successCount = result.length;
          let failCount = 0;
          
          for (let i = 0; i < remainingDocs.length; i++) {
            try {
              await Model.create(remainingDocs[i]);
              successCount++;
            } catch (docErr) {
              failCount++;
              if (failCount <= 10) {
                console.error(`   ❌ Error inserting document:`, docErr.message);
              }
            }
          }
          console.log(`   ✅ Total inserted: ${successCount} ${label} records.`);
          if (failCount > 0) {
            console.log(`   ⚠️  Failed to insert ${failCount} records.`);
          }
        } else {
          console.log(`   ✅ Inserted ${result.length} ${label} records.`);
        }
      } else {
        console.log(`   ✅ Inserted ${result.length} ${label} records.`);
      }
    } catch (insertErr) {
      // If bulk insert fails, try inserting one by one to identify problematic records
      console.error(`   ⚠️  Bulk insert failed:`, insertErr.message);
      
      if (insertErr.writeErrors && insertErr.writeErrors.length > 0) {
        console.error(`   ⚠️  ${insertErr.writeErrors.length} documents failed. Attempting individual inserts...`);
      } else {
        console.error(`   ⚠️  Attempting individual inserts to identify issues...`);
      }
      
      let successCount = 0;
      let failCount = 0;
      
      for (let i = 0; i < cleanedDocs.length; i++) {
        try {
          await Model.create(cleanedDocs[i]);
          successCount++;
        } catch (docErr) {
          failCount++;
          if (failCount <= 10) { // Log first 10 errors
            console.error(`   ❌ Error inserting document ${i + 1}:`, docErr.message);
            // Log a sample of the problematic document
            const sampleDoc = { ...cleanedDocs[i] };
            // Truncate long values for readability
            for (const key in sampleDoc) {
              if (typeof sampleDoc[key] === 'string' && sampleDoc[key].length > 100) {
                sampleDoc[key] = sampleDoc[key].substring(0, 100) + '...';
              }
            }
            console.error(`      Sample doc (first 100 chars per field):`, JSON.stringify(sampleDoc, null, 2).substring(0, 500));
          }
        }
      }
      console.log(`   ✅ Inserted ${successCount} ${label} records.`);
      if (failCount > 0) {
        console.log(`   ⚠️  Failed to insert ${failCount} records.`);
      }
    }
  } catch (err) {
    console.error(`   ❌ Error importing ${label}:`, err.message || err);
    if (err.stack) {
      console.error(`   Stack trace:`, err.stack);
    }
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
  await importFile('PropertyZap_new_project.csv', NewProject, 'new projects');

  await mongoose.disconnect();
  console.log('\n🎉 Import completed.');
  process.exit(0);
}

main().catch(err => {
  console.error('Unexpected error during import:', err);
  process.exit(1);
});



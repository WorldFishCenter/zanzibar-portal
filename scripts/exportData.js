const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.development') });

// MongoDB configuration
const MONGODB_URI = process.env.REACT_APP_MONGODB_URI;
if (!MONGODB_URI) {
  console.error('Error: REACT_APP_MONGODB_URI environment variable is not set');
  process.exit(1);
}

const DB_NAME = 'zanzibar-dev';

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

async function exportData() {
  console.log('Using MongoDB URI:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//<username>:<password>@'));
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    const db = client.db(DB_NAME);

    // Export CPUE data
    console.log('Exporting CPUE data...');
    const cpueCollection = db.collection('monthly-cpue');
    const cpueData = await cpueCollection.find({}).toArray();
    
    fs.writeFileSync(
      path.join(DATA_DIR, 'cpue.json'),
      JSON.stringify(cpueData, null, 2)
    );
    console.log(`Exported ${cpueData.length} CPUE records`);

    // Export landing sites data
    const landingSites = [...new Set(cpueData.map(record => record.landing_site))].sort();
    fs.writeFileSync(
      path.join(DATA_DIR, 'landing-sites.json'),
      JSON.stringify(landingSites, null, 2)
    );
    console.log(`Exported ${landingSites.length} landing sites`);

    // Export summary statistics
    console.log('Calculating summary statistics...');
    const stats = await cpueCollection.aggregate([
      {
        $group: {
          _id: '$landing_site',
          avgCpue: { $avg: '$cpue' },
          avgCatch: { $avg: '$catch' },
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    fs.writeFileSync(
      path.join(DATA_DIR, 'summary-stats.json'),
      JSON.stringify(stats, null, 2)
    );
    console.log('Exported summary statistics');

    console.log('Data export completed successfully!');
  } catch (error) {
    console.error('Error exporting data:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Run export if called directly
if (require.main === module) {
  exportData();
} 
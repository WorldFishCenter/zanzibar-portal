const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.development') });

// Function to get public IP
async function getPublicIP() {
  return new Promise((resolve, reject) => {
    https.get('https://api.ipify.org?format=json', (resp) => {
      let data = '';
      resp.on('data', (chunk) => { data += chunk; });
      resp.on('end', () => {
        try {
          const ip = JSON.parse(data).ip;
          resolve(ip);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

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
  try {
    // Log the public IP being used
    const publicIP = await getPublicIP();
    console.log('Current public IP:', publicIP);
    
    console.log('Using MongoDB URI:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//<username>:<password>@'));
    const client = new MongoClient(MONGODB_URI, {
      ssl: true,
      tls: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 1,
      minPoolSize: 1,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      serverSelectionTimeoutMS: 30000
    });

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

    // Log success with IP for tracking
    console.log(`Data export completed successfully from IP: ${publicIP}`);
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
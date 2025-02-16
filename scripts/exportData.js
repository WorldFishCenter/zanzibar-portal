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

  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    const db = client.db(DB_NAME);

    // Export gear metrics data
    console.log('Exporting gear metrics data...');
    const gearMetricsCollection = db.collection('gear_metrics');
    const gearMetricsData = await gearMetricsCollection.find({}).toArray();
    
    fs.writeFileSync(
      path.join(DATA_DIR, 'gear-metrics.json'),
      JSON.stringify(gearMetricsData, null, 2)
    );
    console.log(`Exported ${gearMetricsData.length} gear metrics records`);

    // Export monthly metrics data
    console.log('Exporting monthly metrics data...');
    const monthlyMetricsCollection = db.collection('monthly_metrics');
    const monthlyMetricsData = await monthlyMetricsCollection.find({}).toArray();
    
    fs.writeFileSync(
      path.join(DATA_DIR, 'monthly-metrics.json'),
      JSON.stringify(monthlyMetricsData, null, 2)
    );
    console.log(`Exported ${monthlyMetricsData.length} monthly metrics records`);

    // Export taxa proportions data
    console.log('Exporting taxa proportions data...');
    const taxaProportionsCollection = db.collection('taxa_proportions');
    const taxaProportionsData = await taxaProportionsCollection.find({}).toArray();
    
    fs.writeFileSync(
      path.join(DATA_DIR, 'taxa-proportions.json'),
      JSON.stringify(taxaProportionsData, null, 2)
    );
    console.log(`Exported ${taxaProportionsData.length} taxa proportions records`);

    // Export effort map data
    console.log('Exporting effort map data...');
    const effortMapCollection = db.collection('effort-map');
    const effortMapData = await effortMapCollection.find({}).toArray();
    
    fs.writeFileSync(
      path.join(DATA_DIR, 'effort-map.json'),
      JSON.stringify(effortMapData, null, 2)
    );
    console.log(`Exported ${effortMapData.length} effort map records`);

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
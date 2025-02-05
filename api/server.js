const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.development') });

const app = express();
const port = process.env.PORT || 3001;

// Valid landing sites list
const VALID_LANDING_SITES = [
  'bwawani', 'chole', 'chwaka', 'fumba', 'jambiani', 'jasini',
  'kigombe', 'kizimkazi', 'kukuu', 'mangapwani', 'matemwe', 'mazizini',
  'mkinga', 'mkoani', 'mkokotoni', 'mkumbuu', 'moa', 'msuka',
  'mtangani', 'mvumoni_furaha', 'ndumbani', 'nungwi', 'other_site', 'sahare',
  'shumba_mjini', 'tanga', 'tongoni', 'wesha', 'wete'
];

// MongoDB connection
const MONGODB_URI = process.env.REACT_APP_MONGODB_URI;
let client = null;

const connectToDatabase = async () => {
  try {
    if (!client) {
      console.log('Connecting to MongoDB...');
      client = new MongoClient(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      await client.connect();
      console.log('Connected to MongoDB successfully');
    }
    return client.db('zanzibar-dev');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Middleware
app.use(cors());
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    const db = await connectToDatabase();
    const collections = await db.listCollections().toArray();
    
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        collections: collections.length
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ 
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// API Routes
app.get('/api/cpue', async (req, res) => {
  try {
    const { landingSites } = req.query;
    
    console.log('Query params:', { landingSites });
    
    // Parse landing sites from JSON string
    let sites;
    try {
      sites = JSON.parse(landingSites);
      if (!Array.isArray(sites)) {
        throw new Error('Landing sites must be an array');
      }
    } catch (error) {
      return res.status(400).json({ error: 'Invalid landing sites format', details: error.message });
    }
    
    // Validate landing sites
    const validSites = sites.filter(site => VALID_LANDING_SITES.includes(site));
    
    if (validSites.length === 0) {
      return res.status(400).json({ error: 'No valid landing sites provided' });
    }

    // Connect to database
    const db = await connectToDatabase();
    const collection = db.collection('monthly-cpue');

    // Build the query
    const query = {
      landing_site: { $in: validSites }
    };

    console.log('MongoDB Query:', JSON.stringify(query, null, 2));

    // Execute query
    const data = await collection.find(query).sort({ month_date: 1 }).toArray();

    console.log(`Found ${data.length} records for landing sites:`, validSites);
    
    // Transform data to ensure consistent structure
    const transformedData = data.map(record => ({
      _id: record._id,
      landing_site: record.landing_site,
      month_date: record.month_date,
      cpue: record.cpue || null,
      catch: record.catch || null
    }));
    
    res.json(transformedData);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      query: req.query 
    });
  }
});

// Start server
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`MongoDB URI: ${MONGODB_URI}`);
});

// Handle server shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    if (client) {
      client.close();
      console.log('MongoDB connection closed');
    }
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    if (client) {
      client.close();
      console.log('MongoDB connection closed');
    }
    process.exit(0);
  });
}); 
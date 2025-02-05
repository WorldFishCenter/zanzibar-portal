// Get the API URL from environment variables or determine based on environment
const getBaseApiUrl = () => {
  // If REACT_APP_API_URL is set, use it
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // In production, use relative path
  if (process.env.NODE_ENV === 'production') {
    return '/api';
  }
  
  // In development, default to localhost
  return 'http://localhost:3001/api';
};

const API_URL = getBaseApiUrl();

// Helper function to get the full API URL
const getApiUrl = (endpoint) => {
  const url = `${API_URL}${endpoint}`;
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Base API URL:', API_URL);
  console.log('Requesting API URL:', url);
  return url;
};

// Complete list of landing sites
const LANDING_SITES = [
  'bwawani', 'chole', 'chwaka', 'fumba', 'jambiani', 'jasini',
  'kigombe', 'kizimkazi', 'kukuu', 'mangapwani', 'matemwe', 'mazizini',
  'mkinga', 'mkoani', 'mkokotoni', 'mkumbuu', 'moa', 'msuka',
  'mtangani', 'mvumoni_furaha', 'ndumbani', 'nungwi', 'other_site', 'sahare',
  'shumba_mjini', 'tanga', 'tongoni', 'wesha', 'wete'
];

// Cache for API responses
let allDataCache = null;
let lastAllDataFetch = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url, options = {}, retries = MAX_RETRIES) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying request (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})...`);
      await sleep(RETRY_DELAY);
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};

// Check server health with retry logic
const checkServerHealth = async () => {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      console.log('Checking server health...', i + 1); // Debug logging
      const response = await fetch(getApiUrl('/health'));
      if (response.ok) {
        console.log('Server health check passed'); // Debug logging
        return true;
      }
      console.log('Server health check failed, retrying...'); // Debug logging
      await sleep(RETRY_DELAY);
    } catch (error) {
      console.error('Server health check error:', error); // Debug logging
      if (i < MAX_RETRIES - 1) {
        await sleep(RETRY_DELAY);
      }
    }
  }
  return false;
};

export const getDistrictData = (landingSite) => {
  // For backward compatibility, return a default object
  return {
    id: landingSite,
    label: landingSite.charAt(0).toUpperCase() + landingSite.slice(1).replace('_', ' '),
    bounds: [39.1977, -6.1659], // Default to Zanzibar center coordinates
  };
};

// Fetch all data at once and cache it
const fetchAllData = async () => {
  if (!allDataCache || Date.now() - lastAllDataFetch > CACHE_DURATION) {
    try {
      const isHealthy = await checkServerHealth();
      if (!isHealthy) {
        console.error('Server health check failed after retries'); // Debug logging
        throw new Error('Unable to connect to the server. Please try again later.');
      }

      console.log('Fetching data for landing sites:', LANDING_SITES); // Debug logging
      const response = await fetchWithRetry(getApiUrl('/cpue?landingSites=' + JSON.stringify(LANDING_SITES)));
      console.log('Response status:', response.status); // Debug logging

      const rawData = await response.json();
      console.log('Received data count:', Array.isArray(rawData) ? rawData.length : 'invalid data'); // Debug logging
      
      if (rawData.error) {
        throw new Error(rawData.error);
      }

      if (!Array.isArray(rawData)) {
        throw new Error('Invalid data format received from server. Please try again later.');
      }

      // Process and organize data by landing site
      const processedData = new Map();
      rawData.forEach(record => {
        if (!record.month_date) return;
        
        const site = record.landing_site;
        if (!processedData.has(site)) {
          processedData.set(site, []);
        }
        
        processedData.get(site).push({
          date: record.month_date,
          cpue: record.cpue !== undefined ? parseFloat(record.cpue) : null,
          catch: record.catch !== undefined ? parseFloat(record.catch) : null
        });
      });

      // Sort data for each landing site
      processedData.forEach(data => {
        data.sort((a, b) => new Date(a.date) - new Date(b.date));
      });

      allDataCache = processedData;
      lastAllDataFetch = Date.now();
      return processedData;
    } catch (error) {
      console.error('Error in fetchAllData:', error); // Debug logging
      throw new Error(`Unable to fetch data: ${error.message}`);
    }
  }
  return allDataCache;
};

export const getCatchData = async (selectedLandingSite) => {
  try {
    const allData = await fetchAllData();
    
    if (selectedLandingSite === 'all') {
      // Combine data from all sites
      const combinedData = new Map();
      allData.forEach((siteData, site) => {
        siteData.forEach(record => {
          if (!combinedData.has(record.date)) {
            combinedData.set(record.date, {
              date: record.date,
              cpue: 0,
              catch: 0,
              count: 0,
              validCpueCount: 0
            });
          }
          const combined = combinedData.get(record.date);
          if (record.cpue !== null) {
            combined.cpue += record.cpue;
            combined.validCpueCount++;
          }
          if (record.catch !== null) {
            combined.catch += record.catch;
          }
          combined.count++;
        });
      });

      // Calculate averages
      return Array.from(combinedData.values())
        .map(record => ({
          date: record.date,
          cpue: record.validCpueCount > 0 ? record.cpue / record.validCpueCount : null,
          catch: record.count > 0 ? record.catch / record.count : null
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    // Return data for specific landing site
    return allData.get(selectedLandingSite) || [];
  } catch (error) {
    console.error('Error in getCatchData:', error);
    throw new Error(`Failed to fetch catch data: ${error.message}`);
  }
};

export const getRevenueData = async (landingSite) => {
  throw new Error('Revenue data not yet implemented');
}; 
// Get the API URL from environment variables, fallback to production URL if not set
const API_URL = process.env.REACT_APP_API_URL || '/api';

// Helper function to get the full API URL
const getApiUrl = (endpoint) => {
  return `${API_URL}${endpoint}`;
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

// Check server health
const checkServerHealth = async () => {
  try {
    const response = await fetch(getApiUrl('/health'));
    return response.ok;
  } catch (error) {
    console.error('Server health check failed:', error);
    return false;
  }
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
        throw new Error('Server is not responding');
      }

      const response = await fetchWithRetry(getApiUrl('/cpue?landingSites=' + JSON.stringify(LANDING_SITES)));

      const rawData = await response.json();
      
      if (rawData.error) {
        throw new Error(rawData.error);
      }

      if (!Array.isArray(rawData)) {
        throw new Error('Invalid data format received from server');
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
      console.error('Error fetching all data:', error);
      throw error;
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
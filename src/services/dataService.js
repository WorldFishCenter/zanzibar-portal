// Import static data
import cpueData from '../data/cpue.json';
import landingSites from '../data/landing-sites.json';
import summaryStats from '../data/summary-stats.json';

// API configuration
const getBaseUrl = () => {
  // In production, use VERCEL_URL if available
  if (process.env.NODE_ENV === 'production') {
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}/api`;
    }
    return '/api'; // Fallback to relative path
  }
  
  // In development, use local API
  return process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
};

const API_CONFIG = {
  baseUrl: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000, // Increase to 30 seconds
  retries: 3,     // Add retry attempts
  retryDelay: 1000 // 1 second between retries
};

// Helper function to handle API timeouts
const timeoutPromise = (ms) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms);
  });
};

// Helper function to delay between retries
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_CONFIG.baseUrl}${endpoint}`;
  const id = Math.random().toString(36).substring(7);
  
  console.log(`[${id}] Requesting ${options.method || 'GET'} ${url}`);
  console.log(`[${id}] Environment:`, process.env.NODE_ENV);
  console.log(`[${id}] Base URL:`, API_CONFIG.baseUrl);

  for (let attempt = 1; attempt <= API_CONFIG.retries; attempt++) {
    const controller = new AbortController();
    
    try {
      console.log(`[${id}] Attempt ${attempt}/${API_CONFIG.retries}`);
      
      const response = await Promise.race([
        fetch(url, {
          ...options,
          headers: {
            ...API_CONFIG.headers,
            ...options.headers
          },
          signal: controller.signal
        }),
        timeoutPromise(API_CONFIG.timeout)
      ]);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`[${id}] Request successful`);
      return data;
    } catch (error) {
      console.error(`[${id}] Attempt ${attempt} failed:`, error);
      
      if (attempt === API_CONFIG.retries) {
        throw new Error(`Request failed after ${API_CONFIG.retries} attempts: ${error.message}`);
      }
      
      await delay(API_CONFIG.retryDelay);
    } finally {
      controller.abort();
    }
  }
};

// Check server health
const checkServerHealth = async () => {
  try {
    const result = await apiCall('/health');
    return result.status === 'ok';
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

// Helper function to get/set cache
const withCache = (key, fetchFn) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const data = fetchFn();
  cache.set(key, {
    timestamp: Date.now(),
    data
  });

  return data;
};

// Fetch catch data for landing sites
export const getCatchData = async (selectedLandingSite) => {
  try {
    const data = withCache(
      `catch-${selectedLandingSite}`,
      () => {
        // Filter and process data based on selected landing site
        if (selectedLandingSite === 'all') {
          return processAllSitesData(cpueData);
        }
        return processSingleSiteData(cpueData, selectedLandingSite);
      }
    );

    return data;
  } catch (error) {
    console.error('Error processing catch data:', error);
    throw new Error(`Failed to process catch data: ${error.message}`);
  }
};

// Helper function to process data for all sites
const processAllSitesData = (data) => {
  const combinedData = new Map();
  
  data.forEach(record => {
    if (!record.month_date) return;
    
    if (!combinedData.has(record.month_date)) {
      combinedData.set(record.month_date, {
        date: record.month_date,
        cpue: 0,
        catch: 0,
        count: 0,
        validCpueCount: 0
      });
    }
    
    const combined = combinedData.get(record.month_date);
    if (record.cpue !== null) {
      combined.cpue += record.cpue;
      combined.validCpueCount++;
    }
    if (record.catch !== null) {
      combined.catch += record.catch;
    }
    combined.count++;
  });

  return Array.from(combinedData.values())
    .map(record => ({
      date: record.date,
      cpue: record.validCpueCount > 0 ? record.cpue / record.validCpueCount : null,
      catch: record.count > 0 ? record.catch / record.count : null
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

// Helper function to process data for a single site
const processSingleSiteData = (data, landingSite) => {
  return data
    .filter(record => record.landing_site === landingSite)
    .map(record => ({
      date: record.month_date,
      cpue: record.cpue,
      catch: record.catch
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

// Get district data
export const getDistrictData = (landingSite) => {
  const stats = summaryStats.find(stat => stat._id === landingSite) || {
    avgCpue: 0,
    avgCatch: 0,
    count: 0
  };

  return {
    id: landingSite,
    label: landingSite.charAt(0).toUpperCase() + landingSite.slice(1).replace('_', ' '),
    bounds: [39.1977, -6.1659], // Default to Zanzibar center coordinates
    stats
  };
};

// Revenue data (placeholder)
export const getRevenueData = async () => {
  throw new Error('Revenue data not yet implemented');
}; 
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
  timeout: 10000 // 10 seconds
};

// Helper function to handle API timeouts
const timeoutPromise = (ms) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), ms);
  });
};

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_CONFIG.baseUrl}${endpoint}`;
  const controller = new AbortController();
  const id = Math.random().toString(36).substring(7);

  console.log(`[${id}] Requesting ${options.method || 'GET'} ${url}`);
  
  try {
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
    console.error(`[${id}] Request failed:`, error);
    throw error;
  } finally {
    controller.abort();
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
const withCache = async (key, fetchFn) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const data = await fetchFn();
  cache.set(key, {
    timestamp: Date.now(),
    data
  });

  return data;
};

// Fetch catch data for landing sites
export const getCatchData = async (selectedLandingSite) => {
  try {
    const isHealthy = await checkServerHealth();
    if (!isHealthy) {
      throw new Error('Service is currently unavailable. Please try again later.');
    }

    const data = await withCache(
      `catch-${selectedLandingSite}`,
      async () => {
        const response = await apiCall('/cpue', {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!Array.isArray(response)) {
          throw new Error('Invalid response format');
        }

        return response;
      }
    );

    // Process data based on selected landing site
    if (selectedLandingSite === 'all') {
      return processAllSitesData(data);
    }

    return processSingleSiteData(data, selectedLandingSite);
  } catch (error) {
    console.error('Error fetching catch data:', error);
    throw new Error(`Failed to fetch catch data: ${error.message}`);
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

// Get district data (placeholder for now)
export const getDistrictData = (landingSite) => {
  return {
    id: landingSite,
    label: landingSite.charAt(0).toUpperCase() + landingSite.slice(1).replace('_', ' '),
    bounds: [39.1977, -6.1659], // Default to Zanzibar center coordinates
  };
};

// Revenue data (placeholder)
export const getRevenueData = async () => {
  throw new Error('Revenue data not yet implemented');
}; 
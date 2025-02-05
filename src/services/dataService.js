// Import static data
import cpueData from '../data/cpue.json';
import summaryStats from '../data/summary-stats.json';

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
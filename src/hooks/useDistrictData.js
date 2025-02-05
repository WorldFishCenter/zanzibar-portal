import { useState, useEffect } from 'react';
import { getDistrictData, getCatchData, getRevenueData } from '../services/dataService';

export const useDistrictData = (districtId, timeRange = '7d') => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const district = getDistrictData(districtId);
        const [catchData, revenueData] = await Promise.all([
          getCatchData(districtId, timeRange),
          getRevenueData(districtId, timeRange)
        ]);

        setData({
          district,
          catchData,
          revenueData
        });
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [districtId, timeRange]);

  return { data, loading, error };
}; 
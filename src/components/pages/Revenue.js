import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Chart from 'react-apexcharts';
import { getChartConfig } from '../../utils/chartConfigs';
import { getRevenueData } from '../../services/dataService';

// Memoized constants
const EXCHANGE_RATES = {
  TZS: 1,
  USD: 0.00039,
  EUR: 0.00036
};

const CURRENCY_SYMBOLS = {
  TZS: 'TZS',
  USD: 'USD',
  EUR: '€'
};

// Memoized helper functions
const calculateMedian = (values) => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Number(((sorted[middle - 1] + sorted[middle]) / 2).toFixed(2));
  }
  return Number(sorted[middle].toFixed(2));
};

const Revenue = ({ theme, landingSite }) => {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState(null);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('monthly');
  const [currency, setCurrency] = useState('TZS');

  // Memoized currency conversion
  const convertCurrency = useCallback((value) => {
    if (value === null || value === undefined) return null;
    return Number((value * EXCHANGE_RATES[currency]).toFixed(2));
  }, [currency]);

  // Memoized currency formatting
  const formatWithCurrency = useCallback((value) => {
    if (value === null || value === undefined) return 'No data';
    const formattedValue = value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return `${CURRENCY_SYMBOLS[currency]} ${formattedValue}`;
  }, [currency]);

  // Memoized data fetching
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRevenueData(landingSite);
      setRevenueData(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching revenue data:', err);
    } finally {
      setLoading(false);
    }
  }, [landingSite]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Memoize chart config
  const chartConfig = useMemo(() => getChartConfig(theme), [theme]);

  // Memoized monthly medians calculation
  const getMonthlyMedians = useCallback((data) => {
    const monthlyData = new Array(12).fill().map(() => []);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    data.forEach(item => {
      if (item.y !== null) {
        const month = new Date(item.x).getMonth();
        monthlyData[month].push(item.y);
      }
    });
    
    return monthlyData.map((values, index) => ({
      x: monthNames[index],
      y: calculateMedian(values)
    }));
  }, []);

  // Memoized seasonal data calculation
  const seasonalData = useMemo(() => {
    if (!revenueData?.selectedData) return [];
    const rawData = getMonthlyMedians(revenueData.selectedData);
    return rawData.map(d => ({
      x: d.x,
      y: convertCurrency(d.y)
    }));
  }, [revenueData, convertCurrency, getMonthlyMedians]);

  // Memoized yearly aggregation
  const aggregateToYearly = useCallback((monthlyData) => {
    const yearlyMap = new Map();
    
    monthlyData.forEach(item => {
      const date = new Date(item.x);
      const year = date.getFullYear();
      
      if (!yearlyMap.has(year)) {
        yearlyMap.set(year, {
          sum: 0,
          count: 0
        });
      }
      
      if (item.y !== null) {
        yearlyMap.get(year).sum += item.y;
        yearlyMap.get(year).count += 1;
      }
    });

    return Array.from(yearlyMap.entries())
      .map(([year, data]) => ({
        x: new Date(year, 0, 1).getTime(),
        y: data.count > 0 ? Number((data.sum / data.count).toFixed(2)) : null
      }))
      .sort((a, b) => a.x - b.x);
  }, []);

  // Memoized valid data filtering and conversion
  const validData = useMemo(() => {
    if (!revenueData?.selectedData) return [];
    return revenueData.selectedData
      .filter(item => item.y !== null && typeof item.y === 'number')
      .map(item => ({
        x: item.x,
        y: convertCurrency(item.y)
      }));
  }, [revenueData, convertCurrency]);

  // Memoized display data calculation
  const displayData = useMemo(() => {
    if (!revenueData?.selectedData) return [];
    return viewMode === 'yearly' 
      ? aggregateToYearly(revenueData.selectedData.map(item => ({
          x: item.x,
          y: convertCurrency(item.y)
        })))
      : revenueData.selectedData.map(item => ({
          x: item.x,
          y: convertCurrency(item.y)
        }));
  }, [revenueData, viewMode, convertCurrency, aggregateToYearly]);

  // Memoized latest value calculation
  const latestValue = useMemo(() => {
    if (viewMode === 'yearly') {
      const yearlyData = aggregateToYearly(revenueData?.selectedData?.map(item => ({
        x: item.x,
        y: convertCurrency(item.y)
      })) || []);
      return yearlyData.length > 0 ? yearlyData[yearlyData.length - 1].y : 0;
    }
    return validData.length > 0 ? validData[validData.length - 1].y : 0;
  }, [viewMode, revenueData, validData, convertCurrency, aggregateToYearly]);

  // Memoized percentage change calculation
  const percentChange = useMemo(() => {
    if (viewMode === 'yearly') {
      const yearlyData = aggregateToYearly(revenueData?.selectedData?.map(item => ({
        x: item.x,
        y: convertCurrency(item.y)
      })) || []);
      if (yearlyData.length < 2) return null;
      
      const latest = yearlyData[yearlyData.length - 1];
      const previous = yearlyData[yearlyData.length - 2];
      
      return {
        change: ((latest.y - previous.y) / previous.y * 100).toFixed(1),
        currentPeriod: new Date(latest.x).getFullYear().toString(),
        previousPeriod: new Date(previous.x).getFullYear().toString()
      };
    } else {
      if (validData.length < 2) return null;
      
      const latest = validData[validData.length - 1];
      const previous = validData[validData.length - 2];
      
      return {
        change: ((latest.y - previous.y) / previous.y * 100).toFixed(1),
        currentPeriod: new Date(latest.x).toLocaleString('default', { month: 'short', year: 'numeric' }),
        previousPeriod: new Date(previous.x).toLocaleString('default', { month: 'short', year: 'numeric' })
      };
    }
  }, [viewMode, revenueData, validData, convertCurrency, aggregateToYearly]);

  // Memoized chart options
  const mainChartOptions = useMemo(() => ({
    ...chartConfig,
    chart: {
      ...chartConfig.chart,
      height: 350,
      sparkline: {
        enabled: false
      },
      toolbar: {
        show: false
      },
      animations: {
        enabled: true,
        easing: 'linear',
        speed: 800,
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      }
    },
    dataLabels: {
      enabled: viewMode === 'yearly',
      style: {
        fontSize: '12px',
        fontWeight: 500
      },
      formatter: function(val) {
        if (val === null || val === undefined) return '';
        return formatWithCurrency(val);
      }
    },
    stroke: {
      curve: 'smooth',
      width: viewMode === 'yearly' ? 0 : 2,
      lineCap: 'round'
    },
    fill: {
      opacity: viewMode === 'yearly' ? 1 : 0.2,
      type: viewMode === 'yearly' ? 'solid' : 'gradient',
      gradient: viewMode === 'yearly' ? undefined : {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100]
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '60%',
        colors: {
          ranges: [{
            from: 0,
            to: Infinity,
            color: '#2196f3'
          }]
        }
      }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: {
          fontSize: '12px'
        },
        format: viewMode === 'yearly' ? 'yyyy' : 'MMM yyyy'
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px'
        },
        formatter: function(val) {
          if (val === null || val === undefined) return '';
          return formatWithCurrency(val);
        }
      }
    },
    tooltip: {
      theme: theme === 'dark' ? 'dark' : 'light',
      x: {
        format: viewMode === 'yearly' ? 'yyyy' : 'dd MMM yyyy'
      },
      y: {
        formatter: function(val) {
          return val == null ? 'No data' : formatWithCurrency(val);
        }
      }
    },
    grid: {
      show: true,
      borderColor: theme === 'dark' ? '#1e293b' : '#e2e8f0',
      strokeDashArray: 4,
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 10
      }
    },
    markers: {
      size: viewMode === 'yearly' ? 0 : 4,
      strokeWidth: 2,
      strokeColors: theme === 'dark' ? '#3b82f6' : '#60a5fa',
      hover: {
        size: 6
      }
    }
  }), [chartConfig, theme, viewMode, formatWithCurrency]);

  // Memoized radar chart options
  const radarChartOptions = useMemo(() => ({
    chart: {
      type: 'radar',
      height: 350,
      toolbar: {
        show: false
      },
      background: 'transparent'
    },
    xaxis: {
      categories: seasonalData.map(d => d.x),
      labels: {
        style: {
          colors: Array(12).fill(theme === 'dark' ? '#94a3b8' : '#475569'),
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      min: 0,
      max: Math.ceil(Math.max(...seasonalData.map(d => d.y || 0))),
      tickAmount: 5,
      labels: {
        formatter: function(val) {
          return formatWithCurrency(val);
        },
        style: {
          colors: [theme === 'dark' ? '#94a3b8' : '#475569']
        }
      }
    },
    grid: {
      show: false
    },
    plotOptions: {
      radar: {
        size: undefined,
        polygons: {
          strokeColors: theme === 'dark' ? '#334155' : '#cbd5e1',
          strokeWidth: 1,
          connectorColors: theme === 'dark' ? '#334155' : '#cbd5e1'
        }
      }
    },
    markers: {
      size: 4,
      colors: [theme === 'dark' ? '#3b82f6' : '#60a5fa'],
      strokeColors: [theme === 'dark' ? '#3b82f6' : '#60a5fa'],
      strokeWidth: 2
    },
    fill: {
      opacity: 0.2,
      colors: [theme === 'dark' ? '#3b82f6' : '#60a5fa']
    },
    stroke: {
      width: 2,
      colors: [theme === 'dark' ? '#3b82f6' : '#60a5fa'],
      dashArray: 0
    },
    tooltip: {
      y: {
        formatter: function(val) {
          return formatWithCurrency(val);
        }
      },
      theme: theme === 'dark' ? 'dark' : 'light'
    }
  }), [theme, seasonalData, formatWithCurrency]);

  if (loading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-center">
            <div className="spinner-border text-primary me-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <span>Loading data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-danger">
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-center text-danger">
            <i className="ti ti-alert-circle me-2"></i>
            <span>Error loading data: {error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!revenueData?.selectedData?.length) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="text-center text-muted">
            No data available for {landingSite === 'all' ? 'all landing sites' : landingSite}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="row row-deck row-cards">
      <div className="col-12">
        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between">
            <h3 className="card-title">Revenue per unit effort (median)</h3>
            <div className="d-flex gap-2">
              <div className="btn-group" role="group">
                {Object.keys(CURRENCY_SYMBOLS).map(curr => (
                  <button 
                    key={curr}
                    type="button" 
                    className={`btn ${currency === curr ? 'btn-secondary' : 'btn-outline-secondary'}`}
                    onClick={() => setCurrency(curr)}
                  >
                    {curr}
                  </button>
                ))}
              </div>
              <div className="btn-group" role="group">
                <button 
                  type="button" 
                  className={`btn ${viewMode === 'monthly' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setViewMode('monthly')}
                >
                  Monthly
                </button>
                <button 
                  type="button" 
                  className={`btn ${viewMode === 'yearly' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setViewMode('yearly')}
                >
                  Yearly
                </button>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="d-flex align-items-center mb-4">
              <div className="me-4">
                <div className="text-muted mb-1">Latest Revenue</div>
                <div className="d-flex align-items-baseline">
                  <h1 className="h1 mb-0 me-2">
                    {typeof latestValue === 'number' ? formatWithCurrency(latestValue) : 'No data'}
                  </h1>
                </div>
              </div>
              {percentChange && (
                <div>
                  <div className="text-muted mb-1">
                    Change from {percentChange.previousPeriod} to {percentChange.currentPeriod}
                  </div>
                  <div className={`d-inline-flex align-items-center px-2 py-1 rounded-2 ${
                    parseFloat(percentChange.change) >= 0 
                      ? 'bg-success-lt text-success' 
                      : 'bg-danger-lt text-danger'
                  }`}>
                    <i className={`ti ti-trend-${parseFloat(percentChange.change) >= 0 ? 'up' : 'down'} me-1`}></i>
                    <span className="fw-medium">
                      {Math.abs(percentChange.change)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="row">
              <div className="col-8">
                <Chart 
                  key={`${currency}-${viewMode}`}
                  options={mainChartOptions}
                  series={[{
                    name: landingSite === 'all' ? 'All Landing Sites' : landingSite,
                    data: displayData
                  }]}
                  type={viewMode === 'yearly' ? 'bar' : 'area'}
                  height={350}
                />
              </div>
              <div className="col-4">
                <Chart 
                  key={currency}
                  options={radarChartOptions}
                  series={[{
                    name: 'Monthly Pattern',
                    data: seasonalData.map(d => d.y)
                  }]}
                  type="radar"
                  height={350}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Revenue);
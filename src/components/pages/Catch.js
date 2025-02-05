import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { getChartConfig } from '../../utils/chartConfigs';
import { getCatchData } from '../../services/dataService';

const Catch = ({ theme, landingSite }) => {
  const [loading, setLoading] = useState(true);
  const [catchData, setCatchData] = useState(null);
  const [error, setError] = useState(null);

  // Fetch data when landing site changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCatchData(landingSite);
        setCatchData(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching catch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [landingSite]); // Re-fetch when landing site changes

  const chartConfig = getChartConfig(theme);

  if (loading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="text-center">Loading data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="text-center text-danger">Error loading data: {error}</div>
        </div>
      </div>
    );
  }

  if (!catchData || catchData.length === 0) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="text-center">No data available for {landingSite === 'all' ? 'all landing sites' : landingSite}</div>
        </div>
      </div>
    );
  }

  // Filter out null CPUE values and get the latest valid CPUE
  const validCPUEData = catchData.filter(item => item.cpue !== null);
  const latestCPUE = validCPUEData.length > 0 ? validCPUEData[validCPUEData.length - 1].cpue : 0;

  return (
    <div className="row row-deck row-cards">
      {/* CPUE Trend */}
      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">CPUE Trend</h3>
            <div className="card-subtitle">Catch Per Unit Effort (kg/fisher/hour)</div>
          </div>
          <div className="card-body">
            <div className="row g-3 align-items-center mb-3">
              <div className="col">
                <div className="font-weight-medium">Latest CPUE</div>
                <div className="text-muted">{latestCPUE.toFixed(2)} kg/fisher/hour</div>
              </div>
              <div className="col-auto">
                <div className="text-muted">
                  Valid records: {validCPUEData.length} of {catchData.length}
                </div>
              </div>
            </div>
            <Chart 
              options={{
                ...chartConfig,
                chart: {
                  ...chartConfig.chart,
                  height: 280,
                  sparkline: {
                    enabled: false
                  },
                  background: 'transparent',
                  foreColor: theme === 'dark' ? '#ffffff' : '#000000'
                },
                grid: {
                  show: true,
                  borderColor: theme === 'dark' ? '#2c3e50' : '#e9ecef',
                  strokeDashArray: 4,
                  padding: {
                    left: 10,
                    right: 10,
                    top: 10,
                    bottom: 10
                  }
                },
                stroke: {
                  curve: 'smooth',
                  width: 2,
                  lineCap: 'round'
                },
                fill: {
                  opacity: 0.1,
                  type: 'solid'
                },
                xaxis: {
                  ...chartConfig.xaxis,
                  type: 'datetime',
                  labels: {
                    show: true,
                    format: 'MMM yyyy',
                    style: {
                      colors: theme === 'dark' ? '#95a5a6' : '#64748b'
                    }
                  },
                  axisBorder: {
                    show: false
                  },
                  axisTicks: {
                    show: true,
                    color: theme === 'dark' ? '#2c3e50' : '#e9ecef'
                  }
                },
                yaxis: {
                  ...chartConfig.yaxis,
                  labels: {
                    show: true,
                    formatter: (value) => value.toFixed(2),
                    style: {
                      colors: theme === 'dark' ? '#95a5a6' : '#64748b'
                    }
                  },
                  axisBorder: {
                    show: false
                  },
                  axisTicks: {
                    show: true,
                    color: theme === 'dark' ? '#2c3e50' : '#e9ecef'
                  }
                },
                tooltip: {
                  theme: theme,
                  x: {
                    format: 'MMM yyyy'
                  },
                  y: {
                    formatter: (value) => `${value.toFixed(2)} kg/fisher/hour`
                  },
                  marker: {
                    show: true
                  }
                },
                markers: {
                  size: 3,
                  strokeWidth: 1.5,
                  strokeColors: theme === 'dark' ? '#206bc4' : '#206bc4',
                  fillColors: theme === 'dark' ? '#1a2234' : '#ffffff',
                  hover: {
                    size: 5
                  }
                }
              }}
              series={[{
                name: 'CPUE',
                data: validCPUEData.map(item => ({
                  x: new Date(item.date).getTime(),
                  y: item.cpue
                }))
              }]}
              type="line"
              height={280}
            />
          </div>
        </div>
      </div>

      {/* Data Quality Card */}
      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Data Quality</h3>
          </div>
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-auto">
                <span className={`badge bg-${validCPUEData.length / catchData.length > 0.8 ? 'success' : 'warning'}`}>
                  {Math.round(validCPUEData.length / catchData.length * 100)}% Complete
                </span>
              </div>
              <div className="col">
                <div className="text-muted">
                  {validCPUEData.length} valid CPUE records out of {catchData.length} total records
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Species Distribution */}
      <div className="col-md-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Species Distribution</h3>
          </div>
          <div className="card-body">
            <Chart 
              options={{
                chart: {
                  type: 'pie',
                  height: 300,
                  background: 'transparent',
                  foreColor: theme === 'dark' ? '#ffffff' : '#000000'
                },
                labels: ['Tuna', 'Mackerel', 'Sardines', 'Octopus', 'Others'],
                theme: {
                  mode: theme,
                  palette: 'palette1'
                },
                plotOptions: {
                  pie: {
                    donut: {
                      size: '70%'
                    }
                  }
                },
                legend: {
                  position: 'bottom',
                  labels: {
                    colors: theme === 'dark' ? '#95a5a6' : '#64748b'
                  }
                },
                stroke: {
                  colors: theme === 'dark' ? '#1a2234' : '#ffffff'
                }
              }}
              series={[35, 25, 20, 15, 5]}
              type="pie"
              height={300}
            />
          </div>
        </div>
      </div>

      {/* Gear Types */}
      <div className="col-md-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Gear Types</h3>
          </div>
          <div className="card-body">
            <Chart 
              options={{
                chart: {
                  type: 'bar',
                  height: 300,
                  toolbar: {
                    show: false
                  },
                  background: 'transparent',
                  foreColor: theme === 'dark' ? '#ffffff' : '#000000'
                },
                plotOptions: {
                  bar: {
                    horizontal: true,
                    borderRadius: 2,
                    barHeight: '60%'
                  }
                },
                xaxis: {
                  categories: ['Gillnet', 'Seine net', 'Fish trap', 'Hook & line', 'Other'],
                  labels: {
                    style: {
                      colors: theme === 'dark' ? '#95a5a6' : '#64748b'
                    }
                  },
                  axisBorder: {
                    show: false
                  },
                  axisTicks: {
                    show: true,
                    color: theme === 'dark' ? '#2c3e50' : '#e9ecef'
                  }
                },
                yaxis: {
                  labels: {
                    style: {
                      colors: theme === 'dark' ? '#95a5a6' : '#64748b'
                    }
                  }
                },
                grid: {
                  borderColor: theme === 'dark' ? '#2c3e50' : '#e9ecef',
                  strokeDashArray: 4
                },
                theme: {
                  mode: theme
                },
                colors: ['#206bc4']
              }}
              series={[{
                name: 'Usage',
                data: [65, 45, 35, 20, 10]
              }]}
              type="bar"
              height={300}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Catch; 
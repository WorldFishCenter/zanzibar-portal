import React from 'react';
import Chart from 'react-apexcharts';
import { IconCurrencyDollar, IconTrendingUp, IconChartBar } from '@tabler/icons-react';
import { getChartConfig } from '../../utils/chartConfigs';
import { generateTimeSeriesData, formatCurrency } from '../../utils/dataUtils';

const Revenue = ({ theme, district }) => {
  // Revenue overview chart config
  const revenueChartConfig = {
    ...getChartConfig(theme),
    chart: {
      type: 'area',
      height: 350,
      sparkline: {
        enabled: false
      },
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      }
    },
    grid: {
      show: true,
      borderColor: theme === 'dark' ? '#2C3E50' : '#E2E8F0',
      strokeDashArray: 4,
      padding: {
        left: 0,
        right: 0
      }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        show: true,
        format: 'dd MMM'
      },
      axisBorder: {
        show: false
      }
    },
    yaxis: {
      labels: {
        show: true,
        formatter: (value) => formatCurrency(value)
      }
    },
    title: {
      text: 'Revenue Trend',
      align: 'left',
      style: {
        fontSize: '16px',
        color: theme === 'dark' ? '#fff' : '#000'
      }
    }
  };

  return (
    <div className="row row-deck row-cards">
      {/* Revenue Stats Cards */}
      <div className="col-12">
        <div className="row g-3">
          {/* Total Revenue */}
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-auto">
                    <span className="bg-primary text-white avatar">
                      <IconCurrencyDollar size={24} />
                    </span>
                  </div>
                  <div className="col">
                    <div className="subheader">Total Revenue</div>
                    <div className="h3 mb-0">{formatCurrency(1234567)}</div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="d-flex mb-2">
                    <div>Monthly Growth</div>
                    <div className="ms-auto">
                      <span className="text-green d-inline-flex align-items-center lh-1">
                        12% <IconTrendingUp size={16} className="ms-1"/>
                      </span>
                    </div>
                  </div>
                  <Chart 
                    options={getChartConfig(theme)}
                    series={[{ data: generateTimeSeriesData(30, 1000000, 0.1) }]}
                    type="area"
                    height={60}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Average Per Trip */}
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-auto">
                    <span className="bg-green text-white avatar">
                      <IconChartBar size={24} />
                    </span>
                  </div>
                  <div className="col">
                    <div className="subheader">Average Per Trip</div>
                    <div className="h3 mb-0">{formatCurrency(45678)}</div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="d-flex mb-2">
                    <div>Trip Variance</div>
                    <div className="ms-auto">
                      <span className="text-yellow d-inline-flex align-items-center lh-1">
                        ±8%
                      </span>
                    </div>
                  </div>
                  <Chart 
                    options={getChartConfig(theme)}
                    series={[{ data: generateTimeSeriesData(30, 50000, 0.15) }]}
                    type="area"
                    height={60}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Revenue by Species */}
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-auto">
                    <span className="bg-azure text-white avatar">
                      <IconCurrencyDollar size={24} />
                    </span>
                  </div>
                  <div className="col">
                    <div className="subheader">Top Species Revenue</div>
                    <div className="h3 mb-0">{formatCurrency(789012)}</div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="d-flex mb-2">
                    <div>Species: Tuna</div>
                    <div className="ms-auto">
                      <span className="text-azure d-inline-flex align-items-center lh-1">
                        32% of total
                      </span>
                    </div>
                  </div>
                  <Chart 
                    options={getChartConfig(theme)}
                    series={[{ data: generateTimeSeriesData(30, 800000, 0.2) }]}
                    type="area"
                    height={60}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Revenue Chart */}
      <div className="col-12">
        <div className="card">
          <div className="card-body">
            <Chart 
              options={revenueChartConfig}
              series={[{
                name: 'Revenue',
                data: generateTimeSeriesData(90, 1000000, 0.2)
              }]}
              type="area"
              height={350}
            />
          </div>
        </div>
      </div>

      {/* Revenue Distribution */}
      <div className="col-md-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Revenue by Species</h3>
          </div>
          <div className="card-body">
            <Chart 
              options={{
                chart: {
                  type: 'donut',
                  height: 300
                },
                labels: ['Tuna', 'Mackerel', 'Sardines', 'Octopus', 'Others'],
                theme: {
                  mode: theme
                },
                plotOptions: {
                  pie: {
                    donut: {
                      size: '70%'
                    }
                  }
                },
                legend: {
                  position: 'bottom'
                }
              }}
              series={[35, 25, 20, 15, 5]}
              type="donut"
              height={300}
            />
          </div>
        </div>
      </div>

      {/* Monthly Comparison */}
      <div className="col-md-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Monthly Revenue Comparison</h3>
          </div>
          <div className="card-body">
            <Chart 
              options={{
                chart: {
                  type: 'bar',
                  height: 300,
                  toolbar: {
                    show: false
                  }
                },
                plotOptions: {
                  bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    borderRadius: 2
                  }
                },
                dataLabels: {
                  enabled: false
                },
                xaxis: {
                  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                },
                yaxis: {
                  labels: {
                    formatter: (value) => formatCurrency(value)
                  }
                },
                theme: {
                  mode: theme
                },
                colors: ['#206bc4', '#79a6dc']
              }}
              series={[
                {
                  name: '2024',
                  data: [2100000, 1800000, 2300000, 2800000, 2600000, 2900000]
                },
                {
                  name: '2023',
                  data: [1800000, 1600000, 2100000, 2300000, 2200000, 2400000]
                }
              ]}
              type="bar"
              height={300}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Revenue; 
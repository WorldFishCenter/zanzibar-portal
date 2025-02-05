import React from 'react';
import Chart from 'react-apexcharts';
import { IconScale } from '@tabler/icons-react';
import { getChartConfig } from '../../utils/chartConfigs';
import { generateTimeSeriesData } from '../../utils/dataUtils';

const Catch = ({ theme, district }) => {
  const chartConfig = getChartConfig(theme);

  return (
    <div className="row row-deck row-cards">
      {/* Catch Overview Card */}
      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Catch Overview</h3>
          </div>
          <div className="card-body">
            <div className="row g-3 align-items-center">
              <div className="col-auto">
                <span className="bg-primary text-white avatar">
                  <IconScale size={24} />
                </span>
              </div>
              <div className="col">
                <div className="font-weight-medium">
                  Total Catch
                </div>
                <div className="text-muted">
                  {(15234).toLocaleString()} kg
                </div>
              </div>
            </div>
            <div className="mt-3">
              <Chart 
                options={{
                  ...chartConfig,
                  chart: {
                    ...chartConfig.chart,
                    height: 280,
                    sparkline: {
                      enabled: false
                    }
                  },
                  xaxis: {
                    ...chartConfig.xaxis,
                    labels: {
                      show: true
                    }
                  },
                  yaxis: {
                    ...chartConfig.yaxis,
                    labels: {
                      show: true
                    }
                  }
                }}
                series={[{
                  name: 'Catch',
                  data: generateTimeSeriesData(30, 500)
                }]}
                type="area"
                height={280}
              />
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
                  }
                },
                plotOptions: {
                  bar: {
                    horizontal: true,
                    borderRadius: 2
                  }
                },
                xaxis: {
                  categories: ['Gillnet', 'Seine net', 'Fish trap', 'Hook & line', 'Other'],
                },
                theme: {
                  mode: theme
                }
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
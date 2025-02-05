import React, { memo } from 'react';
import PropTypes from 'prop-types';
import Chart from 'react-apexcharts';
import { getChartConfig } from '../../utils/chartConfigs';
import { generateTimeSeriesData } from '../../utils/dataUtils';

/**
 * SmallChart - A reusable small area chart component
 * 
 * @param {Object} props
 * @param {string} props.theme - The current theme ('light' or 'dark')
 * @param {number} props.baseValue - The base value for data generation
 * @param {number} props.volatility - The volatility factor for data generation (0-1)
 * @param {number} props.days - Number of days to generate data for
 * @param {number} props.height - Height of the chart in pixels
 * @param {string} props.name - Name of the data series
 * @param {Object} props.customOptions - Custom ApexCharts options to merge
 */
const SmallChart = ({ 
  theme, 
  baseValue = 100, 
  volatility = 0.2, 
  days = 30,
  height = 60,
  name = 'Value',
  customOptions = {}
}) => {
  const chartConfig = {
    ...getChartConfig(theme),
    ...customOptions
  };

  return (
    <Chart 
      options={chartConfig}
      series={[{ 
        name,
        data: generateTimeSeriesData(days, baseValue, volatility) 
      }]}
      type="area"
      height={height}
    />
  );
};

SmallChart.propTypes = {
  theme: PropTypes.oneOf(['light', 'dark']).isRequired,
  baseValue: PropTypes.number,
  volatility: PropTypes.number,
  days: PropTypes.number,
  height: PropTypes.number,
  name: PropTypes.string,
  customOptions: PropTypes.object
};

// Memoize the component to prevent unnecessary re-renders
export default memo(SmallChart); 
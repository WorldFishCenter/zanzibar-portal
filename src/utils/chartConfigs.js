// Chart configuration factory
export const getChartConfig = (theme) => ({
  chart: {
    type: 'area',
    height: 60,
    sparkline: {
      enabled: true
    },
    toolbar: {
      show: false
    },
    animations: {
      enabled: false
    },
    background: 'transparent'
  },
  stroke: {
    curve: 'smooth',
    width: 2
  },
  fill: {
    opacity: 0.3,
    gradient: {
      enabled: true,
      opacityFrom: 0.6,
      opacityTo: 0.1
    }
  },
  xaxis: {
    type: 'datetime',
    tooltip: {
      enabled: false
    }
  },
  yaxis: {
    min: 0,
    labels: {
      formatter: (value) => Math.round(value)
    }
  },
  colors: [theme === 'dark' ? '#3498db' : '#206bc4'],
  tooltip: {
    enabled: true,
    shared: false,
    intersect: false,
    followCursor: true,
    theme: theme,
    custom: function({series, seriesIndex, dataPointIndex, w}) {
      const value = series[seriesIndex][dataPointIndex];
      const color = w.config.colors[seriesIndex];
      return `<div class="apexcharts-tooltip-box" style="padding: 4px 8px;">
        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${color}; margin-right: 4px;"></span>
        <span>Usage: ${value}</span>
      </div>`;
    },
    x: {
      show: false
    },
    marker: {
      show: false
    },
    fixed: {
      enabled: true,
      position: 'topRight',
      offsetY: -15,
      offsetX: 0
    }
  },
  markers: {
    size: 3,
    strokeWidth: 1.5,
    fillOpacity: 1,
    strokeOpacity: 1,
    hover: {
      size: 4
    },
    discrete: [{
      seriesIndex: 0,
      dataPointIndex: -1,
      size: 4,
      strokeColor: theme === 'dark' ? '#3498db' : '#206bc4',
      fillColor: '#fff'
    }]
  },
  responsive: [{
    breakpoint: 576,
    options: {
      chart: {
        height: 40
      },
      markers: {
        size: 2
      }
    }
  }]
}); 
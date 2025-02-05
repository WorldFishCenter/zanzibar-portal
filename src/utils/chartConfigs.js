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
    theme: theme,
    y: {
      formatter: (value) => value
    }
  },
  markers: {
    size: 3,
    strokeWidth: 1.5,
    fillOpacity: 1,
    strokeOpacity: 1,
    hover: {
      size: 4
    }
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
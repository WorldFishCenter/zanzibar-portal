import React, { useState, useMemo, useCallback, memo } from 'react';
import { DeckGL } from '@deck.gl/react';
import { Map as MapGL } from 'react-map-gl';
import { GridLayer } from '@deck.gl/aggregation-layers';
import mapboxgl from 'mapbox-gl';
import { IconSatellite, IconMap } from '@tabler/icons-react';
import effortMapData from '../../data/effort-map.json';
import 'mapbox-gl/dist/mapbox-gl.css';
import { 
  TIME_BREAKS, 
  COLOR_RANGE, 
  INITIAL_VIEW_STATE, 
  GRID_LAYER_SETTINGS,
  SHARED_STYLES 
} from '../../constants/mapConfig';

// This is needed for react-map-gl to work with newer versions of mapbox-gl
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;

// Pre-filter and transform data once at module level
const FILTERED_DATA = effortMapData
  .filter(d => !d.type?.includes('metadata'))
  .map(d => ({
    position: [d.lng_grid_1km, d.lat_grid_1km],
    avgTimeHours: d.avg_time_hours || 0,
    totalVisits: parseInt(d.total_visits) || 0,
    avgSpeed: parseFloat(d.avg_speed) || 0,
    originalCells: parseInt(d.original_cells) || 0
  }));

// Utility functions
const calculateStats = (data) => {
  const totalVisits = data.reduce((sum, d) => sum + (d.totalVisits || 0), 0);
  const avgTime = data.reduce((sum, d) => sum + (d.avgTimeHours || 0), 0) / data.length;
  const maxTime = Math.max(...data.map(d => d.avgTimeHours || 0));
  const avgSpeed = data.reduce((sum, d) => sum + (d.avgSpeed || 0), 0) / data.length;
  
  return {
    totalVisits: totalVisits.toLocaleString(),
    avgTime: avgTime.toFixed(1),
    maxTime: maxTime.toFixed(1),
    gridCells: data.length.toLocaleString(),
    avgSpeed: avgSpeed.toFixed(1)
  };
};

const getColorForValue = (value) => {
  for (let i = TIME_BREAKS.length - 1; i >= 0; i--) {
    const range = TIME_BREAKS[i];
    if (value >= range.min && (range.max === Infinity ? true : value < range.max)) {
      return i;
    }
  }
  return 0;
};

// Memoized components
const MapStyleToggle = memo(({ theme, isSatellite, onToggle }) => (
  <button
    onClick={onToggle}
    title={isSatellite ? 'Switch to standard view' : 'Switch to satellite view'}
    style={{
      position: 'absolute',
      top: 20,
      right: 20,
      width: '40px',
      height: '40px',
      padding: '8px',
      ...SHARED_STYLES.glassPanel(theme),
      border: 'none',
      cursor: 'pointer',
      zIndex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: SHARED_STYLES.transitions.default,
      ':hover': {
        transform: 'translateY(-1px)',
        backgroundColor: theme === 'dark' ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      }
    }}
  >
    {isSatellite ? (
      <IconMap size={24} stroke={1.5} />
    ) : (
      <IconSatellite size={24} stroke={1.5} />
    )}
  </button>
));

const TimeRangeButton = memo(({ range, index, isSelected, colorRange, theme, onToggle }) => (
  <div
    onClick={() => onToggle(range)}
    style={{
      display: 'flex',
      alignItems: 'center',
      padding: '4px 8px',
      cursor: 'pointer',
      backgroundColor: isSelected ? 
        (theme === 'dark' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)') : 
        'transparent',
      borderRadius: '4px',
      opacity: isSelected ? 1 : 0.6,
      transition: SHARED_STYLES.transitions.default
    }}
  >
    <div
      style={{
        width: '10px',
        height: '10px',
        backgroundColor: `rgb(${colorRange[index].join(',')})`,
        marginRight: '6px',
        borderRadius: '2px'
      }}
    />
    <span style={{ 
      fontSize: '12px',
      color: theme === 'dark' ? '#ffffff' : '#000000'
    }}>
      {range.label}
    </span>
  </div>
));

const InfoPanel = memo(({ theme, data, colorRange, selectedRanges, onRangeToggle }) => {
  const stats = useMemo(() => calculateStats(data), [data]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        left: 20,
        padding: '16px',
        width: '380px',
        zIndex: 1,
        ...SHARED_STYLES.glassPanel(theme)
      }}
    >
      <h3 style={{ 
        margin: '0 0 16px 0',
        ...SHARED_STYLES.text.heading(theme)
      }}>
        Fishing Effort Distribution
      </h3>

      {/* Grid Info */}
      <div style={{ 
        marginBottom: '20px',
        padding: '8px 12px',
        backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)',
        borderRadius: '4px',
        fontSize: '13px'
      }}>
        <div style={{ marginBottom: '4px' }}>
          <strong>Grid Resolution:</strong> 1 × 1 km
        </div>
        <div style={{ 
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
          fontSize: '12px',
          lineHeight: '1.4'
        }}>
          Each cell represents a 1 square kilometer area where fishing activity has been recorded
        </div>
      </div>

      {/* Color Scale Legend */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ 
          marginBottom: '8px',
          ...SHARED_STYLES.text.label(theme)
        }}>
          AVERAGE TIME SPENT
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px'
        }}>
          <div style={{
            height: '8px',
            flex: 1,
            background: `linear-gradient(to right, ${colorRange.map(c => `rgb(${c.join(',')})`).join(', ')})`,
            borderRadius: '4px'
          }} />
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          ...SHARED_STYLES.text.label(theme)
        }}>
          <span>Fewer Hours</span>
          <span>More Hours</span>
        </div>
      </div>

      {/* Time Range Filters */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ 
          marginBottom: '8px',
          ...SHARED_STYLES.text.label(theme)
        }}>
          TIME RANGES (select to filter)
        </div>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '4px'
        }}>
          {TIME_BREAKS.map((range, i) => (
            <TimeRangeButton
              key={range.label}
              range={range}
              index={i}
              isSelected={selectedRanges.some(r => r.min === range.min && r.max === range.max)}
              colorRange={colorRange}
              theme={theme}
              onToggle={onRangeToggle}
            />
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div style={{ 
        fontSize: '14px', 
        lineHeight: '1.6',
        display: 'grid',
        gap: '12px'
      }}>
        <div>
          <div style={{ 
            marginBottom: '4px',
            ...SHARED_STYLES.text.label(theme)
          }}>
            ACTIVITY
          </div>
          <div><strong>{stats.totalVisits}</strong> total visits recorded</div>
          <div><strong>{stats.gridCells}</strong> active grid cells</div>
        </div>

        <div>
          <div style={{ 
            marginBottom: '4px',
            ...SHARED_STYLES.text.label(theme)
          }}>
            TIME & SPEED
          </div>
          <div><strong>{stats.avgTime}h</strong> average time per visit</div>
          <div><strong>{stats.maxTime}h</strong> maximum time recorded</div>
          <div><strong>{stats.avgSpeed} km/h</strong> average speed</div>
        </div>

        <div style={{
          marginTop: '8px',
          paddingTop: '12px',
          borderTop: theme === 'dark' ? '1px solid rgba(156, 163, 175, 0.2)' : '1px solid rgba(107, 114, 128, 0.2)',
          ...SHARED_STYLES.text.label(theme)
        }}>
          ⌘ + Drag to rotate view
        </div>
      </div>
    </div>
  );
});

const Map = memo(({ theme }) => {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [selectedRanges, setSelectedRanges] = useState(TIME_BREAKS);
  const [isSatellite, setIsSatellite] = useState(true);

  // Memoize filtered data based on selected ranges
  const transformedData = useMemo(() => 
    FILTERED_DATA.filter(d => 
      selectedRanges.some(range => 
        d.avgTimeHours >= range.min && (
          range.max === Infinity ? true : d.avgTimeHours < range.max
        )
      )
    )
  , [selectedRanges]);

  // Memoize handlers
  const handleRangeToggle = useCallback((range) => {
    setSelectedRanges(current => {
      const isSelected = current.some(r => r.min === range.min && r.max === range.max);
      if (isSelected) {
        return current.length === 1 ? current : 
          current.filter(r => r.min !== range.min || r.max !== range.max);
      }
      return [...current, range];
    });
  }, []);

  const handleViewStateChange = useCallback(({ viewState }) => {
    setViewState(viewState);
  }, []);

  const handleMapStyleToggle = useCallback(() => {
    setIsSatellite(prev => !prev);
  }, []);

  // Memoize tooltip function
  const getTooltip = useCallback(({object}) => {
    if (!object) return null;

    const avgTime = object.points.reduce((sum, p) => sum + p.source.avgTimeHours, 0) / object.points.length;
    const breakIndex = TIME_BREAKS.findIndex(range => 
      avgTime >= range.min && (range.max === Infinity ? true : avgTime < range.max)
    );
    const cellColor = COLOR_RANGE[breakIndex >= 0 ? breakIndex : 0];
    const totalVisits = object.points.reduce((sum, p) => sum + p.source.totalVisits, 0);
    
    return {
      html: `
        <div style="padding: 8px">
          <div><strong>Time spent</strong></div>
          <div>Average time: ${avgTime.toFixed(2)} hours</div>
          <div><strong>Activity</strong></div>
          <div>Total visits: ${totalVisits}</div>
        </div>
      `,
      style: {
        backgroundColor: `rgba(${cellColor.join(',')}, 0.95)`,
        color: breakIndex > COLOR_RANGE.length / 2 ? '#ffffff' : '#000000',
        fontSize: '12px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }
    };
  }, []);

  // Memoize layers
  const layers = useMemo(() => [
    new GridLayer({
      id: 'grid-layer',
      data: transformedData,
      pickable: true,
      extruded: true,
      getPosition: d => d.position,
      getElevationWeight: d => d.avgTimeHours,
      colorRange: COLOR_RANGE,
      ...GRID_LAYER_SETTINGS,
      colorScaleType: 'ordinal',
      colorDomain: [0, 1, 2, 3, 4, 5],
      getColorWeight: d => d ? getColorForValue(d.avgTimeHours) : 0,
      updateTriggers: {
        getColorWeight: [selectedRanges]
      }
    })
  ], [transformedData, selectedRanges]);

  if (!process.env.REACT_APP_MAPBOX_TOKEN) {
    console.error('Mapbox token is missing. Please check your environment variables.');
    return <div>Error: Mapbox token is missing</div>;
  }

  return (
    <>
      <DeckGL
        initialViewState={viewState}
        controller={true}
        layers={layers}
        onViewStateChange={handleViewStateChange}
        getTooltip={getTooltip}
      >
        <MapGL
          mapStyle={
            isSatellite
              ? "mapbox://styles/mapbox/satellite-v9"
              : theme === 'dark'
              ? "mapbox://styles/mapbox/dark-v11"
              : "mapbox://styles/mapbox/light-v11"
          }
          mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
          onError={console.error}
          reuseMaps
          attributionControl={false}
          preventStyleDiffing={true}
          renderWorldCopies={false}
          antialias={true}
          terrain={false}
          style={{
            width: '100%',
            height: '100%'
          }}
        />
      </DeckGL>
      <MapStyleToggle 
        theme={theme}
        isSatellite={isSatellite}
        onToggle={handleMapStyleToggle}
      />
      <InfoPanel 
        theme={theme} 
        data={transformedData}
        colorRange={COLOR_RANGE}
        selectedRanges={selectedRanges}
        onRangeToggle={handleRangeToggle}
      />
    </>
  );
});

export default Map; 
import React, { useState, useMemo, useCallback } from 'react';
import { DeckGL } from '@deck.gl/react';
import { Map as MapGL } from 'react-map-gl';
import { GridLayer } from '@deck.gl/aggregation-layers';
import mapboxgl from 'mapbox-gl';
import effortMapData from '../../data/effort-map.json';
import Legend from './Legend';
// This is needed for react-map-gl to work with newer versions of mapbox-gl
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;

// Constants moved outside component to prevent recreation
const INITIAL_VIEW_STATE = {
  longitude: 39.19,  // Zanzibar City longitude
  latitude: -6.16,   // Zanzibar City latitude
  zoom: 9,          // Reduced zoom level for better overview
  pitch: 45,        // Add tilt to see 3D
  bearing: 10       // Slight rotation for better perspective
};

// YlGnBu color scale
const COLOR_RANGE = [
  [255, 255, 217],  // Light yellow
  [237, 248, 177],
  [199, 233, 180],
  [127, 205, 187],
  [65, 182, 196],
  [29, 145, 192],
  [34, 94, 168],
  [12, 44, 132]     // Dark blue
];

// Time breaks (matching Legend.js)
const BREAKS = [
  { min: 0, max: 0.5, label: '0-0.5h' },
  { min: 0.5, max: 1, label: '0.5-1h' },
  { min: 1, max: 2, label: '1-2h' },
  { min: 2, max: 3, label: '2-3h' },
  { min: 3, max: 5, label: '3-5h' },
  { min: 5, max: Infinity, label: '>5h' }
];

const GRID_LAYER_SETTINGS = {
  cellSize: 1000,
  colorScaleType: 'quantize',
  colorDomain: [0, 5],
  colorAggregation: 'MEAN',
  opacity: 0.3,
  elevationAggregation: 'MEAN',
  elevationScale: 100,
  elevationRange: [0, 200],
  material: {
    ambient: 0.64,
    diffuse: 0.6,
    shininess: 32,
    specularColor: [51, 51, 51]
  }
};

// Pre-filter metadata entries once
const FILTERED_DATA = effortMapData.filter(d => !d.type?.includes('metadata'));

const Map = ({ theme }) => {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [selectedRanges, setSelectedRanges] = useState(BREAKS);

  // Memoize data transformation
  const transformedData = useMemo(() => 
    FILTERED_DATA
      .map(d => ({
        position: [d.lng_grid_1km, d.lat_grid_1km],
        avgTimeHours: d.avg_time_hours || 0,
        totalVisits: parseInt(d.total_visits) || 0,
        avgSpeed: parseFloat(d.avg_speed) || 0,
        originalCells: parseInt(d.original_cells) || 0
      }))
      .filter(d => 
        selectedRanges.some(range => 
          d.avgTimeHours >= range.min && d.avgTimeHours < range.max
        )
      )
  , [selectedRanges]);

  // Memoize handler functions
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

  // Memoize tooltip function
  const getTooltip = useCallback(({object}) => {
    if (!object) return null;

    return {
      html: `
        <div style="padding: 8px">
          <div><strong>Time spent</strong></div>
          <div>Average time: ${object.colorValue.toFixed(2)} hours</div>
          <div><strong>Activity</strong></div>
          <div>Total visits: ${object.elevationValue || 0}</div>
        </div>
      `,
      style: {
        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
        color: theme === 'dark' ? '#ffffff' : '#000000',
        fontSize: '12px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }
    };
  }, [theme]);

  // Memoize layers
  const layers = useMemo(() => [
    new GridLayer({
      id: 'grid-layer',
      data: transformedData,
      pickable: true,
      extruded: true,
      getPosition: d => d.position,
      getColorWeight: d => d.avgTimeHours,
      getElevationWeight: d => d.avgTimeHours,
      colorRange: COLOR_RANGE,
      ...GRID_LAYER_SETTINGS
    })
  ], [transformedData]);

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
          mapStyle={theme === 'dark' ? 
            "mapbox://styles/mapbox/dark-v11" : 
            "mapbox://styles/mapbox/light-v11"
          }
          mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
          onError={console.error}
          reuseMaps
        />
      </DeckGL>
      <Legend 
        theme={theme}
        colorRange={COLOR_RANGE}
        selectedRanges={selectedRanges}
        onRangeToggle={handleRangeToggle}
      />
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          padding: '8px 12px',
          backgroundColor: theme === 'dark' ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          color: theme === 'dark' ? '#9ca3af' : '#6b7280',
          fontSize: '12px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(4px)',
          transition: 'opacity 0.2s ease',
          opacity: 0.8,
          userSelect: 'none',
          zIndex: 1
        }}
      >
        ⌘ + Drag to rotate view
      </div>
    </>
  );
};

export default React.memo(Map); 
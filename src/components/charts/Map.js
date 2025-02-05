import React, { useState, useMemo } from 'react';
import { DeckGL } from '@deck.gl/react';
import { Map as MapGL } from 'react-map-gl';
import { HexagonLayer } from '@deck.gl/aggregation-layers';

// Sample data - replace with real data later
const SAMPLE_DATA = Array.from({ length: 1000 }, () => ({
  position: [
    39.1977 + (Math.random() - 0.5) * 2, // Longitude around Zanzibar
    -6.1659 + (Math.random() - 0.5) * 2,  // Latitude around Zanzibar
    Math.random() * 100 // Weight (catch size)
  ],
  catch: Math.random() * 100
}));

// Initial viewport centered on Zanzibar
const INITIAL_VIEW_STATE = {
  longitude: 39.1977,
  latitude: -6.1659,
  zoom: 8,
  pitch: 30,
  bearing: 0
};

const Map = ({ theme }) => {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);

  const layers = useMemo(() => [
    new HexagonLayer({
      id: 'hexagon-layer',
      data: SAMPLE_DATA,
      pickable: true,
      extruded: true,
      radius: 1000,
      elevationScale: 100,
      getPosition: d => d.position,
      getElevationWeight: d => d.catch,
      colorRange: theme === 'dark' ? [
        [65, 182, 196],
        [127, 205, 187],
        [199, 233, 180],
        [237, 248, 177],
        [255, 255, 204]
      ] : [
        [44, 123, 182],
        [171, 217, 233],
        [255, 255, 191],
        [253, 174, 97],
        [215, 25, 28]
      ]
    })
  ], [theme]);

  return (
    <DeckGL
      initialViewState={viewState}
      controller={true}
      layers={layers}
      onViewStateChange={({ viewState }) => setViewState(viewState)}
      getTooltip={({object}) => object && {
        html: `
          <div style="padding: 8px">
            <div>Catch in area: ${Math.round(object.points.reduce((sum, p) => sum + p.catch, 0))} kg</div>
            <div>Number of records: ${object.points.length}</div>
          </div>
        `,
        style: {
          backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
          color: theme === 'dark' ? '#ffffff' : '#000000',
          fontSize: '12px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }
      }}
    >
      <MapGL
        mapStyle={theme === 'dark' ? 
          "mapbox://styles/mapbox/dark-v11" : 
          "mapbox://styles/mapbox/light-v11"
        }
        mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        reuseMaps
      />
    </DeckGL>
  );
};

export default Map; 
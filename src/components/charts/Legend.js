import React from 'react';

const BREAKS = [
  { min: 0, max: 0.5, label: '0-0.5h' },
  { min: 0.5, max: 1, label: '0.5-1h' },
  { min: 1, max: 2, label: '1-2h' },
  { min: 2, max: 3, label: '2-3h' },
  { min: 3, max: 5, label: '3-5h' },
  { min: 5, max: Infinity, label: '>5h' }
];

const Legend = ({ theme, colorRange, selectedRanges, onRangeToggle }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
        padding: '12px',
        borderRadius: '6px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        zIndex: 1,
        maxWidth: '200px'
      }}
    >
      <div style={{ marginBottom: '8px', fontWeight: 'bold', color: theme === 'dark' ? '#ffffff' : '#000000' }}>
        Average Time Spent
      </div>
      {BREAKS.map((range, i) => {
        const isSelected = selectedRanges.some(r => r.min === range.min && r.max === range.max);
        return (
          <div
            key={range.label}
            onClick={() => onRangeToggle(range)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '4px 0',
              cursor: 'pointer',
              opacity: isSelected ? 1 : 0.5,
              transition: 'opacity 0.2s ease'
            }}
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                backgroundColor: `rgb(${colorRange[i].join(',')})`,
                marginRight: '8px',
                border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
                borderRadius: '4px'
              }}
            />
            <span style={{ 
              color: theme === 'dark' ? '#ffffff' : '#000000',
              fontSize: '12px'
            }}>
              {range.label}
            </span>
          </div>
        );
      })}
      <div style={{ 
        marginTop: '8px',
        fontSize: '11px',
        color: theme === 'dark' ? '#9ca3af' : '#6b7280'
      }}>
        Click ranges to filter
      </div>
    </div>
  );
};

export default Legend; 
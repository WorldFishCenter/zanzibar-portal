import React from 'react';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTooltip } from '../../hooks/useTooltip';
import Map from '../charts/Map';
import { SAMPLE_DISTRICT_DATA } from '../../constants/districts';

const Home = ({ theme, district }) => {
  useTooltip();

  return (
    <div className="row row-deck row-cards">
      {/* District summary table */}
      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Districts summary</h3>
            <div className="card-actions">
              <button 
                type="button"
                className="btn btn-icon btn-link text-muted"
                data-bs-toggle="tooltip"
                data-bs-placement="left"
                title="This table shows the average values per fishing trip for each district:
• Catch: Average catch per trip (kg)
• CPUE: Average catch per fisher per hour (kg/fisher/hr)
• Catch Value: Average catch value per trip
• Price per kg: Average price per kilogram
• N. fishers: Average number of fishers per trip
• Trip length: Average trip duration (hrs)"
              >
                <IconInfoCircle />
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-vcenter">
                <thead>
                  <tr>
                    <th>District</th>
                    <th>Catch (kg)</th>
                    <th>CPUE (kg/fisher/hr)</th>
                    <th>Catch Value</th>
                    <th>Price per kg</th>
                    <th>N. fishers</th>
                    <th>Trip length (hrs)</th>
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_DISTRICT_DATA.map((row, index) => (
                    <tr key={index}>
                      <td>{row.district}</td>
                      <td>{row.catch.toFixed(1)}</td>
                      <td>{row.cpue.toFixed(1)}</td>
                      <td>{row.catchValue.toLocaleString()}</td>
                      <td>{row.pricePerKg}</td>
                      <td>{row.fishers}</td>
                      <td>{row.tripLength.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Map row */}
      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Fishing Effort Distribution</h3>
          </div>
          <div className="card-body p-0">
            <div style={{ 
              height: '800px', 
              width: '100%',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Map theme={theme} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 
import React from 'react';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTooltip } from '../../hooks/useTooltip';
import SmallChart from '../charts/SmallChart';
import { SAMPLE_DISTRICT_DATA } from '../../constants/districts';

const Home = ({ theme, district }) => {
  useTooltip();

  return (
    <div className="row row-deck row-cards">
      {/* Small cards row */}
      <div className="col-12">
        <div className="row g-3">
          {/* Submissions card */}
          <div className="col-sm-4">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="subheader">Number of submissions</div>
                </div>
                <div className="h1 mb-3">2,847</div>
                <div className="d-flex mb-2">
                  <SmallChart theme={theme} baseValue={100} />
                </div>
              </div>
            </div>
          </div>
          {/* Vessels card */}
          <div className="col-sm-4">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="subheader">Vessels surveyed</div>
                </div>
                <div className="h1 mb-3">1,257</div>
                <div className="d-flex mb-2">
                  <SmallChart theme={theme} baseValue={50} />
                </div>
              </div>
            </div>
          </div>
          {/* Catches card */}
          <div className="col-sm-4">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="subheader">Catches recorded</div>
                </div>
                <div className="h1 mb-3">3,521</div>
                <div className="d-flex mb-2">
                  <SmallChart theme={theme} baseValue={150} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map row */}
      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Geographic Distribution</h3>
          </div>
          <div className="card-body">
            <div style={{ height: '400px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Map placeholder - Will be implemented with deck.gl
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default Home; 
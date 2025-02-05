import React from 'react';
import { Link } from 'react-router-dom';
import { 
  IconHome,
  IconScale, 
  IconCurrencyDollar,
  IconInfoSquare,
  IconMap2
} from '@tabler/icons-react';

// List of all landing sites
const LANDING_SITES = [
  'bwawani', 'chole', 'chwaka', 'fumba', 'jambiani', 'jasini',
  'kigombe', 'kizimkazi', 'kukuu', 'mangapwani', 'matemwe', 'mazizini',
  'mkinga', 'mkoani', 'mkokotoni', 'mkumbuu', 'moa', 'msuka',
  'mtangani', 'mvumoni_furaha', 'ndumbani', 'nungwi', 'other_site', 'sahare',
  'shumba_mjini', 'tanga', 'tongoni', 'wesha', 'wete'
];

const Navigation = ({ selectedLandingSite, setSelectedLandingSite }) => {
  // Format landing site name for display
  const formatLandingSiteName = (site) => {
    return site === 'all' 
      ? 'All Landing Sites'
      : site.charAt(0).toUpperCase() + site.slice(1).replace('_', ' ');
  };

  return (
    <header className="navbar-expand-md">
      <div className="collapse navbar-collapse" id="navbar-menu">
        <div className="navbar">
          <div className="container-xl">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link to="/" className="nav-link">
                  <span className="nav-link-icon d-md-none d-lg-inline-block">
                    <IconHome size={24} />
                  </span>
                  <span className="nav-link-title">Home</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/catch" className="nav-link">
                  <span className="nav-link-icon d-md-none d-lg-inline-block">
                    <IconScale size={24} />
                  </span>
                  <span className="nav-link-title">Catch</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/revenue" className="nav-link">
                  <span className="nav-link-icon d-md-none d-lg-inline-block">
                    <IconCurrencyDollar size={24} />
                  </span>
                  <span className="nav-link-title">Revenue</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/about" className="nav-link">
                  <span className="nav-link-icon d-md-none d-lg-inline-block">
                    <IconInfoSquare size={24} />
                  </span>
                  <span className="nav-link-title">About</span>
                </Link>
              </li>
            </ul>

            {/* Landing Site Selector */}
            <div className="navbar-nav ms-auto">
              <div className="nav-item dropdown">
                <button 
                  className="nav-link dropdown-toggle"
                  data-bs-toggle="dropdown"
                  data-bs-auto-close="outside"
                  style={{ minWidth: '200px', border: 'none', background: 'none', padding: '0.5rem 0.75rem' }}
                >
                  <IconMap2 className="icon me-2" />
                  <span>{formatLandingSiteName(selectedLandingSite)}</span>
                </button>
                <div className="dropdown-menu" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <button 
                    className={`dropdown-item ${selectedLandingSite === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedLandingSite('all')}
                  >
                    All Landing Sites
                  </button>
                  {LANDING_SITES.map(site => (
                    <button 
                      key={site}
                      className={`dropdown-item ${selectedLandingSite === site ? 'active' : ''}`}
                      onClick={() => setSelectedLandingSite(site)}
                    >
                      {formatLandingSiteName(site)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation; 
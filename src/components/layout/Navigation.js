import React from 'react';
import { Link } from 'react-router-dom';
import { 
  IconHome,
  IconScale, 
  IconCurrencyDollar,
  IconInfoSquare 
} from '@tabler/icons-react';

const Navigation = () => {
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
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation; 
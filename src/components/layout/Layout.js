import React from 'react';
import Header from './Header';
import Navigation from './Navigation';
import Footer from './Footer';

const Layout = ({ children, theme, toggleTheme, selectedDistrict, setSelectedDistrict }) => {
  return (
    <div className="page">
      <div className="sticky-top">
        <Header 
          theme={theme}
          toggleTheme={toggleTheme}
          selectedDistrict={selectedDistrict}
          setSelectedDistrict={setSelectedDistrict}
        />
        <Navigation />
      </div>

      <div className="page-wrapper">
        <div className="page-body">
          <div className="container-xl">
            {/* Beta Alert */}
            <div className="alert alert-warning" role="alert">
              <h4 className="alert-title">Beta Version</h4>
              <div className="text-muted">This application is currently in beta testing phase.</div>
            </div>

            {children}
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Layout; 
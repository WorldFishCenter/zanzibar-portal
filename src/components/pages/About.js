import React from 'react';

const About = () => {
  return (
    <div className="row row-deck row-cards">
      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">About Peskas</h3>
          </div>
          <div className="card-body">
            <div className="markdown">
              <h4>Overview</h4>
              <p>
                Peskas is an open-source, digital platform designed to collect, analyse, and visualise data 
                from small-scale fisheries, with the goal of improving fisheries management and supporting 
                sustainable practices.
              </p>

              <h4>Key Features</h4>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <strong>🔍 Data Collection:</strong> Intuitive tools for collecting key fishing data, 
                  including digital catch surveys and vessel tracking.
                </li>
                <li className="mb-2">
                  <strong>⚙️ Data Processing:</strong> Data is cleaned, standardized, and transformed into 
                  tidy formats, using FishBase for weight and nutrient composition information.
                </li>
                <li className="mb-2">
                  <strong>📊 Data Analysis:</strong> Identifies trends and patterns, estimating key fishery 
                  indicators such as average catch per trip and revenue.
                </li>
                <li className="mb-2">
                  <strong>✓ Data Validation:</strong> Rigorous scrutiny and refinement of information to 
                  ensure accuracy and reliability.
                </li>
                <li className="mb-2">
                  <strong>📈 Data Visualization:</strong> Interactive dashboards displaying data through 
                  maps, charts, and customizable tables.
                </li>
              </ul>

              <h4>Impact and Goals</h4>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <strong>🎯 Improved Decision-Making:</strong> Enabling evidence-based decisions at all levels
                </li>
                <li className="mb-2">
                  <strong>🌊 Sustainable Management:</strong> Supporting sustainable fishing practices
                </li>
                <li className="mb-2">
                  <strong>👥 Community Engagement:</strong> Incorporating community members as enumerators
                </li>
                <li className="mb-2">
                  <strong>🔍 Transparency:</strong> Making fisheries information accessible to all
                </li>
                <li className="mb-2">
                  <strong>💪 Empowerment:</strong> Providing data to inform fisher business decisions
                </li>
              </ul>

              <h4>Technical Details</h4>
              <p>
                Built with modern web technologies and following open-source principles, Peskas ensures 
                platform independence and streamlined deployment through Docker containerization. Data 
                processing and visualization are powered by R's statistical computation capabilities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 
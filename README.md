# WorldFish Dashboard

A modern dashboard for visualizing fisheries data from Zanzibar, built with React and Tabler UI components.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://zanzibar-portal.vercel.app/)

## Features

- Interactive data visualization for catch and revenue metrics
- Monthly and yearly view modes for time series data
- Seasonal patterns visualization using radar charts
- Multiple currency support (TZS, USD, EUR) for revenue data
- Responsive design optimized for all screen sizes
- Dark/Light theme support
- Landing site selection and filtering
- Real-time data updates and calculations
- Median-based statistical analysis

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

The application will open in your default browser at `http://localhost:3000`.

## Project Structure

- `/src` - Source code
  - `/components` - React components
    - `/pages` - Main page components (Catch.js, Revenue.js, etc.)
    - `/charts` - Chart components
    - `/layout` - Layout components
  - `/services` - Data services and API calls
  - `/utils` - Utility functions
  - `/constants` - Configuration constants
  - `/data` - Static data files
  - `/styles` - CSS and style files
- `/public` - Static files

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Runs the test suite
- `npm eject` - Ejects from create-react-app

## Data Visualization

The dashboard provides several visualization features:
- Time series charts for catch and revenue data
- Radar charts for seasonal patterns
- Statistical indicators (median values, percentage changes)
- Interactive filters and controls
- Responsive data updates

## Deployment

The application is deployed on Vercel. For deployment:

1. Set up environment variables:
   - `NODE_OPTIONS='--openssl-legacy-provider'` - Required for build process
   - `GENERATE_SOURCEMAP=false` - Optimizes build size

2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

3. Enable GitHub integration for automatic deployments

The live version is available at: https://zanzibar-portal.vercel.app/

## License

This project is open source and available under the MIT License. 
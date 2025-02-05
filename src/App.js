import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';
import Layout from './components/layout/Layout';
import Home from './components/pages/Home';
import Catch from './components/pages/Catch';
import Revenue from './components/pages/Revenue';
import About from './components/pages/About';
import ErrorBoundary from './components/layout/ErrorBoundary';
import './styles/charts.css';

function App() {
  const [theme, toggleTheme] = useTheme();
  const [selectedLandingSite, setSelectedLandingSite] = React.useState('all');

  return (
    <Layout
      theme={theme}
      toggleTheme={toggleTheme}
      selectedLandingSite={selectedLandingSite}
      setSelectedLandingSite={setSelectedLandingSite}
    >
      <Routes>
        <Route path="/" element={
          <ErrorBoundary>
            <Home theme={theme} landingSite={selectedLandingSite} />
          </ErrorBoundary>
        } />
        <Route path="/catch" element={
          <ErrorBoundary>
            <Catch theme={theme} landingSite={selectedLandingSite} />
          </ErrorBoundary>
        } />
        <Route path="/revenue" element={
          <ErrorBoundary>
            <Revenue theme={theme} landingSite={selectedLandingSite} />
          </ErrorBoundary>
        } />
        <Route path="/about" element={
          <ErrorBoundary>
            <About />
          </ErrorBoundary>
        } />
      </Routes>
    </Layout>
  );
}

export default App; 
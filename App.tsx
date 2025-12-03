
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import Layout from './components/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import CRM from './pages/CRM';
import Resources from './pages/Resources';
import FrontDesk from './pages/FrontDesk';
import Settings from './pages/Settings';
import LandingPage from './pages/LandingPage';

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          {/* Public Route (Landing Page) */}
          <Route path="/landing" element={<LandingPage />} />
          
          {/* Main App Routes (Wrapped in Layout) */}
          <Route element={<Layout><Dashboard /></Layout>} path="/" />
          <Route element={<Layout><CRM /></Layout>} path="/crm" />
          <Route element={<Layout><FrontDesk /></Layout>} path="/checkin" />
          <Route element={<Layout><Resources /></Layout>} path="/recursos" />
          <Route element={<Layout><Settings /></Layout>} path="/config" />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AppProvider>
  );
};

export default App;

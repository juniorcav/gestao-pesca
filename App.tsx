
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
import SuperAdmin from './pages/SuperAdmin';
import LandingPage from './pages/LandingPage';

const App: React.FC = () => {
  return (
    <AppProvider>
        <HashRouter>
          <Routes>
            {/* Public Landing Page */}
            {/* <Route path="/landing" element={<LandingPage />} /> */}
            
            {/* App Routes - Now accessible without login */}
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/crm" element={<Layout><CRM /></Layout>} />
            <Route path="/checkin" element={<Layout><FrontDesk /></Layout>} />
            <Route path="/recursos" element={<Layout><Resources /></Layout>} />
            <Route path="/config" element={<Layout><Settings /></Layout>} />
            
            {/* Super Admin Route - Open access */}
            <Route path="/super-admin" element={<Layout><SuperAdmin /></Layout>} />
            
            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </HashRouter>
    </AppProvider>
  );
};

export default App;

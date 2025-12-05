
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import CRM from './pages/CRM';
import Resources from './pages/Resources';
import FrontDesk from './pages/FrontDesk';
import Settings from './pages/Settings';
import SuperAdmin from './pages/SuperAdmin';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';

// Helper to redirect based on auth status and role
const RootRedirect = () => {
  // Directly show Login screen as requested
  return <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
          <HashRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/landing" element={<LandingPage />} />
              
              {/* Protected App Routes */}
              <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['business', 'platform_admin']}><Layout><Dashboard /></Layout></ProtectedRoute>} />
              <Route path="/crm" element={<ProtectedRoute allowedRoles={['business']}><Layout><CRM /></Layout></ProtectedRoute>} />
              <Route path="/checkin" element={<ProtectedRoute allowedRoles={['business']}><Layout><FrontDesk /></Layout></ProtectedRoute>} />
              <Route path="/recursos" element={<ProtectedRoute allowedRoles={['business']}><Layout><Resources /></Layout></ProtectedRoute>} />
              <Route path="/config" element={<ProtectedRoute allowedRoles={['business']}><Layout><Settings /></Layout></ProtectedRoute>} />
              
              {/* Super Admin Route */}
              <Route path="/super-admin" element={<ProtectedRoute allowedRoles={['platform_admin']}><Layout><SuperAdmin /></Layout></ProtectedRoute>} />
              
              {/* Root Redirect */}
              <Route path="/" element={<RootRedirect />} />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </HashRouter>
      </AppProvider>
    </AuthProvider>
  );
};

export default App;

import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import CRM from './pages/CRM';
import Resources from './pages/Resources';
import FrontDesk from './pages/FrontDesk';
import Settings from './pages/Settings';
import SuperAdmin from './pages/SuperAdmin';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';

// Helper to redirect based on auth status and role
const RootRedirect = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const { config, loadingData } = useApp();
  
  if (loading || loadingData) return <div className="flex h-screen items-center justify-center dark:bg-gray-900"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nature-600"></div></div>;
  
  if (isAuthenticated) {
     if (user?.role === 'platform_admin') return <Navigate to="/super-admin" replace />;
     
     // Check if First Time Setup is needed (Generic Name and Default Description)
     if (user?.role === 'business' && config.name === "Nome do Negócio" && !config.address) {
         return <Navigate to="/config" state={{ firstSetup: true }} replace />;
     }
     
     return <Navigate to="/dashboard" replace />;
  }
  
  return <Navigate to="/landing" replace />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
          <HashRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              
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
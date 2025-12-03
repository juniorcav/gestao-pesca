
import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CRM from './pages/CRM';
import Resources from './pages/Resources';
import FrontDesk from './pages/FrontDesk';
import Settings from './pages/Settings';
import LandingPage from './pages/LandingPage';
import SuperAdmin from './pages/SuperAdmin';

// Helper component to redirect based on role at root
const RootRedirect = () => {
    const { user, loading } = useAuth();
    
    if (loading) return null;
    
    if (user?.role === 'platform_admin') {
        return <Navigate to="/super-admin" replace />;
    }
    
    return <Layout><Dashboard /></Layout>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
       {/* AppProvider is nested so it can access AuthContext's user */}
       <AppProvider>
          <HashRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/landing" element={<LandingPage />} />
              
              {/* Protected Routes */}
              <Route path="/" element={<ProtectedRoute><RootRedirect /></ProtectedRoute>} />
              
              <Route path="/crm" element={<ProtectedRoute allowedRoles={['business', 'admin']}><Layout><CRM /></Layout></ProtectedRoute>} />
              <Route path="/checkin" element={<ProtectedRoute allowedRoles={['business', 'admin']}><Layout><FrontDesk /></Layout></ProtectedRoute>} />
              <Route path="/recursos" element={<ProtectedRoute allowedRoles={['business', 'admin']}><Layout><Resources /></Layout></ProtectedRoute>} />
              <Route path="/config" element={<ProtectedRoute allowedRoles={['business', 'admin']}><Layout><Settings /></Layout></ProtectedRoute>} />
              
              {/* Super Admin Route */}
              <Route path="/super-admin" element={<ProtectedRoute allowedRoles={['platform_admin']}><Layout><SuperAdmin /></Layout></ProtectedRoute>} />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </HashRouter>
       </AppProvider>
    </AuthProvider>
  );
};

export default App;

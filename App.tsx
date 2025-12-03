
import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CRM from './pages/CRM';
import Resources from './pages/Resources';
import FrontDesk from './pages/FrontDesk';
import Settings from './pages/Settings';
import SuperAdmin from './pages/SuperAdmin';

// Component to handle root redirection based on Auth and Config status
const RootRedirect = () => {
    const { user, loading: authLoading } = useAuth();
    const { config, loadingData } = useApp();

    if (authLoading || loadingData) {
        return (
             <div className="h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nature-600 mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Carregando seus dados...</p>
             </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;

    if (user.role === 'platform_admin') {
        return <Navigate to="/super-admin" replace />;
    }

    // First time setup check: If name is default, force settings
    if (config.name === "Nome do Negócio" || config.name === "Minha Pousada") {
        return <Navigate to="/config" state={{ firstSetup: true }} replace />;
    }

    return <Navigate to="/dashboard" replace />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <HashRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected App Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/crm" element={<ProtectedRoute><Layout><CRM /></Layout></ProtectedRoute>} />
            <Route path="/checkin" element={<ProtectedRoute><Layout><FrontDesk /></Layout></ProtectedRoute>} />
            <Route path="/recursos" element={<ProtectedRoute><Layout><Resources /></Layout></ProtectedRoute>} />
            <Route path="/config" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
            
            {/* Super Admin Route */}
            <Route path="/super-admin" element={
                <ProtectedRoute allowedRoles={['platform_admin']}>
                    <Layout><SuperAdmin /></Layout>
                </ProtectedRoute>
            } />
            
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


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
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <HashRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes wrapped in Layout */}
            <Route path="/" element={
               <ProtectedRoute>
                  <Layout><Dashboard /></Layout>
               </ProtectedRoute>
            } />
            
            <Route path="/crm" element={
               <ProtectedRoute allowedRoles={['business', 'admin']}>
                  <Layout><CRM /></Layout>
               </ProtectedRoute>
            } />
            
            <Route path="/recursos" element={
               <ProtectedRoute allowedRoles={['business', 'admin']}>
                  <Layout><Resources /></Layout>
               </ProtectedRoute>
            } />
            
            <Route path="/checkin" element={
               <ProtectedRoute allowedRoles={['business', 'admin']}>
                  <Layout><FrontDesk /></Layout>
               </ProtectedRoute>
            } />
            
            <Route path="/config" element={
               <ProtectedRoute allowedRoles={['business', 'admin']}>
                  <Layout><Settings /></Layout>
               </ProtectedRoute>
            } />
            
            {/* Default redirect logic could be improved, but for now redirecting unknown to home (which checks auth) */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </AppProvider>
    </AuthProvider>
  );
};

export default App;


import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Pages
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import ServiceDetail from '@/pages/ServiceDetail';
import Settings from '@/pages/Settings';
import Profile from '@/pages/Profile';
import SslDomain from '@/pages/SslDomain';
import ScheduleIncident from '@/pages/ScheduleIncident';
import OperationalPage from '@/pages/OperationalPage';
import PublicStatusPage from '@/pages/PublicStatusPage';
import RegionalMonitoring from '@/pages/RegionalMonitoring';
import NotFound from '@/pages/NotFound';

import { authService } from '@/services/authService';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
            <SidebarProvider>
              <Router>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/public/:slug" element={<PublicStatusPage />} />
                  
                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/service/:id" element={
                    <ProtectedRoute>
                      <ServiceDetail />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/ssl-domain" element={
                    <ProtectedRoute>
                      <SslDomain />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/schedule-incident" element={
                    <ProtectedRoute>
                      <ScheduleIncident />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/operational-page" element={
                    <ProtectedRoute>
                      <OperationalPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/regional-monitoring" element={
                    <ProtectedRoute>
                      <RegionalMonitoring />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Router>
              <Toaster />
            </SidebarProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
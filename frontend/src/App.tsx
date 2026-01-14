import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { AuthPage } from './pages/AuthPage';
import { OrgLoginPage } from './pages/OrgLoginPage';
import { Dashboard } from './pages/Dashboard';
import { LandingPage } from './pages/LandingPage';
import { SettingsPage } from './pages/SettingsPage';
import { LegalPage } from './pages/LegalPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { MyReports } from './pages/MyReports';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminReputation } from './pages/admin/AdminReputation';
import { MainLayout } from './components/layout/MainLayout';
import { AdminSidebar } from './components/admin/AdminSidebar';
import { CookieBanner } from './components/ui/CookieBanner';
import { ErrorBoundary } from './components/error/ErrorBoundary';
import { useAuthStore } from './store/useAuthStore';

const ProtectedRoute = ({ 
  children, 
  allowedRole 
}: { 
  children: React.ReactNode, 
  allowedRole: 'user' | 'admin' 
}) => {
  const { isLocked, userRole } = useAuthStore();
  
  if (isLocked) {
    return <Navigate to="/auth" replace />;
  }

  if (userRole !== allowedRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

const AdminLayoutWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-screen bg-[#09090b] overflow-hidden">
    <AdminSidebar />
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <header className="h-16 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
            Secure Admin Portal
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
            <Shield size={16} />
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {children}
      </main>
    </div>
  </div>
);

function App() {
  const { isLocked, userRole } = useAuthStore();

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/terms" element={<LegalPage type="terms" />} />
          <Route path="/privacy" element={<LegalPage type="privacy" />} />
          
          {/* Auth Routes */}
          <Route 
            path="/auth" 
            element={
              !isLocked 
                ? (userRole === 'admin' ? <Navigate to="/admin-dashboard" replace /> : <Navigate to="/dashboard" replace />)
                : <AuthPage />
            } 
          />
          <Route 
            path="/auth/org" 
            element={
              !isLocked && userRole === 'admin' 
                ? <Navigate to="/admin-dashboard" replace /> 
                : <OrgLoginPage />
            } 
          />

          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* User Space */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRole="user">
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute allowedRole="user">
                <MainLayout>
                  <MyReports />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute allowedRole="user">
                <MainLayout>
                  <SettingsPage />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Space - Standardized to /admin-dashboard */}
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminLayoutWrapper>
                  <AdminDashboard />
                </AdminLayoutWrapper>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/reports/inbox" 
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminLayoutWrapper>
                  <AdminReports folder="inbox" />
                </AdminLayoutWrapper>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/reports/verified" 
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminLayoutWrapper>
                  <AdminReports folder="verified" />
                </AdminLayoutWrapper>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/reports/flagged" 
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminLayoutWrapper>
                  <AdminReports folder="flagged" />
                </AdminLayoutWrapper>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/reports/spam" 
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminLayoutWrapper>
                  <AdminReports folder="spam" />
                </AdminLayoutWrapper>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/insights" 
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminLayoutWrapper>
                  <AdminDashboard />
                </AdminLayoutWrapper>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/reputation" 
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminLayoutWrapper>
                  <AdminReputation />
                </AdminLayoutWrapper>
              </ProtectedRoute>
            } 
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <CookieBanner />
      </Router>
    </ErrorBoundary>
  );
}

export default App;

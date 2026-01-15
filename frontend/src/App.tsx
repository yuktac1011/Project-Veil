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
import { CommunityReports } from './pages/community/CommunityReports';
import { CommunityDashboard } from './pages/community/CommunityDashboard';
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

    // Temporary: All authenticated users can access community pages (admins are deprecated)
    if (allowedRole === 'admin' && userRole === 'user') {
        return <>{children}</>;
    }

    if (userRole !== allowedRole) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
};

const ValidatorLayoutWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="flex h-screen bg-[#050505] text-zinc-100 overflow-hidden relative selection:bg-emerald-500/30">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-900/10 via-zinc-950/50 to-black pointer-events-none" />

        <div className="relative flex h-full w-full z-10">
            <AdminSidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <header className="h-16 border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-40 px-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            Secure Validator Node
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                            <Shield size={16} />
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {children}
                </main>
            </div>
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

                    {/* User Space + Community Governance */}
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
                        path="/community"
                        element={
                            <ProtectedRoute allowedRole="user">
                                <MainLayout>
                                    <CommunityReports />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/network"
                        element={
                            <ProtectedRoute allowedRole="user">
                                <MainLayout>
                                    <CommunityDashboard />
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

                    {/* Validator (Admin) Space */}
                    <Route
                        path="/admin-dashboard"
                        element={
                            <ProtectedRoute allowedRole="admin">
                                <ValidatorLayoutWrapper>
                                    <AdminDashboard />
                                </ValidatorLayoutWrapper>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/reports/inbox"
                        element={
                            <ProtectedRoute allowedRole="admin">
                                <ValidatorLayoutWrapper>
                                    <AdminReports folder="inbox" />
                                </ValidatorLayoutWrapper>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/reports/verified"
                        element={
                            <ProtectedRoute allowedRole="admin">
                                <ValidatorLayoutWrapper>
                                    <AdminReports folder="verified" />
                                </ValidatorLayoutWrapper>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/reports/flagged"
                        element={
                            <ProtectedRoute allowedRole="admin">
                                <ValidatorLayoutWrapper>
                                    <AdminReports folder="flagged" />
                                </ValidatorLayoutWrapper>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/reports/spam"
                        element={
                            <ProtectedRoute allowedRole="admin">
                                <ValidatorLayoutWrapper>
                                    <AdminReports folder="spam" />
                                </ValidatorLayoutWrapper>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/insights"
                        element={
                            <ProtectedRoute allowedRole="admin">
                                <ValidatorLayoutWrapper>
                                    <AdminDashboard />
                                </ValidatorLayoutWrapper>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/reputation"
                        element={
                            <ProtectedRoute allowedRole="admin">
                                <ValidatorLayoutWrapper>
                                    <AdminReputation />
                                </ValidatorLayoutWrapper>
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

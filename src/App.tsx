import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Login } from './components/auth/Login';
import { UserDashboard } from './components/dashboard/UserDashboard';
import { RecyclerDashboard } from './components/recycler/RecyclerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { RewardsPage } from './components/rewards/RewardsPage';
import { SellerPage } from './components/seller/SellerPage';
import { ProfileSetup } from './components/auth/ProfileSetup';
import { EmailVerificationBanner } from './components/auth/EmailVerificationBanner';
import { NotificationSystem } from './components/layout/NotificationSystem';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null; // Let AppContent handle loading
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-eco-green mb-4" size={48} />
        <p className="font-bold text-slate-400 animate-pulse tracking-widest uppercase text-xs">Sustainability Loading...</p>
      </div>
    );
  }

  if (user && !user.isProfileComplete) {
    return <ProfileSetup />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-eco-green/20">
      <NotificationSystem />
      {user && <EmailVerificationBanner />}
      {user && <Navbar />}
      <main>
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/" element={
            <ProtectedRoute>
              {user?.role === 'admin' ? (
                <AdminDashboard />
              ) : user?.role === 'recycler' ? (
                <RecyclerDashboard />
              ) : (
                <UserDashboard />
              )}
            </ProtectedRoute>
          } />
          <Route path="/rewards" element={
            <ProtectedRoute>
              <RewardsPage />
            </ProtectedRoute>
          } />
          <Route path="/seller" element={
            <ProtectedRoute>
              <SellerPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfileSetup />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      
      {/* Footer Branding */}
      {user && (
        <footer className="py-12 border-t-2 border-black mt-20 bg-slate-100">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-4 opacity-10 grayscale">
              <div className="h-6 w-6 bg-black rounded flex items-center justify-center text-white">
                <span className="text-[10px] font-bold">E</span>
              </div>
              <span className="text-sm font-black tracking-tighter uppercase italic">EcoCycle</span>
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Neural Waste Management Protocol • v2.4.0</p>
          </div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

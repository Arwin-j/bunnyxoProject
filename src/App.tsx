import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Header } from './components/common/Header';
import { WelcomePage } from './pages/WelcomePage';
import { HomePage } from './pages/HomePage';
import { EventsPage } from './pages/EventsPage';
import { MapPage } from './pages/MapPage';
import { FeedPage } from './pages/FeedPage';
import { UpdatesPage } from './pages/UpdatesPage';
import { RedemptionCodesPage } from './pages/RedemptionCodesPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminEditPage } from './pages/admin/AdminEditPage';
import { AdminEditCodesPage } from './pages/admin/AdminEditCodesPage';
import { AdminEditMapsPage } from './pages/admin/AdminEditMapsPage';
import { AuthProvider } from './hooks/useAuth';
const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-foreground">
      <Header />
      <Outlet />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
      {/* Welcome Screen */}
      <Route path="/" element={<WelcomePage />} />

      {/* Public Pages with Top Header Navigation */}
      <Route element={<PublicLayout />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/guides" element={<Navigate to="/feed" replace />} />
        <Route path="/updates" element={<UpdatesPage />} />
        <Route path="/codes" element={<RedemptionCodesPage />} />
        <Route path="/redemption-codes" element={<Navigate to="/codes" replace />} />
      </Route>

      {/* Auth / Admin Login */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/auth" element={<Navigate to="/admin/login" replace />} />

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminLayout>
            <AdminOverviewPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/overview"
        element={<Navigate to="/admin" replace />}
      />
      <Route
        path="/admin/edit"
        element={
          <AdminLayout>
            <AdminEditPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/edit/events"
        element={<Navigate to="/admin/edit" replace />}
      />
      <Route
        path="/admin/edit/codes"
        element={
          <AdminLayout>
            <AdminEditCodesPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/edit/maps"
        element={
          <AdminLayout>
            <AdminEditMapsPage />
          </AdminLayout>
        }
      />

      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  </AuthProvider>
  );
};

export default App;

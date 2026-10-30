import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useEvents } from '../../hooks/useEvents';
import { AdminHeader } from './AdminHeader';
import { AdminFooter } from './AdminFooter';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const { events } = useEvents();

  // Add <meta name="robots" content="noindex">
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    let created = false;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      meta.setAttribute('content', 'noindex');
      document.head.appendChild(meta);
      created = true;
    } else {
      meta.setAttribute('content', 'noindex');
    }

    return () => {
      if (created && meta && meta.parentNode) {
        meta.parentNode.removeChild(meta);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <img
            src="/bunny-logo.webp"
            alt="Loading"
            className="bob size-14 object-contain select-none"
          />
          <p className="font-mono text-sm text-muted-foreground animate-pulse">
            Checking admin credentials… 🐾
          </p>
        </div>
      </div>
    );
  }

  const isPreview = typeof window !== 'undefined' && window.location.search.includes('preview=true');

  if (!isAuthenticated && !isPreview) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased selection:bg-primary selection:text-foreground">
      <AdminHeader />
      <div className="flex-1">
        {children}
      </div>
      <AdminFooter eventCount={events.length} />
    </div>
  );
};

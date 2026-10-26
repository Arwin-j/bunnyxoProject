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
  const { isAuthenticated } = useAuth();
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

  if (!isAuthenticated) {
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

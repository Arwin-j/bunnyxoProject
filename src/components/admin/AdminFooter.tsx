import React, { useState, useEffect } from 'react';
import { EVENTS_STORAGE_KEY } from '../../data';
import { isSupabaseConfigured } from '../../lib/supabase';

interface AdminFooterProps {
  eventCount?: number;
}

export const AdminFooter: React.FC<AdminFooterProps> = ({ eventCount = 0 }) => {
  const [utcTime, setUtcTime] = useState<string>('');
  const isSupabase = isSupabaseConfigured();

  useEffect(() => {
    const updateTime = () => {
      setUtcTime(new Date().toUTCString());
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <footer className="mt-auto border-t-2 border-foreground/20 bg-muted/70 px-4 py-2 font-mono text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>DEV CONSOLE</span>
        </span>
        <span>•</span>
        <span>Storage: <code className="bg-background px-1 py-0.5 rounded border">{isSupabase ? 'Supabase Cloud (events)' : EVENTS_STORAGE_KEY}</code></span>
        <span>•</span>
        <span>Records: <strong className="text-foreground">{eventCount}</strong></span>
      </div>

      <div className="flex items-center gap-3">
        <span>UTC: {utcTime || '...'}</span>
        <span>•</span>
        <span className="text-[11px] opacity-80">{isSupabase ? 'Supabase Live' : 'Local Storage Fallback'}</span>
      </div>
    </footer>
  );
};

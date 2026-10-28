import React from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { BunnyLogo } from '../common/BunnyLogo';

export const AdminHeader: React.FC = () => {
  const { signOut, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditActive = location.pathname.startsWith('/admin/edit');

  const handleLogout = () => {
    signOut();
    navigate('/admin/login', { replace: true });
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-dashed border-primary bg-background px-4 py-2.5 shadow-xs">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Match logo from main site navigation bar */}
        <Link
          to="/admin"
          aria-label="Admin Overview"
          title="Admin Overview"
          className="shrink-0 flex items-center"
        >
          <BunnyLogo className="bob h-5 sm:h-6 w-auto shrink-0 select-none object-contain" />
        </Link>

        <Link
          to="/admin"
          className="text-lg sm:text-xl font-bold tracking-tight text-foreground hover:opacity-85"
        >
          Bunny Admin
        </Link>

        {currentUser?.email ? (
          <span
            className="hidden sm:inline-block rounded-full border border-emerald-600 bg-emerald-50 px-2.5 py-0.5 text-xs font-mono font-bold text-emerald-800"
            title={`Authenticated via Supabase as ${currentUser.email}`}
          >
            🔒 {currentUser.email}
          </span>
        ) : (
          <span
            className="hidden sm:inline-block rounded-full border border-emerald-600 bg-emerald-50 px-2.5 py-0.5 text-xs font-mono font-bold text-emerald-800"
          >
            🔒 Secure Admin
          </span>
        )}
      </div>

      <nav className="flex items-center gap-2">
        {/* Edit button with tool icon */}
        <Link
          to="/admin/edit"
          className={`flex items-center gap-1.5 rounded-full border-[2.5px] px-3.5 py-1 text-xs sm:text-sm font-semibold transition-all active:translate-y-0.5 ${
            isEditActive
              ? 'bg-primary border-foreground shadow-ink text-foreground'
              : 'border-foreground/30 bg-card hover:bg-accent hover:border-foreground text-foreground'
          }`}
        >
          <span aria-hidden="true">🔧</span>
          <span>Edit</span>
        </Link>

        <div className="h-5 w-[2px] bg-foreground/20 mx-1" />

        <Link
          to="/home"
          target="_blank"
          rel="noopener noreferrer"
          title="Open public website in new tab"
          className="flex items-center gap-1 rounded-full border-2 border-foreground/30 bg-card px-2.5 py-1 text-xs sm:text-sm font-semibold hover:bg-accent hover:border-foreground transition-all"
        >
          <span>🌐</span>
          <span className="hidden md:inline">View Site ↗</span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          title="Sign out of temporary admin session"
          className="cursor-pointer flex items-center gap-1 rounded-full border-2 border-foreground/30 bg-card px-2.5 py-1 text-xs sm:text-sm font-semibold hover:bg-primary/40 hover:border-foreground transition-all active:translate-y-0.5"
        >
          <span>🚪</span>
          <span className="hidden md:inline">Log out</span>
        </button>
      </nav>
    </header>
  );
};

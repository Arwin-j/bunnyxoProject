import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { BunnyLogo } from '../common/BunnyLogo';

export const AdminHeader: React.FC = () => {
  const { signOut, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditActive = location.pathname.startsWith('/admin/edit');
  const isOverviewActive = location.pathname === '/admin' || location.pathname === '/admin/overview';

  const handleLogout = () => {
    signOut();
    navigate('/admin/login', { replace: true });
  };

  return (
    <header className="sticky top-2 z-30 px-3 sm:px-6 pt-2 pb-1 max-w-7xl mx-auto w-full">
      <nav className="flex items-center gap-2 sm:gap-3 flex-wrap bg-[#a9ad73] rounded-[26px] p-2 sm:px-4 sm:py-2.5 shadow-sm">
        {/* Circular Dashed Logo */}
        <Link
          to="/admin"
          aria-label="Bunny Admin Overview"
          title="Bunny Admin"
          className="size-11 sm:size-12 rounded-full bg-[#fbd5e1] border-[3px] border-dashed border-white flex items-center justify-center font-heading font-bold text-[#b23a6b] text-xs shrink-0 hover:scale-105 transition-transform"
        >
          <BunnyLogo className="h-6 w-auto object-contain select-none" />
        </Link>

        <Link
          to="/admin"
          className="font-heading font-bold text-base sm:text-lg text-white hover:opacity-90 tracking-tight"
        >
          Bunny Admin
        </Link>

        {currentUser?.email && (
          <span className="hidden md:inline-block rounded-full bg-[#f3ecda] px-3 py-1 text-xs font-mono font-bold text-[#6b4f35]">
            🔒 {currentUser.email}
          </span>
        )}

        <div className="flex-1 min-w-0" />

        {/* Navigation Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            to="/admin/overview"
            className={`rounded-full px-3.5 py-1.5 font-heading font-semibold text-xs sm:text-sm transition-all select-none active:translate-y-0.5 ${
              isOverviewActive
                ? 'bg-[#b23a6b] text-white shadow-xs'
                : 'bg-[#f3ecda] text-[#b23a6b] hover:bg-white'
            }`}
          >
            📊 Overview
          </Link>

          <Link
            to="/admin/edit"
            className={`rounded-full px-3.5 py-1.5 font-heading font-semibold text-xs sm:text-sm transition-all select-none active:translate-y-0.5 ${
              isEditActive
                ? 'bg-[#b23a6b] text-white shadow-xs'
                : 'bg-[#f3ecda] text-[#b23a6b] hover:bg-white'
            }`}
          >
            🔧 Edit
          </Link>

          <Link
            to="/home"
            target="_blank"
            rel="noopener noreferrer"
            title="Open public website in new tab"
            className="rounded-full px-3 py-1.5 font-heading font-semibold text-xs sm:text-sm bg-[#f3ecda] text-[#6b4f35] hover:bg-white transition-all select-none flex items-center gap-1"
          >
            <span>🌐</span>
            <span className="hidden sm:inline">View Site ↗</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            title="Sign out of admin session"
            className="cursor-pointer rounded-full px-3 py-1.5 font-heading font-semibold text-xs sm:text-sm bg-[#f3ecda] text-[#b23a6b] hover:bg-white transition-all select-none flex items-center gap-1"
          >
            <span>🚪</span>
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default AdminHeader;

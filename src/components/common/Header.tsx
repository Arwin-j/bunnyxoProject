import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { BunnyLogo } from './BunnyLogo';
import { useAuth } from '../../hooks/useAuth';

const NAV_LINKS = [
  { to: '/home', label: 'Home' },
  { to: '/events', label: 'Events' },
  { to: '/map', label: 'Map' },
  { to: '/codes', label: 'Codes' },
  { to: '/feed', label: 'Feed' },
  { to: '/updates', label: 'Updates' },
];

export const Header: React.FC = () => {
  const location = useLocation();
  const { currentUser, isAuthenticated, signOut } = useAuth();

  const isCodesActive =
    location.pathname.startsWith('/codes') ||
    location.pathname.startsWith('/redemption-codes');

  const username = currentUser?.email
    ? currentUser.email.split('@')[0]
    : 'Bunny Friend';

  return (
    <header className="sticky top-2 z-30 px-3 sm:px-6 pt-2 pb-1 max-w-7xl mx-auto w-full">
      <nav className="flex items-center gap-2 sm:gap-3 flex-wrap bg-[#a9ad73] rounded-[26px] p-2 sm:px-4 sm:py-2.5 shadow-sm">
        {/* Circular Dashed Logo */}
        <Link
          to="/home"
          aria-label="Bunny xo Home"
          title="Bunny xo"
          className="size-11 sm:size-13 rounded-full bg-[#fbd5e1] border-[3px] border-dashed border-white flex items-center justify-center font-heading font-bold text-[#b23a6b] text-xs sm:text-sm shrink-0 hover:scale-105 transition-transform"
        >
          <BunnyLogo className="h-6 sm:h-7 w-auto object-contain select-none" />
        </Link>

        {/* Navigation Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap overflow-x-auto no-scrollbar py-0.5">
          {NAV_LINKS.map((link) => {
            const isHome = link.to === '/home';
            const isActive =
              isHome
                ? location.pathname === '/home' || location.pathname === '/'
                : link.to === '/codes'
                ? isCodesActive
                : location.pathname.startsWith(link.to);

            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={`rounded-full px-3.5 py-1.5 sm:px-4 sm:py-2 font-heading font-semibold text-sm sm:text-base transition-all select-none active:translate-y-0.5 ${
                  isActive
                    ? 'bg-[#b23a6b] text-white shadow-xs'
                    : 'bg-[#f3ecda] text-[#b23a6b] hover:bg-white/90'
                }`}
              >
                {link.label}
              </NavLink>
            );
          })}
        </div>

        {/* Spacer */}
        <div className="flex-1 min-w-0" />

        {/* Right: User / Admin Pill */}
        <div className="bg-[#f3ecda] rounded-full py-1.5 px-3.5 sm:px-4 flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm font-sans font-medium text-[#6b4f35] shrink-0">
          <div className="size-7 sm:size-8 rounded-full bg-[#f6c9b8] flex items-center justify-center font-heading font-bold text-[#b23a6b] text-xs">
            🐾
          </div>
          <span className="truncate max-w-[120px] sm:max-w-[160px]">
            <strong className="text-[#6b4f35]">{username}</strong>
            {' · '}
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => signOut()}
                className="text-[#b23a6b] font-bold hover:underline cursor-pointer"
              >
                Log out
              </button>
            ) : (
              <Link to="/admin" className="text-[#b23a6b] font-bold hover:underline">
                Admin
              </Link>
            )}
          </span>
        </div>
      </nav>
    </header>
  );
};

import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { BunnyLogo } from './BunnyLogo';

const NAV_LINKS = [
  { to: '/events', emoji: '🎟️', label: 'Events' },
  { to: '/map', emoji: '🗺️', label: 'Map' },
  { to: '/feed', emoji: '📰', label: 'Feed' },
  { to: '/updates', emoji: '📣', label: 'Updates' },
];

export const Header: React.FC = () => {
  const location = useLocation();
  const isCodesActive =
    location.pathname.startsWith('/codes') ||
    location.pathname.startsWith('/redemption-codes');

  return (
    <header className="sticky top-0 z-20 flex items-center gap-2 border-b-[3px] border-dashed border-primary bg-background px-3 py-2 sm:px-4">
      <Link to="/home" aria-label="Home" className="shrink-0 flex items-center gap-2">
        <BunnyLogo className="bob h-5 sm:h-6 w-auto shrink-0 select-none object-contain" />
      </Link>
      <Link to="/home" className="shrink-0 text-lg font-semibold sm:text-2xl hover:opacity-90">
        Bunny Hub
      </Link>

      {/* Codes Button next to Bunny Hub */}
      <NavLink
        to="/codes"
        title="Redemption Codes"
        aria-label="Redemption Codes"
        className={({ isActive }) => {
          const active = isActive || isCodesActive;
          return `nav-codes-btn ${active ? 'nav-codes-btn-active' : 'nav-codes-btn-inactive'}`;
        }}
      >
        <span className="text-sm select-none" aria-hidden="true">🎁</span>
        <span className="nav-codes-text">Codes</span>
      </NavLink>

      <nav className="no-scrollbar ml-auto sm:ml-2 flex min-w-0 gap-1 overflow-x-auto py-1">
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            aria-label={link.label}
            title={link.label}
            className={({ isActive }) =>
              `flex shrink-0 items-center gap-1 rounded-full border-[3px] px-2.5 py-0.5 text-base sm:text-lg transition-transform active:translate-y-0.5 ${
                isActive
                  ? '!border-foreground bg-primary shadow-ink font-semibold'
                  : 'border-transparent hover:bg-accent font-medium'
              }`
            }
          >
            <span aria-hidden="true">{link.emoji}</span>
            <span className="hidden text-sm md:inline sm:text-base">{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </header>
  );
};

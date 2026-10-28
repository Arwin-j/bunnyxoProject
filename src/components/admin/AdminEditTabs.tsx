import React from 'react';
import { NavLink } from 'react-router-dom';

export interface AdminEditTabsProps {
  currentTab?: 'events' | 'codes' | 'maps';
}

export const AdminEditTabs: React.FC<AdminEditTabsProps> = () => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-dashed border-foreground/30 pb-4 mb-6">
      <div className="flex items-center gap-2">
        {/* Events Tab */}
        <NavLink
          to="/admin/edit"
          end
          className={({ isActive }) =>
            `flex items-center gap-2 rounded-full border-2 border-foreground px-4 sm:px-5 py-1.5 text-sm sm:text-base font-bold shadow-ink transition-all duration-150 select-none cursor-pointer active:translate-y-0.5 ${
              isActive
                ? 'bg-primary text-foreground'
                : 'bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
            }`
          }
        >
          <span className="text-base select-none" aria-hidden="true">🎟️</span>
          <span>Events</span>
        </NavLink>

        {/* Codes Tab */}
        <NavLink
          to="/admin/edit/codes"
          className={({ isActive }) =>
            `flex items-center gap-2 rounded-full border-2 border-foreground px-4 sm:px-5 py-1.5 text-sm sm:text-base font-bold shadow-ink transition-all duration-150 select-none cursor-pointer active:translate-y-0.5 ${
              isActive
                ? 'bg-[#d97028] text-white hover:bg-[#e07e38]'
                : 'bg-[#e11d48] text-white hover:bg-[#fca5a5] hover:text-foreground'
            }`
          }
        >
          <span className="text-base select-none" aria-hidden="true">🎁</span>
          <span>Codes</span>
        </NavLink>

        {/* Maps Tab */}
        <NavLink
          to="/admin/edit/maps"
          className={({ isActive }) =>
            `flex items-center gap-2 rounded-full border-2 border-foreground px-4 sm:px-5 py-1.5 text-sm sm:text-base font-bold shadow-ink transition-all duration-150 select-none cursor-pointer active:translate-y-0.5 ${
              isActive
                ? 'bg-[#86efac] text-foreground'
                : 'bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
            }`
          }
        >
          <span className="text-base select-none" aria-hidden="true">🗺️</span>
          <span>Maps</span>
        </NavLink>
      </div>

      <span className="hidden sm:inline-block text-xs font-mono font-bold text-muted-foreground">
        Admin Edit Mode
      </span>
    </div>
  );
};

export default AdminEditTabs;

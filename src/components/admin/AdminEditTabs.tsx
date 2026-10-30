import React from 'react';
import { NavLink } from 'react-router-dom';

export interface AdminEditTabsProps {
  currentTab?: 'events' | 'codes' | 'maps';
}

export const AdminEditTabs: React.FC<AdminEditTabsProps> = () => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e9b3ad]/40 pb-4 mb-6">
      <div className="flex items-center gap-2">
        {/* Events Tab */}
        <NavLink
          to="/admin/edit"
          end
          className={({ isActive }) =>
            `flex items-center gap-2 rounded-full px-4 sm:px-5 py-1.5 text-xs sm:text-sm font-heading font-semibold transition-all duration-150 select-none cursor-pointer active:translate-y-0.5 ${
              isActive
                ? 'bg-[#b23a6b] text-white shadow-xs'
                : 'bg-[#f3ecda] text-[#6b4f35] hover:bg-white'
            }`
          }
        >
          <span className="text-sm select-none" aria-hidden="true">🎟️</span>
          <span>Events</span>
        </NavLink>

        {/* Codes Tab */}
        <NavLink
          to="/admin/edit/codes"
          className={({ isActive }) =>
            `flex items-center gap-2 rounded-full px-4 sm:px-5 py-1.5 text-xs sm:text-sm font-heading font-semibold transition-all duration-150 select-none cursor-pointer active:translate-y-0.5 ${
              isActive
                ? 'bg-[#b23a6b] text-white shadow-xs'
                : 'bg-[#f3ecda] text-[#6b4f35] hover:bg-white'
            }`
          }
        >
          <span className="text-sm select-none" aria-hidden="true">🎁</span>
          <span>Codes</span>
        </NavLink>

        {/* Maps Tab */}
        <NavLink
          to="/admin/edit/maps"
          className={({ isActive }) =>
            `flex items-center gap-2 rounded-full px-4 sm:px-5 py-1.5 text-xs sm:text-sm font-heading font-semibold transition-all duration-150 select-none cursor-pointer active:translate-y-0.5 ${
              isActive
                ? 'bg-[#b23a6b] text-white shadow-xs'
                : 'bg-[#f3ecda] text-[#6b4f35] hover:bg-white'
            }`
          }
        >
          <span className="text-sm select-none" aria-hidden="true">🗺️</span>
          <span>Maps</span>
        </NavLink>
      </div>

      <span className="hidden sm:inline-block text-xs font-mono font-bold text-[#8c6f55]">
        Admin Edit Mode
      </span>
    </div>
  );
};

export default AdminEditTabs;

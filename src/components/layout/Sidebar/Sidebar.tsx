import React from 'react';
import type { SidebarProps, ActiveMenuItem } from './Sidebar.types';
import { DashboardIcon, CreateTicketIcon, DaftarTicketIcon, MasterCategoryIcon, ReportIcon } from './SidebarIcons';

export const Sidebar: React.FC<SidebarProps> = ({
  activeItem = 'dashboard',
  onNavigate,
  onLogout,
}) => {
  const menuItems = [
    {
      id: 'dashboard' as ActiveMenuItem,
      label: 'Dashboard',
      icon: DashboardIcon,
    },
    {
      id: 'create-ticket' as ActiveMenuItem,
      label: 'Buat Tiket',
      icon: CreateTicketIcon,
    },
    {
      id: 'my-tickets' as ActiveMenuItem,
      label: 'Daftar Tiket',
      icon: DaftarTicketIcon,
    },
    {
      id: 'report' as ActiveMenuItem,
      label: 'Report',
      icon: ReportIcon,
    },
    {
      id: 'master-category' as ActiveMenuItem,
      label: 'Master Kategori',
      icon: MasterCategoryIcon,
    },
  ];

  return (
    <aside className="w-[248px] h-screen bg-[#0C3E7E] flex flex-col justify-between p-6 flex-shrink-0 select-none text-white">
      {/* Top Header with Trans TV Logo & Version */}
      <div>
        <div className="flex items-center justify-between mb-8 -ml-6 -mr-2">
          {/* ========================================================================= */}
          {/* WADAH & LOGO TRANS TV: */}
          {/* 1. Ukuran wadah putih: h-[50px] (tinggi) dan w-[118px] (lebar)            */}
          {/* 2. Ukuran logo diatur via: scale-[1.85] (ubah 1.85 untuk memperbesar/kecil) */}
          {/* ========================================================================= */}
          <div className="bg-white pl-6 pr-4 h-[50px] w-[118px] rounded-r-[28px] shadow-sm flex items-center justify-center overflow-hidden">
            <img
              src="/assets/TRANSTV.png"
              alt="TRANS TV Logo"
              className="h-[52px] w-auto max-w-none object-contain scale-[1.85] select-none transition-transform"
            />
          </div>

          {/* Version text on the right */}
          <div className="text-right pr-4">
            <div className="text-[14px] font-medium text-[#93C5FD] leading-[20px] tracking-wide">
              v1.0.0
            </div>
            <div className="text-[14px] font-medium text-[#93C5FD] leading-[20px] tracking-wide">
              2026
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate?.(item.id)}
                className={`group w-full flex items-center gap-[12px] px-[14px] py-[8px] rounded-full text-[14.5px] leading-[20px] transition-all duration-200 text-left select-none cursor-pointer ${
                  isActive
                    ? 'bg-white/20 text-white font-semibold shadow-sm'
                    : 'text-white/80 hover:bg-white/20 hover:text-white font-medium hover:shadow-sm'
                }`}
              >
                {/* Icon with circular highlight when active or hovered */}
                <div
                  className={`w-[32px] h-[32px] rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'text-white/80 group-hover:bg-white/20 group-hover:text-white'
                  }`}
                >
                  <Icon />
                </div>
                <span className="tracking-[-0.2px] transition-colors">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Logout Button: Text Only, Turns Red on Hover */}
      <div className="pt-4 border-t border-white/10">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center py-[11px] px-6 rounded-full bg-white hover:bg-[#FF0000] text-[#FF0000] hover:text-white transition-all duration-200 shadow-sm active:scale-95 cursor-pointer font-bold text-[14px] leading-tight tracking-wider select-none"
        >
          LOGOUT
        </button>
      </div>
    </aside>
  );
};

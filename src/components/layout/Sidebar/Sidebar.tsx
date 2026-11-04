import React from 'react';
import type { SidebarProps, ActiveMenuItem } from './Sidebar.types';
import {
  DashboardIcon,
  CreateTicketIcon,
  DaftarTicketIcon,
  MasterCategoryIcon,
  ReportIcon,
} from './SidebarIcons';
import { X, Menu as MenuIcon, LogOut } from 'lucide-react';

export const Sidebar: React.FC<SidebarProps> = ({
  activeItem = 'dashboard',
  onNavigate,
  onLogout,
  userRole = 'user',
  isMobileOpen = false,
  onCloseMobile,
  onOpenMobile,
  currentUser,
}) => {
  const allMenuItems = [
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

  // RBAC: User biasa hanya memiliki 3 menu (Dashboard, Buat Tiket, Daftar Tiket)
  // Admin memiliki seluruh menu (termasuk Report & Master Kategori)
  const menuItems =
    userRole === 'user'
      ? allMenuItems.filter(
          (item) =>
            item.id === 'dashboard' ||
            item.id === 'create-ticket' ||
            item.id === 'my-tickets'
        )
      : allMenuItems;

  // Primary bottom bar items for mobile (keep it 3-4 items max to fit nicely)
  const bottomBarItems =
    userRole === 'user'
      ? menuItems
      : allMenuItems.filter((item) =>
          ['dashboard', 'create-ticket', 'my-tickets', 'report'].includes(item.id)
        );

  const handleNavClick = (id: ActiveMenuItem) => {
    onNavigate?.(id);
    onCloseMobile?.();
  };

  const renderNavList = () => (
    <nav className="space-y-2">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeItem === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleNavClick(item.id)}
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
  );

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. DESKTOP PERMANENT SIDEBAR (>= 1024px)                                  */}
      {/* ========================================================================= */}
      <aside className="hidden lg:flex w-[248px] h-screen bg-[#0C3E7E] flex-col justify-between p-6 flex-shrink-0 select-none text-white">
        {/* Top Header with Trans TV Logo & Version */}
        <div>
          <div className="flex items-center justify-between mb-8 -ml-6 -mr-2">
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
          {renderNavList()}
        </div>

        {/* Bottom Logout Button: Text Only, Turns Red on Hover */}
        <div className="pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-center py-[11px] px-6 rounded-full bg-white hover:bg-[#FF0000] text-[#FF0000] hover:text-white transition-all duration-200 shadow-sm active:scale-95 cursor-pointer font-bold text-[14px] leading-tight tracking-wider select-none"
          >
            LOGOUT
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MOBILE OFF-CANVAS DRAWER (< 1024px)                                    */}
      {/* ========================================================================= */}
      {/* Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 lg:hidden animate-in fade-in duration-200"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] bg-[#0C3E7E] flex flex-col justify-between p-6 select-none text-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
        }`}
        aria-label="Mobile Navigation Menu"
      >
        <div>
          {/* Drawer Header with Logo & Close Button */}
          <div className="flex items-center justify-between mb-8 -ml-6 -mr-2">
            <div className="bg-white pl-6 pr-4 h-[46px] w-[112px] rounded-r-[28px] shadow-sm flex items-center justify-center overflow-hidden">
              <img
                src="/assets/TRANSTV.png"
                alt="TRANS TV Logo"
                className="h-[48px] w-auto max-w-none object-contain scale-[1.85] select-none"
              />
            </div>

            <div className="flex items-center gap-3 pr-2">
              <div className="text-right">
                <span className="text-[12px] font-medium text-[#93C5FD]">v1.0.0</span>
              </div>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label="Tutup menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          {renderNavList()}
        </div>

        {/* User Profile Summary & Logout */}
        <div className="pt-4 border-t border-white/15 space-y-3">
          {currentUser && (
            <div className="flex items-center gap-3 bg-white/10 rounded-2xl p-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {currentUser.name
                  ? currentUser.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                  : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-bold text-white truncate">
                  {currentUser.name}
                </div>
                <div className="text-[11px] text-[#93C5FD] truncate">
                  {currentUser.department || 'TRANS TV'}
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              onCloseMobile?.();
              onLogout?.();
            }}
            className="w-full flex items-center justify-center gap-2 py-[10px] px-6 rounded-full bg-white hover:bg-[#FF0000] text-[#FF0000] hover:text-white transition-all duration-200 shadow-sm active:scale-95 cursor-pointer font-bold text-[13px] tracking-wider select-none"
          >
            <LogOut className="w-4 h-4" />
            <span>LOGOUT</span>
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 3. MOBILE BOTTOM NAVIGATION BAR (< 1024px)                                */}
      {/* Quick 1-tap switching for mobile users                                    */}
      {/* ========================================================================= */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-2 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.06)] lg:hidden"
        aria-label="Mobile Bottom Bar"
      >
        {bottomBarItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          const isCreate = item.id === 'create-ticket';

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
                isActive ? 'text-[#0C3E7E] font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div
                className={`p-1.5 rounded-full transition-transform active:scale-90 ${
                  isActive
                    ? 'bg-[#0C3E7E] text-white shadow-xs'
                    : isCreate
                    ? 'bg-blue-50 text-[#0C3E7E]'
                    : 'text-slate-500'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`text-[10.5px] mt-0.5 tracking-tight ${
                  isActive ? 'font-bold text-[#0C3E7E]' : 'font-medium text-slate-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}

        {/* More / Menu Drawer Toggle Button */}
        <button
          type="button"
          onClick={onOpenMobile}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-500 hover:text-slate-800 transition-all cursor-pointer active:scale-90"
          aria-label="Buka menu lengkap"
        >
          <div className="p-1.5 rounded-full text-slate-500">
            <MenuIcon className="w-4 h-4" />
          </div>
          <span className="text-[10.5px] mt-0.5 font-medium text-slate-500 tracking-tight">
            Menu
          </span>
        </button>
      </nav>
    </>
  );
};

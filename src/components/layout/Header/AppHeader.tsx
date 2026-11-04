import React from 'react';
import { Menu } from 'lucide-react';

interface AppHeaderProps {
  currentUser?: {
    name?: string;
    nik?: string;
    department?: string;
    role?: 'user' | 'admin';
  };
  onOpenMobileMenu?: () => void;
  rightAction?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentUser,
  onOpenMobileMenu,
  rightAction,
}) => {
  const userInitials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <header className="flex items-center justify-between flex-shrink-0 gap-3">
      {/* Left: Mobile Hamburger Button & Helpdesk Brand Logo */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer active:scale-95 transition-all"
            aria-label="Buka navigasi menu"
          >
            <Menu className="w-5 h-5 text-[#0C3E7E]" />
          </button>
        )}
        <img
          src="/assets/helpdesk.png"
          alt="Helpdesk Logo"
          className="h-[36px] sm:h-[42px] md:h-[48px] w-auto object-contain select-none"
        />
      </div>

      {/* Right: Custom Action or User Profile Badge */}
      <div className="flex items-center gap-2 sm:gap-3">
        {rightAction}

        {currentUser && (
          <div className="flex items-center gap-2 sm:gap-2.5 bg-white pl-1.5 pr-2 sm:pr-4 py-1.5 rounded-full border border-slate-200/80 shadow-xs">
            <div className="w-[30px] h-[30px] rounded-full bg-[#DDE5ED] text-[#1E293B] font-bold text-[12px] flex items-center justify-center uppercase shrink-0">
              {userInitials}
            </div>
            <div className="hidden sm:flex flex-col text-left leading-tight">
              <span className="text-[12.5px] sm:text-[13px] font-semibold text-[#1E293B] truncate max-w-[150px]">
                {currentUser.name}
              </span>
              {currentUser.role && (
                <span className="text-[10px] text-slate-500 font-medium capitalize">
                  {currentUser.role === 'admin' ? 'IT Admin' : 'Employee'}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};


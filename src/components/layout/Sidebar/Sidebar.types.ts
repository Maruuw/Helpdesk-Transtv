export type ActiveMenuItem = 'dashboard' | 'create-ticket' | 'my-tickets' | 'report' | 'master-category';

export interface SidebarProps {
  activeItem?: ActiveMenuItem;
  onNavigate?: (item: ActiveMenuItem) => void;
  onLogout?: () => void;
  userRole?: 'user' | 'admin';
}

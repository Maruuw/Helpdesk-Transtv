export type ActiveMenuItem = 'dashboard' | 'create-ticket' | 'my-tickets' | 'master-category';

export interface SidebarProps {
  activeItem?: ActiveMenuItem;
  onNavigate?: (item: ActiveMenuItem) => void;
  onLogout?: () => void;
}

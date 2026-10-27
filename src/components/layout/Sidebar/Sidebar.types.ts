export type ActiveMenuItem = 'dashboard' | 'create-ticket' | 'my-tickets';

export interface SidebarProps {
  activeItem?: ActiveMenuItem;
  onNavigate?: (item: ActiveMenuItem) => void;
  onLogout?: () => void;
}

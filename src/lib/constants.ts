
import type { LucideIcon } from 'lucide-react';
import { LayoutGrid, ShoppingCart, BookOpen, Settings, Users,ClipboardList } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: UserRole[]; // Placeholder for role-based access
}

export type UserRole = 'admin' | 'cashier' | 'waiter';

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Table View', icon: LayoutGrid, roles: ['admin', 'waiter', 'cashier'] },
  { href: '/dashboard/orders', label: 'Orders', icon: ShoppingCart, roles: ['admin', 'waiter', 'cashier'] },
  { href: '/dashboard/active-orders', label: 'Active Orders', icon: ClipboardList, roles: ['admin', 'waiter', 'cashier'] },
  { href: '/dashboard/menu', label: 'Menu Editor', icon: BookOpen, roles: ['admin'] },
  { href: '/dashboard/tables', label: 'Table Setup', icon: LayoutGrid, roles: ['admin'] },
  { href: '/dashboard/staff', label: 'Staff Management', icon: Users, roles: ['admin'] },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, roles: ['admin'] },
];

export const APP_NAME = "Tabletop AI";

export const IVA_RATE = 0.13; // Example: 13% IVA for El Salvador

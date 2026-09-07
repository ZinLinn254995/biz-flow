import {
  LayoutDashboard,
  BriefcaseBusiness,
  Package,
  ShoppingCart,
  Users,
  Receipt,
  WalletCards,
  ChartNoAxesCombined,
  Settings,
  Tag,
  Wallet,
  Target,
  type LucideIcon,
} from 'lucide-react';

export interface NavigationItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

export const navigationGroups: NavigationGroup[] = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Business',
    items: [
      { label: 'Business', path: '/business', icon: BriefcaseBusiness },
      { label: 'Inventory', path: '/inventory', icon: Package },
      { label: 'Sales', path: '/sales', icon: ShoppingCart },
      { label: 'Customers', path: '/customers', icon: Users },
      { label: 'Business Expenses', path: '/business-expenses', icon: Receipt },
    ],
  },
  {
    label: 'Personal',
    items: [
      { label: 'Personal Finance', path: '/personal', icon: WalletCards },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { label: 'Categories', path: '/categories', icon: Tag },
      { label: 'Accounts', path: '/accounts', icon: Wallet },
      { label: 'Budgets', path: '/budgets', icon: Target },
    ],
  },
  {
    label: 'Insights',
    items: [
      { label: 'Analytics', path: '/analytics', icon: ChartNoAxesCombined },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings', path: '/settings', icon: Settings },
    ],
  },
];

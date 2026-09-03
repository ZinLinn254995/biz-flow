import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Receipt,
  PackagePlus,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

interface QuickAction {
  label: string;
  path: string;
  icon: LucideIcon;
}

const actions: QuickAction[] = [
  { label: 'Add Sale', path: '/sales', icon: ShoppingCart },
  { label: 'Add Expense', path: '/business-expenses', icon: Receipt },
  { label: 'Add Inventory', path: '/inventory', icon: PackagePlus },
  { label: 'Add Personal Expense', path: '/personal', icon: Wallet },
];

function QuickActions() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.path}
              to={action.path}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors group focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-gray-900 transition-colors">
                <Icon
                  className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors"
                  strokeWidth={2}
                />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                {action.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default QuickActions;

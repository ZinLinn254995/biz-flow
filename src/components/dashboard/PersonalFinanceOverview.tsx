import { WalletCards, Wallet, CircleDollarSign, Target } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';

function PersonalFinanceOverview() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">
        Personal Finance Overview
      </h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <WalletCards className="w-3.5 h-3.5 text-gray-500" strokeWidth={2} />
            <span className="text-xs text-gray-500">Income</span>
          </div>
          <p className="text-lg font-bold text-gray-900">—</p>
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Wallet className="w-3.5 h-3.5 text-amber-600" strokeWidth={2} />
            <span className="text-xs text-gray-500">Expenses</span>
          </div>
          <p className="text-lg font-bold text-gray-900">—</p>
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <CircleDollarSign
              className="w-3.5 h-3.5 text-green-600"
              strokeWidth={2}
            />
            <span className="text-xs text-gray-500">Balance</span>
          </div>
          <p className="text-lg font-bold text-gray-900">—</p>
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Target className="w-3.5 h-3.5 text-gray-500" strokeWidth={2} />
            <span className="text-xs text-gray-500">Budget</span>
          </div>
          <p className="text-lg font-bold text-gray-900">—</p>
        </div>
      </div>
      <div className="border-t border-gray-100 pt-4">
        <EmptyState
          icon={WalletCards}
          title="No personal finance data yet"
          description="Your personal income, expenses, and budget status will appear here once you start tracking."
        />
      </div>
    </div>
  );
}

export default PersonalFinanceOverview;

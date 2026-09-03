import { TrendingUp, Receipt, CircleDollarSign } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';

function BusinessOverview() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">
        Business Overview
      </h2>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-green-600" strokeWidth={2} />
            <span className="text-xs text-gray-500">Revenue</span>
          </div>
          <p className="text-lg font-bold text-gray-900">—</p>
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Receipt className="w-3.5 h-3.5 text-amber-600" strokeWidth={2} />
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
            <span className="text-xs text-gray-500">Profit</span>
          </div>
          <p className="text-lg font-bold text-gray-900">—</p>
        </div>
      </div>
      <div className="border-t border-gray-100 pt-4">
        <EmptyState
          icon={TrendingUp}
          title="No business data available yet"
          description="Your business revenue, expenses, and profit will appear here once you start adding transactions."
        />
      </div>
    </div>
  );
}

export default BusinessOverview;

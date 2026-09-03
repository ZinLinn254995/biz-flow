import { TrendingUp, Receipt, CircleDollarSign, WalletCards } from 'lucide-react';
import SummaryCard from '@/components/dashboard/SummaryCard';
import QuickActions from '@/components/dashboard/QuickActions';
import BusinessOverview from '@/components/dashboard/BusinessOverview';
import PersonalFinanceOverview from '@/components/dashboard/PersonalFinanceOverview';
import RecentActivity from '@/components/dashboard/RecentActivity';
import AnalyticsPreview from '@/components/dashboard/AnalyticsPreview';
import InventoryStatus from '@/components/dashboard/InventoryStatus';

function DashboardPage() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of your business and personal finances.
          </p>
        </div>
        <p className="text-xs text-gray-400 font-medium">{today}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          title="Business Revenue"
          value="—"
          description="No data yet"
          icon={TrendingUp}
          tone="positive"
        />
        <SummaryCard
          title="Business Expenses"
          value="—"
          description="No data yet"
          icon={Receipt}
          tone="warning"
        />
        <SummaryCard
          title="Business Profit"
          value="—"
          description="No data yet"
          icon={CircleDollarSign}
          tone="positive"
        />
        <SummaryCard
          title="Personal Expenses"
          value="—"
          description="No data yet"
          icon={WalletCards}
          tone="neutral"
        />
      </div>

      <QuickActions />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BusinessOverview />
        <PersonalFinanceOverview />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentActivity />
        <AnalyticsPreview />
      </div>

      <InventoryStatus />
    </div>
  );
}

export default DashboardPage;

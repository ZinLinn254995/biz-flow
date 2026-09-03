import { Clock3 } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';

function RecentActivity() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">
        Recent Activity
      </h2>
      <EmptyState
        icon={Clock3}
        title="No recent activity"
        description="Your latest business and personal transactions will appear here."
      />
    </div>
  );
}

export default RecentActivity;

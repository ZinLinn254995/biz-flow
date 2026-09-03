import { ChartNoAxesCombined } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';

function AnalyticsPreview() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">
        Analytics Preview
      </h2>
      <EmptyState
        icon={ChartNoAxesCombined}
        title="Analytics will appear here"
        description="Add transactions to start seeing financial trends."
      />
    </div>
  );
}

export default AnalyticsPreview;

import PageContainer from '@/components/layout/PageContainer';
import EmptyState from '@/components/ui/EmptyState';
import { ChartNoAxesCombined } from 'lucide-react';

function AnalyticsPage() {
  return (
    <PageContainer title="Analytics">
      <div className="bg-white border border-gray-200 rounded-xl">
        <EmptyState
          icon={ChartNoAxesCombined}
          title="Coming Soon"
          description="This feature will be implemented in a future BizFlow development phase."
        />
      </div>
    </PageContainer>
  );
}

export default AnalyticsPage;

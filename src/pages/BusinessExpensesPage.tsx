import PageContainer from '@/components/layout/PageContainer';
import EmptyState from '@/components/ui/EmptyState';
import { Receipt } from 'lucide-react';

function BusinessExpensesPage() {
  return (
    <PageContainer title="Business Expenses">
      <div className="bg-white border border-gray-200 rounded-xl">
        <EmptyState
          icon={Receipt}
          title="Coming Soon"
          description="This feature will be implemented in a future BizFlow development phase."
        />
      </div>
    </PageContainer>
  );
}

export default BusinessExpensesPage;

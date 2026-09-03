import PageContainer from '@/components/layout/PageContainer';
import EmptyState from '@/components/ui/EmptyState';
import { WalletCards } from 'lucide-react';

function PersonalFinancePage() {
  return (
    <PageContainer title="Personal Finance">
      <div className="bg-white border border-gray-200 rounded-xl">
        <EmptyState
          icon={WalletCards}
          title="Coming Soon"
          description="This feature will be implemented in a future BizFlow development phase."
        />
      </div>
    </PageContainer>
  );
}

export default PersonalFinancePage;

import PageContainer from '@/components/layout/PageContainer';
import EmptyState from '@/components/ui/EmptyState';
import { Users } from 'lucide-react';

function CustomersPage() {
  return (
    <PageContainer title="Customers">
      <div className="bg-white border border-gray-200 rounded-xl">
        <EmptyState
          icon={Users}
          title="Coming Soon"
          description="This feature will be implemented in a future BizFlow development phase."
        />
      </div>
    </PageContainer>
  );
}

export default CustomersPage;

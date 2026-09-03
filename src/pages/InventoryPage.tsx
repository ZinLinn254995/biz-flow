import PageContainer from '@/components/layout/PageContainer';
import EmptyState from '@/components/ui/EmptyState';
import { Package } from 'lucide-react';

function InventoryPage() {
  return (
    <PageContainer title="Inventory">
      <div className="bg-white border border-gray-200 rounded-xl">
        <EmptyState
          icon={Package}
          title="Coming Soon"
          description="This feature will be implemented in a future BizFlow development phase."
        />
      </div>
    </PageContainer>
  );
}

export default InventoryPage;

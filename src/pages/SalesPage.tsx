import PageContainer from '@/components/layout/PageContainer';
import EmptyState from '@/components/ui/EmptyState';
import { ShoppingCart } from 'lucide-react';

function SalesPage() {
  return (
    <PageContainer title="Sales">
      <div className="bg-white border border-gray-200 rounded-xl">
        <EmptyState
          icon={ShoppingCart}
          title="Coming Soon"
          description="This feature will be implemented in a future BizFlow development phase."
        />
      </div>
    </PageContainer>
  );
}

export default SalesPage;

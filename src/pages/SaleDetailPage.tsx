import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import { SaleReceipt } from '@/components/sales/SaleReceipt';
import { useBusinesses } from '@/hooks/business';
import { useCustomer } from '@/hooks/customers';
import { useSale } from '@/hooks/sales';
import type { EntityId } from '@/types/common/base';

function SaleDetailPage() {
  const { saleId } = useParams<{ saleId: string }>();
  const { data: sale, isLoading, error } = useSale((saleId || null) as EntityId | null);
  const { data: businesses } = useBusinesses();
  const { data: customer } = useCustomer(sale?.customerId ?? null);

  const businessName = businesses?.find((business) => business.id === sale?.businessId)?.name;

  if (isLoading) {
    return (
      <PageContainer title="Sale detail">
        <div className="flex items-center justify-center py-16 bg-white border border-gray-200 rounded-xl">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" strokeWidth={2} />
          <span className="ml-3 text-sm text-gray-500">Loading sale…</span>
        </div>
      </PageContainer>
    );
  }

  if (error || !sale) {
    return (
      <PageContainer title="Sale detail">
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white border border-gray-200 rounded-xl">
          <AlertCircle className="w-6 h-6 text-red-500" strokeWidth={1.5} />
          <h2 className="mt-3 text-sm font-semibold text-gray-900">Sale not found</h2>
          <p className="mt-1 text-sm text-gray-500">This sale may have been removed or is unavailable.</p>
          <Link
            to="/sales"
            className="mt-5 inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            Back to sales
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Sale detail" subtitle="Read-only receipt for this sale.">
      <Link
        to="/sales"
        className="print:hidden inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={2} />
        Back to sales
      </Link>
      <SaleReceipt
        sale={sale}
        businessName={businessName}
        customerName={customer?.name}
        onPrint={() => window.print()}
      />
    </PageContainer>
  );
}

export default SaleDetailPage;
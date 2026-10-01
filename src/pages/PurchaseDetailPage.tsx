import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import { useBusinesses } from '@/hooks/business';
import { usePurchase } from '@/hooks/purchases';
import type { EntityId } from '@/types/common/base';

function formatMoney(amountMinor: number, currency: string): string {
  return `${currency} ${(amountMinor / 100).toFixed(2)}`;
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function PurchaseDetailPage() {
  const { purchaseId } = useParams<{ purchaseId: string }>();
  const { data: purchase, isLoading, error } = usePurchase((purchaseId || null) as EntityId | null);
  const { data: businesses } = useBusinesses();
  const businessName = businesses?.find((business) => business.id === purchase?.businessId)?.name;

  if (isLoading) return <PageContainer title="Purchase detail"><div className="flex items-center justify-center py-16 bg-white border border-gray-200 rounded-xl"><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /><span className="ml-3 text-sm text-gray-500">Loading purchase…</span></div></PageContainer>;
  if (error || !purchase) return <PageContainer title="Purchase detail"><div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white border border-gray-200 rounded-xl"><AlertCircle className="w-6 h-6 text-red-500" /><h2 className="mt-3 text-sm font-semibold text-gray-900">Purchase not found</h2><p className="mt-1 text-sm text-gray-500">This purchase may have been removed or is unavailable.</p><Link to="/purchases" className="mt-5 inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg"><ArrowLeft className="w-4 h-4" /> Back to purchases</Link></div></PageContainer>;

  return <PageContainer title="Purchase detail" subtitle="Review the persisted purchase record.">
    <Link to="/purchases" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"><ArrowLeft className="w-4 h-4" /> Back to purchases</Link>
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><div><p className="text-xs text-gray-400">Date</p><p className="mt-1 text-sm font-medium text-gray-900">{formatDate(purchase.date)}</p></div><div><p className="text-xs text-gray-400">Business</p><p className="mt-1 text-sm font-medium text-gray-900">{businessName ?? 'Unknown business'}</p></div><div><p className="text-xs text-gray-400">Supplier</p><p className="mt-1 text-sm font-medium text-gray-900">{purchase.supplierName || 'Not provided'}</p></div></div>
      {purchase.notes && <div><p className="text-xs text-gray-400">Notes</p><p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{purchase.notes}</p></div>}
      <div><h2 className="text-sm font-semibold text-gray-900 mb-3">Items</h2><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-xs text-gray-400 border-b border-gray-200"><th className="pb-2 font-medium">Item</th><th className="pb-2 font-medium">Quantity</th><th className="pb-2 font-medium">Unit cost</th><th className="pb-2 font-medium text-right">Line total</th></tr></thead><tbody>{purchase.items.map((item) => <tr key={`${item.inventoryItemId}-${item.name}`} className="border-b border-gray-100"><td className="py-3 text-gray-900">{item.name}</td><td className="py-3 text-gray-600">{item.quantity}</td><td className="py-3 text-gray-600">{formatMoney(item.unitCost.amountMinor, item.unitCost.currency)}</td><td className="py-3 text-right text-gray-900">{formatMoney(item.lineTotal.amountMinor, item.lineTotal.currency)}</td></tr>)}</tbody></table></div></div>
      <div className="flex justify-end border-t border-gray-200 pt-4"><div className="text-right"><p className="text-xs text-gray-400">Purchase total</p><p className="mt-1 text-xl font-semibold text-gray-900">{formatMoney(purchase.totalAmount.amountMinor, purchase.totalAmount.currency)}</p></div></div>
    </div>
  </PageContainer>;
}

export default PurchaseDetailPage;

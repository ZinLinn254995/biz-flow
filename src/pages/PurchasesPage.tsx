import { useMemo, useState } from 'react';
import { AlertCircle, Loader2, Package, Plus, Search, X } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import EmptyState from '@/components/ui/EmptyState';
import { PurchaseCard } from '@/components/purchases/PurchaseCard';
import { PurchaseForm } from '@/components/purchases/PurchaseForm';
import { DeletePurchaseDialog } from '@/components/purchases/DeletePurchaseDialog';
import { useBusinesses } from '@/hooks/business';
import { useInventoryItems } from '@/hooks/inventory';
import { useCreatePurchase, useDeletePurchase, usePurchases, usePurchasesByBusiness, useUpdatePurchase } from '@/hooks/purchases';
import type { Purchase } from '@/types/domain/purchase';
import type { EntityId } from '@/types/common/base';

function PurchasesPage() {
  const [businessId, setBusinessId] = useState<EntityId | null>(null);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Purchase | null>(null);
  const allPurchases = usePurchases();
  const scopedPurchases = usePurchasesByBusiness(businessId);
  const { data: businesses, isLoading: businessesLoading } = useBusinesses();
  const { data: inventoryItems } = useInventoryItems();
  const createMutation = useCreatePurchase();
  const updateMutation = useUpdatePurchase();
  const deleteMutation = useDeletePurchase();
  const purchases = businessId ? scopedPurchases : allPurchases;
  const businessNames = useMemo(() => new Map((businesses ?? []).map((business) => [business.id, business.name])), [businesses]);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (purchases.data ?? []).filter((purchase) => !query || purchase.supplierName?.toLowerCase().includes(query) || purchase.notes?.toLowerCase().includes(query) || purchase.items.some((item) => item.name.toLowerCase().includes(query))).sort((a, b) => b.date.localeCompare(a.date));
  }, [purchases.data, search]);
  const closeForm = () => { setFormOpen(false); setEditingPurchase(null); createMutation.reset(); updateMutation.reset(); };
  const refresh = () => purchases.refresh();
  const handleSubmit = async (values: Parameters<NonNullable<React.ComponentProps<typeof PurchaseForm>['onSubmit']>>[0]) => {
    try {
      if (editingPurchase) await updateMutation.mutate(editingPurchase.id, values);
      else await createMutation.mutate(values);
      closeForm();
      refresh();
    } catch { /* mutation error remains visible in the form */ }
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try { await deleteMutation.mutate(deleteTarget.id); setDeleteTarget(null); deleteMutation.reset(); refresh(); } catch { /* dialog displays error */ }
  };
  const isLoading = purchases.isLoading;
  const mutationError = editingPurchase ? updateMutation.error : createMutation.error;

  return <PageContainer title="Purchases" subtitle="Record and manage inventory purchases for your businesses.">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search purchases…" aria-label="Search purchases" className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg w-full sm:w-52" /></div>
        <select value={businessId ?? ''} onChange={(event) => setBusinessId((event.target.value || null) as EntityId | null)} disabled={businessesLoading} aria-label="Filter by business" className="px-3 py-2 text-sm border border-gray-300 rounded-lg"><option value="">All Businesses</option>{businesses?.map((business) => <option key={business.id} value={business.id}>{business.name}</option>)}</select>
        {search && <button onClick={() => setSearch('')} className="flex items-center gap-1 px-2.5 py-2 text-xs border border-gray-300 rounded-lg"><X className="w-3.5 h-3.5" /> Clear</button>}
      </div>
      <button onClick={() => { setEditingPurchase(null); setFormOpen(true); }} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg"><Plus className="w-4 h-4" /> New Purchase</button>
    </div>
    {isLoading && <div className="flex items-center justify-center py-16 bg-white border border-gray-200 rounded-xl"><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /><span className="ml-3 text-sm text-gray-500">Loading purchases…</span></div>}
    {purchases.error && !isLoading && <div className="flex flex-col items-center py-12 bg-white border border-gray-200 rounded-xl"><AlertCircle className="w-6 h-6 text-red-500" /><p className="mt-3 text-sm text-gray-600">We couldn't load purchases.</p><button onClick={refresh} className="mt-4 px-4 py-2 text-sm border border-gray-300 rounded-lg">Retry</button></div>}
    {!isLoading && !purchases.error && filtered.length === 0 && <div className="bg-white border border-gray-200 rounded-xl"><EmptyState icon={Package} title="No purchases" description={search || businessId ? 'No purchases match the current filters.' : 'Record your first inventory purchase to increase stock.'} action={!search && !businessId ? <button onClick={() => setFormOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg"><Plus className="w-4 h-4" /> New Purchase</button> : undefined} /></div>}
    {!isLoading && !purchases.error && filtered.length > 0 && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{filtered.map((purchase) => <PurchaseCard key={purchase.id} purchase={purchase} businessName={businessNames.get(purchase.businessId)} onEdit={(value) => { setEditingPurchase(value); setFormOpen(true); }} onDelete={setDeleteTarget} />)}</div>}
    <PurchaseForm open={formOpen} purchase={editingPurchase} businesses={businesses ?? []} inventoryItems={inventoryItems ?? []} isSubmitting={editingPurchase ? updateMutation.isLoading : createMutation.isLoading} errorMessage={mutationError?.message} onSubmit={handleSubmit} onCancel={closeForm} />
    <DeletePurchaseDialog open={Boolean(deleteTarget)} purchase={deleteTarget} isDeleting={deleteMutation.isLoading} errorMessage={deleteMutation.error?.message} onConfirm={confirmDelete} onCancel={() => { setDeleteTarget(null); deleteMutation.reset(); }} />
  </PageContainer>;
}

export default PurchasesPage;

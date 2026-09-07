import { useState, useMemo } from 'react';
import { Plus, AlertCircle, Loader2, ShoppingCart, Filter, Search, X } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import EmptyState from '@/components/ui/EmptyState';
import { SaleCard } from '@/components/sales/SaleCard';
import { SaleForm } from '@/components/sales/SaleForm';
import { DeleteSaleDialog } from '@/components/sales/DeleteSaleDialog';
import { useSales, useSalesByBusiness, useCreateSale, useUpdateSale, useDeleteSale } from '@/hooks/sales';
import { useBusinesses } from '@/hooks/business';
import { useCustomers } from '@/hooks/customers';
import { useInventoryItems } from '@/hooks/inventory';
import type { Sale } from '@/types/domain/sale';
import type { EntityId } from '@/types/common/base';

function SalesPage() {
  const [selectedBusinessId, setSelectedBusinessId] = useState<EntityId | null>(null);
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'pending' | 'partial' | 'paid' | 'refunded'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  const allSales = useSales();
  const scopedSales = useSalesByBusiness(selectedBusinessId);
  const { data: businesses, isLoading: businessesLoading } = useBusinesses();
  const { data: customers } = useCustomers();
  const { data: inventoryItems } = useInventoryItems();

  const sales = selectedBusinessId ? scopedSales : allSales;

  const createMutation = useCreateSale();
  const updateMutation = useUpdateSale();
  const deleteMutation = useDeleteSale();

  const [formOpen, setFormOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Sale | null>(null);

  const businessNameMap = useMemo(() => {
    const map = new Map<EntityId, string>();
    if (businesses) {
      for (const biz of businesses) {
        map.set(biz.id, biz.name);
      }
    }
    return map;
  }, [businesses]);

  const customerNameMap = useMemo(() => {
    const map = new Map<EntityId, string>();
    if (customers) {
      for (const c of customers) {
        map.set(c.id, c.name);
      }
    }
    return map;
  }, [customers]);

  const openCreateForm = () => {
    setEditingSale(null);
    setFormOpen(true);
  };

  const openEditForm = (sale: Sale) => {
    setEditingSale(sale);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingSale(null);
    createMutation.reset();
    updateMutation.reset();
  };

  const handleSubmit = async (values: {
    businessId: EntityId;
    customerId?: EntityId;
    date: string;
    items: Sale['items'];
    totalAmount: Sale['totalAmount'];
    paymentStatus: Sale['paymentStatus'];
    notes?: string;
  }) => {
    try {
      if (editingSale) {
        await updateMutation.mutate(editingSale.id, values);
      } else {
        await createMutation.mutate(values);
      }
      closeForm();
      if (selectedBusinessId) {
        scopedSales.refresh();
      } else {
        allSales.refresh();
      }
    } catch {
      // error is exposed via mutation state; form stays open
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutate(deleteTarget.id);
      setDeleteTarget(null);
      deleteMutation.reset();
      if (selectedBusinessId) {
        scopedSales.refresh();
      } else {
        allSales.refresh();
      }
    } catch {
      // error is displayed in the dialog
    }
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
    deleteMutation.reset();
  };

  const activeMutationError = editingSale ? updateMutation.error : createMutation.error;
  const isSubmitting = editingSale ? updateMutation.isLoading : createMutation.isLoading;
  const isLoading = sales.isLoading;
  const error = sales.error;
  const saleList = useMemo(() => {
    let result = sales.data ?? [];
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((s) => {
        const bizName = businessNameMap.get(s.businessId) ?? '';
        const custName = s.customerId ? customerNameMap.get(s.customerId) ?? '' : '';
        return bizName.toLowerCase().includes(q) || custName.toLowerCase().includes(q) || (s.notes && s.notes.toLowerCase().includes(q));
      });
    }
    if (paymentFilter !== 'all') {
      result = result.filter((s) => s.paymentStatus === paymentFilter);
    }
    if (startDate) {
      result = result.filter((s) => s.date >= startDate);
    }
    if (endDate) {
      result = result.filter((s) => s.date <= endDate);
    }
    result = [...result].sort((a, b) => sortBy === 'newest' ? (b.date > a.date ? 1 : -1) : (a.date > b.date ? 1 : -1));
    return result;
  }, [sales.data, search, paymentFilter, startDate, endDate, sortBy, businessNameMap, customerNameMap]);

  const hasFilters = search.trim() !== '' || paymentFilter !== 'all' || startDate !== '' || endDate !== '' || sortBy !== 'newest';
  const clearFilters = () => {
    setSearch('');
    setPaymentFilter('all');
    setStartDate('');
    setEndDate('');
    setSortBy('newest');
  };

  return (
    <PageContainer title="Sales" subtitle="Record and track sales transactions for your businesses.">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sales…"
              aria-label="Search sales"
              className="pl-9 pr-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow w-full sm:w-48"
            />
          </div>
          <select
            value={selectedBusinessId ?? ''}
            onChange={(e) => setSelectedBusinessId((e.target.value || null) as EntityId | null)}
            disabled={businessesLoading}
            aria-label="Filter by business"
            className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-50"
          >
            <option value="">All Businesses</option>
            {businesses?.map((biz) => (
              <option key={biz.id} value={biz.id}>
                {biz.name}
              </option>
            ))}
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as 'all' | 'pending' | 'partial' | 'paid' | 'refunded')}
            aria-label="Filter by payment status"
            className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
          </select>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            aria-label="Start date"
            className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            aria-label="End date"
            className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
            aria-label="Sort by date"
            className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
            >
              <X className="w-3.5 h-3.5" strokeWidth={2} />
              Clear
            </button>
          )}
        </div>

        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          New Sale
        </button>
      </div>

      {isLoading && (
        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" strokeWidth={2} />
            <span className="ml-3 text-sm text-gray-500">Loading sales…</span>
          </div>
        </div>
      )}

      {error && !isLoading && (
        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" strokeWidth={1.5} />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Something went wrong</h3>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed mb-4">
              We couldn't load your sales. Please try again.
            </p>
            <button
              onClick={sales.refresh}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!isLoading && !error && saleList && saleList.length === 0 && !hasFilters && (
        <div className="bg-white border border-gray-200 rounded-xl">
          <EmptyState
            icon={ShoppingCart}
            title="No sales yet"
            description="Record your first sale to start tracking revenue and payment status."
            action={
              <button
                onClick={openCreateForm}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                New Sale
              </button>
            }
          />
        </div>
      )}

      {!isLoading && !error && saleList && saleList.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {saleList.map((sale) => (
            <SaleCard
              key={sale.id}
              sale={sale}
              businessName={businessNameMap.get(sale.businessId)}
              customerName={sale.customerId ? customerNameMap.get(sale.customerId) : undefined}
              onEdit={openEditForm}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <SaleForm
        open={formOpen}
        sale={editingSale}
        businesses={businesses ?? []}
        customers={customers ?? []}
        inventoryItems={inventoryItems ?? []}
        isSubmitting={isSubmitting}
        errorMessage={activeMutationError?.message ?? null}
        onSubmit={handleSubmit}
        onCancel={closeForm}
      />

      <DeleteSaleDialog
        open={deleteTarget !== null}
        sale={deleteTarget}
        isDeleting={deleteMutation.isLoading}
        errorMessage={deleteMutation.error?.message ?? null}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </PageContainer>
  );
}

export default SalesPage;

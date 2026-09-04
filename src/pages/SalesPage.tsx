import { useState, useMemo } from 'react';
import { Plus, AlertCircle, Loader2, ShoppingCart, Filter } from 'lucide-react';
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
  const saleList = sales.data;

  return (
    <PageContainer title="Sales" subtitle="Record and track sales transactions for your businesses.">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" strokeWidth={2} />
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

      {!isLoading && !error && saleList && saleList.length === 0 && (
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

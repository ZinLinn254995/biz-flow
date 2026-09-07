import { useState, useMemo } from 'react';
import { Plus, AlertCircle, Loader2, Package, Filter, Search, X } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import EmptyState from '@/components/ui/EmptyState';
import { InventoryCard } from '@/components/inventory/InventoryCard';
import { InventoryForm } from '@/components/inventory/InventoryForm';
import { DeleteInventoryDialog } from '@/components/inventory/DeleteInventoryDialog';
import {
  useInventoryItems,
  useInventoryItemsByBusiness,
  useCreateInventoryItem,
  useUpdateInventoryItem,
  useDeleteInventoryItem,
} from '@/hooks/inventory';
import { useBusinesses } from '@/hooks/business';
import type { InventoryItem } from '@/types/domain/inventory';
import type { EntityId } from '@/types/common/base';

function InventoryPage() {
  const [selectedBusinessId, setSelectedBusinessId] = useState<EntityId | null>(null);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | null>(null);

  const allInventory = useInventoryItems();
  const scopedInventory = useInventoryItemsByBusiness(selectedBusinessId);
  const { data: businesses, isLoading: businessesLoading } = useBusinesses();

  const inventory = selectedBusinessId ? scopedInventory : allInventory;

  const createMutation = useCreateInventoryItem();
  const updateMutation = useUpdateInventoryItem();
  const deleteMutation = useDeleteInventoryItem();

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null);

  const businessNameMap = useMemo(() => {
    const map = new Map<EntityId, string>();
    if (businesses) {
      for (const biz of businesses) {
        map.set(biz.id, biz.name);
      }
    }
    return map;
  }, [businesses]);

  const openCreateForm = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const openEditForm = (item: InventoryItem) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingItem(null);
    createMutation.reset();
    updateMutation.reset();
  };

  const handleSubmit = async (values: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingItem) {
        await updateMutation.mutate(editingItem.id, values);
      } else {
        await createMutation.mutate(values);
      }
      closeForm();
      if (selectedBusinessId) {
        scopedInventory.refresh();
      } else {
        allInventory.refresh();
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
        scopedInventory.refresh();
      } else {
        allInventory.refresh();
      }
    } catch {
      // error is displayed in the dialog
    }
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
    deleteMutation.reset();
  };

  const activeMutationError = editingItem ? updateMutation.error : createMutation.error;
  const isSubmitting = editingItem ? updateMutation.isLoading : createMutation.isLoading;
  const isLoading = inventory.isLoading;
  const error = inventory.error;
  const items = useMemo(() => {
    let result = inventory.data ?? [];
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((i) =>
        i.name.toLowerCase().includes(q) ||
        (i.sku && i.sku.toLowerCase().includes(q)),
      );
    }
    if (stockFilter !== 'all') {
      result = result.filter((i) => i.stockStatus === stockFilter);
    }
    if (sortBy === 'name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'quantity') {
      result = [...result].sort((a, b) => b.quantity - a.quantity);
    }
    return result;
  }, [inventory.data, search, stockFilter, sortBy]);

  const hasFilters = search.trim() !== '' || stockFilter !== 'all' || sortBy !== null;
  const clearFilters = () => {
    setSearch('');
    setStockFilter('all');
    setSortBy(null);
  };

  return (
    <PageContainer title="Inventory" subtitle="Track and manage stock for your businesses.">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items…"
              aria-label="Search inventory"
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
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as 'all' | 'in_stock' | 'low_stock' | 'out_of_stock')}
            aria-label="Filter by stock status"
            className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow"
          >
            <option value="all">All Stock</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
          <select
            value={sortBy ?? ''}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'quantity' | null || null)}
            aria-label="Sort by"
            className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow"
          >
            <option value="">No Sort</option>
            <option value="name">Name (A-Z)</option>
            <option value="quantity">Quantity (High-Low)</option>
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
          Add Item
        </button>
      </div>

      {isLoading && (
        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" strokeWidth={2} />
            <span className="ml-3 text-sm text-gray-500">Loading inventory…</span>
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
              We couldn't load your inventory. Please try again.
            </p>
            <button
              onClick={inventory.refresh}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!isLoading && !error && items && items.length === 0 && !hasFilters && (
        <div className="bg-white border border-gray-200 rounded-xl">
          <EmptyState
            icon={Package}
            title="No inventory items"
            description="Add your first inventory item to start tracking stock levels, costs, and pricing."
            action={
              <button
                onClick={openCreateForm}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                Add Item
              </button>
            }
          />
        </div>
      )}

      {!isLoading && !error && items && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <InventoryCard
              key={item.id}
              item={item}
              businessName={businessNameMap.get(item.businessId)}
              onEdit={openEditForm}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <InventoryForm
        open={formOpen}
        item={editingItem}
        businesses={businesses ?? []}
        isSubmitting={isSubmitting}
        errorMessage={activeMutationError?.message ?? null}
        onSubmit={handleSubmit}
        onCancel={closeForm}
      />

      <DeleteInventoryDialog
        open={deleteTarget !== null}
        item={deleteTarget}
        isDeleting={deleteMutation.isLoading}
        errorMessage={deleteMutation.error?.message ?? null}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </PageContainer>
  );
}

export default InventoryPage;

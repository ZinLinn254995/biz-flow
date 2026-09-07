import { useState, useMemo } from 'react';
import { Plus, AlertCircle, Loader2, BriefcaseBusiness, Search, X } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import EmptyState from '@/components/ui/EmptyState';
import { BusinessCard } from '@/components/business/BusinessCard';
import { BusinessForm } from '@/components/business/BusinessForm';
import { DeleteBusinessDialog } from '@/components/business/DeleteBusinessDialog';
import { useBusinesses, useCreateBusiness, useUpdateBusiness, useDeleteBusiness } from '@/hooks/business';
import type { Business } from '@/types/domain/business';

function BusinessPage() {
  const { data: businesses, isLoading, error, refresh } = useBusinesses();
  const createMutation = useCreateBusiness();
  const updateMutation = useUpdateBusiness();
  const deleteMutation = useDeleteBusiness();

  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Business | null>(null);

  const filteredBusinesses = useMemo(() => {
    if (!businesses) return [];
    const q = search.trim().toLowerCase();
    if (!q) return businesses;
    return businesses.filter((b) => b.name.toLowerCase().includes(q));
  }, [businesses, search]);

  const hasFilters = search.trim() !== '';
  const clearFilters = () => setSearch('');

  const openCreateForm = () => {
    setEditingBusiness(null);
    setFormOpen(true);
  };

  const openEditForm = (business: Business) => {
    setEditingBusiness(business);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingBusiness(null);
    createMutation.reset();
    updateMutation.reset();
  };

  const handleSubmit = async (values: { name: string; description?: string; currency: string }) => {
    try {
      if (editingBusiness) {
        await updateMutation.mutate(editingBusiness.id, values);
      } else {
        await createMutation.mutate(values);
      }
      closeForm();
      refresh();
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
      refresh();
    } catch {
      // error is displayed in the dialog
    }
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
    deleteMutation.reset();
  };

  const activeMutationError = (editingBusiness ? updateMutation.error : createMutation.error);
  const isSubmitting = editingBusiness ? updateMutation.isLoading : createMutation.isLoading;

  return (
    <PageContainer title="Business" subtitle="Manage the businesses you own or operate.">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search businesses…"
              aria-label="Search businesses"
              className="pl-9 pr-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow w-full sm:w-64"
            />
          </div>
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
          Create Business
        </button>
      </div>

      {isLoading && (
        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" strokeWidth={2} />
            <span className="ml-3 text-sm text-gray-500">Loading businesses…</span>
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
              We couldn't load your businesses. Please try again.
            </p>
            <button
              onClick={refresh}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!isLoading && !error && businesses && businesses.length === 0 && !hasFilters && (
        <div className="bg-white border border-gray-200 rounded-xl">
          <EmptyState
            icon={BriefcaseBusiness}
            title="No businesses yet"
            description="Create your first business to start managing inventory, sales, customers, and expenses."
            action={
              <button
                onClick={openCreateForm}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                Create Business
              </button>
            }
          />
        </div>
      )}

      {!isLoading && !error && filteredBusinesses.length === 0 && hasFilters && (
        <div className="bg-white border border-gray-200 rounded-xl">
          <EmptyState
            icon={Search}
            title="No businesses match your search"
            description="Try adjusting or clearing your search."
            action={
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
              >
                <X className="w-4 h-4" strokeWidth={2} />
                Clear Search
              </button>
            }
          />
        </div>
      )}

      {!isLoading && !error && filteredBusinesses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBusinesses.map((business) => (
            <BusinessCard
              key={business.id}
              business={business}
              onEdit={openEditForm}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <BusinessForm
        open={formOpen}
        business={editingBusiness}
        isSubmitting={isSubmitting}
        errorMessage={activeMutationError?.message ?? null}
        onSubmit={handleSubmit}
        onCancel={closeForm}
      />

      <DeleteBusinessDialog
        open={deleteTarget !== null}
        business={deleteTarget}
        isDeleting={deleteMutation.isLoading}
        errorMessage={deleteMutation.error?.message ?? null}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </PageContainer>
  );
}

export default BusinessPage;

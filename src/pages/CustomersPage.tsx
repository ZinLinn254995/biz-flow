import { useState, useMemo } from 'react';
import { Plus, AlertCircle, Loader2, Users, Filter } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import EmptyState from '@/components/ui/EmptyState';
import { CustomerCard } from '@/components/customers/CustomerCard';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { DeleteCustomerDialog } from '@/components/customers/DeleteCustomerDialog';
import { useCustomers, useCustomersByBusiness, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '@/hooks/customers';
import { useBusinesses } from '@/hooks/business';
import type { Customer } from '@/types/domain/customer';
import type { EntityId } from '@/types/common/base';

function CustomersPage() {
  const [selectedBusinessId, setSelectedBusinessId] = useState<EntityId | null>(null);

  const allCustomers = useCustomers();
  const scopedCustomers = useCustomersByBusiness(selectedBusinessId);
  const { data: businesses, isLoading: businessesLoading } = useBusinesses();

  const customers = selectedBusinessId ? scopedCustomers : allCustomers;

  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

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
    setEditingCustomer(null);
    setFormOpen(true);
  };

  const openEditForm = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingCustomer(null);
    createMutation.reset();
    updateMutation.reset();
  };

  const handleSubmit = async (values: {
    businessId: EntityId;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    notes?: string;
  }) => {
    try {
      if (editingCustomer) {
        await updateMutation.mutate(editingCustomer.id, values);
      } else {
        await createMutation.mutate(values);
      }
      closeForm();
      if (selectedBusinessId) {
        scopedCustomers.refresh();
      } else {
        allCustomers.refresh();
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
        scopedCustomers.refresh();
      } else {
        allCustomers.refresh();
      }
    } catch {
      // error is displayed in the dialog
    }
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
    deleteMutation.reset();
  };

  const activeMutationError = editingCustomer ? updateMutation.error : createMutation.error;
  const isSubmitting = editingCustomer ? updateMutation.isLoading : createMutation.isLoading;
  const isLoading = customers.isLoading;
  const error = customers.error;
  const customerList = customers.data;

  return (
    <PageContainer title="Customers" subtitle="Manage customer relationships for your businesses.">
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
          Add Customer
        </button>
      </div>

      {isLoading && (
        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" strokeWidth={2} />
            <span className="ml-3 text-sm text-gray-500">Loading customers…</span>
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
              We couldn't load your customers. Please try again.
            </p>
            <button
              onClick={customers.refresh}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!isLoading && !error && customerList && customerList.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl">
          <EmptyState
            icon={Users}
            title="No customers yet"
            description="Add your first customer to start tracking contact information and relationships."
            action={
              <button
                onClick={openCreateForm}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                Add Customer
              </button>
            }
          />
        </div>
      )}

      {!isLoading && !error && customerList && customerList.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {customerList.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              businessName={businessNameMap.get(customer.businessId)}
              onEdit={openEditForm}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <CustomerForm
        open={formOpen}
        customer={editingCustomer}
        businesses={businesses ?? []}
        isSubmitting={isSubmitting}
        errorMessage={activeMutationError?.message ?? null}
        onSubmit={handleSubmit}
        onCancel={closeForm}
      />

      <DeleteCustomerDialog
        open={deleteTarget !== null}
        customer={deleteTarget}
        isDeleting={deleteMutation.isLoading}
        errorMessage={deleteMutation.error?.message ?? null}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </PageContainer>
  );
}

export default CustomersPage;

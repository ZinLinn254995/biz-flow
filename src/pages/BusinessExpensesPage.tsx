import { useState, useMemo } from 'react';
import { Plus, AlertCircle, Loader2, Receipt, Filter, Search, X } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import EmptyState from '@/components/ui/EmptyState';
import { BusinessExpenseCard } from '@/components/businessExpenses/BusinessExpenseCard';
import { BusinessExpenseForm } from '@/components/businessExpenses/BusinessExpenseForm';
import { DeleteBusinessExpenseDialog } from '@/components/businessExpenses/DeleteBusinessExpenseDialog';
import {
  useBusinessExpenses,
  useBusinessExpensesByBusiness,
  useCreateBusinessExpense,
  useUpdateBusinessExpense,
  useDeleteBusinessExpense,
} from '@/hooks/businessExpenses';
import { useBusinesses } from '@/hooks/business';
import { useCategories } from '@/hooks/categories';
import type { BusinessExpense } from '@/types/domain/businessExpense';
import type { EntityId } from '@/types/common/base';

function formatMoney(amountMinor: number, currency: string): string {
  return `${currency} ${(amountMinor / 100).toFixed(2)}`;
}

function BusinessExpensesPage() {
  const [selectedBusinessId, setSelectedBusinessId] = useState<EntityId | null>(null);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const allExpenses = useBusinessExpenses();
  const scopedExpenses = useBusinessExpensesByBusiness(selectedBusinessId);
  const { data: businesses, isLoading: businessesLoading } = useBusinesses();
  const { data: categories } = useCategories();

  const expenses = selectedBusinessId ? scopedExpenses : allExpenses;

  const createMutation = useCreateBusinessExpense();
  const updateMutation = useUpdateBusinessExpense();
  const deleteMutation = useDeleteBusinessExpense();

  const [formOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<BusinessExpense | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BusinessExpense | null>(null);

  const businessNameMap = useMemo(() => {
    const map = new Map<EntityId, string>();
    if (businesses) {
      for (const biz of businesses) {
        map.set(biz.id, biz.name);
      }
    }
    return map;
  }, [businesses]);

  const categoryNameMap = useMemo(() => {
    const map = new Map<EntityId, string>();
    if (categories) {
      for (const cat of categories) {
        map.set(cat.id, cat.name);
      }
    }
    return map;
  }, [categories]);

  const totalAmountMinor = useMemo(() => {
    if (!expenses.data || expenses.data.length === 0) return null;
    const totals = new Map<string, number>();
    for (const exp of expenses.data) {
      const key = exp.amount.currency;
      totals.set(key, (totals.get(key) ?? 0) + exp.amount.amountMinor);
    }
    return totals;
  }, [expenses.data]);

  const openCreateForm = () => {
    setEditingExpense(null);
    setFormOpen(true);
  };

  const openEditForm = (expense: BusinessExpense) => {
    setEditingExpense(expense);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingExpense(null);
    createMutation.reset();
    updateMutation.reset();
  };

  const handleSubmit = async (values: {
    businessId: EntityId;
    categoryId?: EntityId;
    title: string;
    date: string;
    amount: { amountMinor: number; currency: string };
    notes?: string;
  }) => {
    try {
      if (editingExpense) {
        await updateMutation.mutate(editingExpense.id, values);
      } else {
        await createMutation.mutate(values);
      }
      closeForm();
      if (selectedBusinessId) {
        scopedExpenses.refresh();
      } else {
        allExpenses.refresh();
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
        scopedExpenses.refresh();
      } else {
        allExpenses.refresh();
      }
    } catch {
      // error is displayed in the dialog
    }
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
    deleteMutation.reset();
  };

  const activeMutationError = editingExpense ? updateMutation.error : createMutation.error;
  const isSubmitting = editingExpense ? updateMutation.isLoading : createMutation.isLoading;
  const isLoading = expenses.isLoading;
  const error = expenses.error;
  const expenseList = useMemo(() => {
    if (!expenses.data) return [];
    let result = expenses.data;
    const q = search.trim().toLowerCase();
    if (q) result = result.filter((e) => e.title.toLowerCase().includes(q));
    if (startDate) result = result.filter((e) => e.date >= startDate);
    if (endDate) result = result.filter((e) => e.date <= endDate);
    return result;
  }, [expenses.data, search, startDate, endDate]);

  const hasFilters = search.trim() !== '' || startDate !== '' || endDate !== '';
  const clearFilters = () => { setSearch(''); setStartDate(''); setEndDate(''); };

  return (
    <PageContainer title="Business Expenses" subtitle="Track and manage expenses across your businesses.">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search expenses…"
              aria-label="Search expenses"
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
          Add Expense
        </button>
      </div>

      {totalAmountMinor && totalAmountMinor.size > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-500">Total Expenses:</span>
            {Array.from(totalAmountMinor.entries()).map(([currency, amountMinor]) => (
              <span key={currency} className="text-sm font-semibold text-gray-900">
                {formatMoney(amountMinor, currency)}
              </span>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" strokeWidth={2} />
            <span className="ml-3 text-sm text-gray-500">Loading business expenses…</span>
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
              We couldn't load your expenses. Please try again.
            </p>
            <button
              onClick={expenses.refresh}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!isLoading && !error && expenseList && expenseList.length === 0 && !hasFilters && (
        <div className="bg-white border border-gray-200 rounded-xl">
          <EmptyState
            icon={Receipt}
            title="No business expenses yet"
            description="Add your first expense to start tracking business costs and spending."
            action={
              <button
                onClick={openCreateForm}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                Add Expense
              </button>
            }
          />
        </div>
      )}

      {!isLoading && !error && expenseList && expenseList.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {expenseList.map((expense) => (
            <BusinessExpenseCard
              key={expense.id}
              expense={expense}
              businessName={businessNameMap.get(expense.businessId)}
              categoryName={expense.categoryId ? categoryNameMap.get(expense.categoryId) : undefined}
              onEdit={openEditForm}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <BusinessExpenseForm
        open={formOpen}
        expense={editingExpense}
        businesses={businesses ?? []}
        categories={categories ?? []}
        isSubmitting={isSubmitting}
        errorMessage={activeMutationError?.message ?? null}
        onSubmit={handleSubmit}
        onCancel={closeForm}
      />

      <DeleteBusinessExpenseDialog
        open={deleteTarget !== null}
        expense={deleteTarget}
        isDeleting={deleteMutation.isLoading}
        errorMessage={deleteMutation.error?.message ?? null}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </PageContainer>
  );
}

export default BusinessExpensesPage;

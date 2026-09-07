import { useState, useMemo } from 'react';
import { Plus, AlertCircle, Loader2, Target } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import EmptyState from '@/components/ui/EmptyState';
import { BudgetCard } from '@/components/budgets/BudgetCard';
import { BudgetForm } from '@/components/budgets/BudgetForm';
import { DeleteBudgetDialog } from '@/components/budgets/DeleteBudgetDialog';
import { useBudgets, useCreateBudget, useUpdateBudget, useDeleteBudget } from '@/hooks/budgets';
import { useCategories } from '@/hooks/categories';
import type { Budget } from '@/types/domain/budget';
import type { BudgetPeriod } from '@/types/common/enums';
import type { EntityId } from '@/types/common/base';

function BudgetsPage() {
  const budgetsQuery = useBudgets();
  const { data: categories } = useCategories();
  const createMutation = useCreateBudget();
  const updateMutation = useUpdateBudget();
  const deleteMutation = useDeleteBudget();

  const [formOpen, setFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Budget | null>(null);

  const categoryNameMap = useMemo(() => {
    const map = new Map<EntityId, string>();
    if (categories) {
      for (const cat of categories) {
        map.set(cat.id, cat.name);
      }
    }
    return map;
  }, [categories]);

  const openCreateForm = () => {
    setEditingBudget(null);
    setFormOpen(true);
  };

  const openEditForm = (budget: Budget) => {
    setEditingBudget(budget);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingBudget(null);
    createMutation.reset();
    updateMutation.reset();
  };

  const handleSubmit = async (values: {
    categoryId: EntityId;
    limit: { amountMinor: number; currency: string };
    period: BudgetPeriod;
    startDate: string;
    endDate: string;
    notes?: string;
  }) => {
    try {
      if (editingBudget) {
        await updateMutation.mutate(editingBudget.id, values);
      } else {
        await createMutation.mutate(values);
      }
      closeForm();
      budgetsQuery.refresh();
    } catch {
      // error displayed via mutation state
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutate(deleteTarget.id);
      setDeleteTarget(null);
      deleteMutation.reset();
      budgetsQuery.refresh();
    } catch {
      // error displayed in dialog
    }
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
    deleteMutation.reset();
  };

  const isSubmitting = editingBudget ? updateMutation.isLoading : createMutation.isLoading;
  const mutationError = editingBudget ? updateMutation.error : createMutation.error;

  return (
    <PageContainer title="Budgets" subtitle="Set spending limits for your categories.">
      <div className="flex items-center justify-end">
        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          Add Budget
        </button>
      </div>

      {budgetsQuery.isLoading && (
        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" strokeWidth={2} />
            <span className="ml-3 text-sm text-gray-500">Loading budgets…</span>
          </div>
        </div>
      )}

      {budgetsQuery.error && !budgetsQuery.isLoading && (
        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" strokeWidth={1.5} />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Something went wrong</h3>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed mb-4">
              We couldn't load your budgets. Please try again.
            </p>
            <button
              onClick={budgetsQuery.refresh}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!budgetsQuery.isLoading && !budgetsQuery.error && budgetsQuery.data && budgetsQuery.data.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl">
          <EmptyState
            icon={Target}
            title="No budgets yet"
            description="Create your first budget to set spending limits for your categories."
            action={
              <button
                onClick={openCreateForm}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                Add Budget
              </button>
            }
          />
        </div>
      )}

      {!budgetsQuery.isLoading && !budgetsQuery.error && budgetsQuery.data && budgetsQuery.data.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgetsQuery.data.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              categoryName={categoryNameMap.get(budget.categoryId)}
              onEdit={openEditForm}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <BudgetForm
        open={formOpen}
        budget={editingBudget}
        categories={categories ?? []}
        isSubmitting={isSubmitting}
        errorMessage={mutationError?.message ?? null}
        onSubmit={handleSubmit}
        onCancel={closeForm}
      />

      <DeleteBudgetDialog
        open={deleteTarget !== null}
        budget={deleteTarget}
        budgetLabel={deleteTarget ? categoryNameMap.get(deleteTarget.categoryId) : undefined}
        isDeleting={deleteMutation.isLoading}
        errorMessage={deleteMutation.error?.message ?? null}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </PageContainer>
  );
}

export default BudgetsPage;

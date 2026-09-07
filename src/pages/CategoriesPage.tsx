import { useState, useMemo } from 'react';
import { Plus, AlertCircle, Loader2, Tag, Filter, Search, X } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import EmptyState from '@/components/ui/EmptyState';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { CategoryForm } from '@/components/categories/CategoryForm';
import { DeleteCategoryDialog } from '@/components/categories/DeleteCategoryDialog';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/categories';
import type { Category } from '@/types/domain/category';
import type { CategoryScope, TransactionDirection } from '@/types/common/enums';

type ScopeFilter = 'all' | CategoryScope;
type DirectionFilter = 'all' | TransactionDirection;
type CategorySort = 'name' | 'created' | null;

function CategoriesPage() {
  const categoriesQuery = useCategories();

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [search, setSearch] = useState('');
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('all');
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>('all');
  const [sortBy, setSortBy] = useState<CategorySort>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const filteredCategories = useMemo(() => {
    if (!categoriesQuery.data) return [];
    const q = search.trim().toLowerCase();
    let result = categoriesQuery.data.filter((cat) => {
      if (scopeFilter !== 'all' && cat.scope !== scopeFilter) return false;
      if (directionFilter !== 'all' && cat.direction !== directionFilter) return false;
      if (q && !cat.name.toLowerCase().includes(q)) return false;
      return true;
    });
    if (sortBy === 'name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'created') {
      result = [...result].sort((a, b) => (a.createdAt > b.createdAt ? -1 : a.createdAt < b.createdAt ? 1 : 0));
    }
    return result;
  }, [categoriesQuery.data, search, scopeFilter, directionFilter, sortBy]);

  const hasFilters =
    search.trim() !== '' || scopeFilter !== 'all' || directionFilter !== 'all' || sortBy !== null;

  const clearFilters = () => {
    setSearch('');
    setScopeFilter('all');
    setDirectionFilter('all');
    setSortBy(null);
  };


  const openCreateForm = () => {
    setEditingCategory(null);
    setFormOpen(true);
  };

  const openEditForm = (category: Category) => {
    setEditingCategory(category);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingCategory(null);
    createMutation.reset();
    updateMutation.reset();
  };

  const handleSubmit = async (values: {
    name: string;
    scope: CategoryScope;
    direction?: TransactionDirection;
  }) => {
    try {
      if (editingCategory) {
        await updateMutation.mutate(editingCategory.id, values);
      } else {
        await createMutation.mutate(values);
      }
      closeForm();
      categoriesQuery.refresh();
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
      categoriesQuery.refresh();
    } catch {
      // error is displayed in the dialog
    }
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
    deleteMutation.reset();
  };

  const activeMutationError = editingCategory ? updateMutation.error : createMutation.error;
  const isSubmitting = editingCategory ? updateMutation.isLoading : createMutation.isLoading;
  const isLoading = categoriesQuery.isLoading;
  const error = categoriesQuery.error;

  return (
    <PageContainer title="Categories" subtitle="Manage income and expense categories for your business and personal finances.">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories…"
              aria-label="Search categories"
              className="pl-9 pr-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow w-full sm:w-48"
            />
          </div>
          <Filter className="w-4 h-4 text-gray-400" strokeWidth={2} />
          <select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value as ScopeFilter)}
            aria-label="Filter by scope"
            className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow"
          >
            <option value="all">All Scopes</option>
            <option value="business">Business</option>
            <option value="personal">Personal</option>
          </select>
          <select
            value={directionFilter}
            onChange={(e) => setDirectionFilter(e.target.value as DirectionFilter)}
            aria-label="Filter by direction"
            className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow"
          >
            <option value="all">All Directions</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select
            value={sortBy ?? ''}
            onChange={(e) => setSortBy((e.target.value as CategorySort) || null)}
            aria-label="Sort by"
            className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow"
          >
            <option value="">No Sort</option>
            <option value="name">Name (A-Z)</option>
            <option value="created">Newest First</option>
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
          Add Category
        </button>
      </div>

      {isLoading && (
        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" strokeWidth={2} />
            <span className="ml-3 text-sm text-gray-500">Loading categories…</span>
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
              We couldn't load your categories. Please try again.
            </p>
            <button
              onClick={categoriesQuery.refresh}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!isLoading && !error && filteredCategories.length === 0 && !hasFilters && (
        <div className="bg-white border border-gray-200 rounded-xl">
          <EmptyState
            icon={Tag}
            title="No categories yet"
            description="Create your first category to start organizing your income and expenses."
            action={
              <button
                onClick={openCreateForm}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                Add Category
              </button>
            }
          />
        </div>
      )}

      {!isLoading && !error && filteredCategories.length === 0 && hasFilters && (
        <div className="bg-white border border-gray-200 rounded-xl">
          <EmptyState
            icon={Filter}
            title="No categories match your filters"
            description="Try adjusting or clearing your filters to see more categories."
            action={
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
              >
                <X className="w-4 h-4" strokeWidth={2} />
                Clear Filters
              </button>
            }
          />
        </div>
      )}

      {!isLoading && !error && filteredCategories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={openEditForm}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <CategoryForm
        open={formOpen}
        category={editingCategory}
        isSubmitting={isSubmitting}
        errorMessage={activeMutationError?.message ?? null}
        onSubmit={handleSubmit}
        onCancel={closeForm}
      />

      <DeleteCategoryDialog
        open={deleteTarget !== null}
        category={deleteTarget}
        isDeleting={deleteMutation.isLoading}
        errorMessage={deleteMutation.error?.message ?? null}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </PageContainer>
  );
}

export default CategoriesPage;

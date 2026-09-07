import { useState, useMemo } from 'react';
import { Plus, AlertCircle, Loader2, Wallet, Filter, Search, X } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import EmptyState from '@/components/ui/EmptyState';
import { AccountCard } from '@/components/accounts/AccountCard';
import { AccountForm } from '@/components/accounts/AccountForm';
import { DeleteAccountDialog } from '@/components/accounts/DeleteAccountDialog';
import { useAccounts, useCreateAccount, useUpdateAccount, useDeleteAccount } from '@/hooks/accounts';
import type { Account } from '@/types/domain/account';
import type { AccountType } from '@/types/common/enums';

type TypeFilter = 'all' | AccountType;
type AccountSort = 'name' | 'balance' | null;

function AccountsPage() {
  const accountsQuery = useAccounts();
  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();
  const deleteMutation = useDeleteAccount();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [sortBy, setSortBy] = useState<AccountSort>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);

  const filteredAccounts = useMemo(() => {
    if (!accountsQuery.data) return [];
    const q = search.trim().toLowerCase();
    let result = accountsQuery.data.filter((acc) => {
      if (typeFilter !== 'all' && acc.type !== typeFilter) return false;
      if (
        q &&
        !acc.name.toLowerCase().includes(q) &&
        !(acc.institution && acc.institution.toLowerCase().includes(q))
      ) {
        return false;
      }
      return true;
    });
    if (sortBy === 'name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'balance') {
      result = [...result].sort((a, b) => b.balance.amountMinor - a.balance.amountMinor);
    }
    return result;
  }, [accountsQuery.data, search, typeFilter, sortBy]);

  const hasFilters = search.trim() !== '' || typeFilter !== 'all' || sortBy !== null;

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setSortBy(null);
  };


  const openCreateForm = () => {
    setEditingAccount(null);
    setFormOpen(true);
  };

  const openEditForm = (account: Account) => {
    setEditingAccount(account);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingAccount(null);
    createMutation.reset();
    updateMutation.reset();
  };

  const handleSubmit = async (values: {
    name: string;
    type: AccountType;
    balance: { amountMinor: number; currency: string };
    institution?: string;
  }) => {
    try {
      if (editingAccount) {
        await updateMutation.mutate(editingAccount.id, values);
      } else {
        await createMutation.mutate(values);
      }
      closeForm();
      accountsQuery.refresh();
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
      accountsQuery.refresh();
    } catch {
      // error displayed in dialog
    }
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
    deleteMutation.reset();
  };

  const isSubmitting = editingAccount ? updateMutation.isLoading : createMutation.isLoading;
  const mutationError = editingAccount ? updateMutation.error : createMutation.error;

  return (
    <PageContainer title="Accounts" subtitle="Manage your cash, bank, and wallet accounts.">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search accounts…"
              aria-label="Search accounts"
              className="pl-9 pr-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow w-full sm:w-48"
            />
          </div>
          <Filter className="w-4 h-4 text-gray-400" strokeWidth={2} />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
            aria-label="Filter by account type"
            className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow"
          >
            <option value="all">All Types</option>
            <option value="cash">Cash</option>
            <option value="bank">Bank</option>
            <option value="wallet">Wallet</option>
            <option value="other">Other</option>
          </select>
          <select
            value={sortBy ?? ''}
            onChange={(e) => setSortBy((e.target.value as AccountSort) || null)}
            aria-label="Sort by"
            className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow"
          >
            <option value="">No Sort</option>
            <option value="name">Name (A-Z)</option>
            <option value="balance">Balance (High-Low)</option>
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
          Add Account
        </button>
      </div>


      {accountsQuery.isLoading && (
        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" strokeWidth={2} />
            <span className="ml-3 text-sm text-gray-500">Loading accounts…</span>
          </div>
        </div>
      )}

      {accountsQuery.error && !accountsQuery.isLoading && (
        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" strokeWidth={1.5} />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Something went wrong</h3>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed mb-4">
              We couldn't load your accounts. Please try again.
            </p>
            <button
              onClick={accountsQuery.refresh}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!accountsQuery.isLoading && !accountsQuery.error && filteredAccounts.length === 0 && !hasFilters && (
        <div className="bg-white border border-gray-200 rounded-xl">
          <EmptyState
            icon={Wallet}
            title="No accounts yet"
            description="Add your first account to start tracking balances."
            action={
              <button
                onClick={openCreateForm}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                Add Account
              </button>
            }
          />
        </div>
      )}

      {!accountsQuery.isLoading && !accountsQuery.error && filteredAccounts.length === 0 && hasFilters && (
        <div className="bg-white border border-gray-200 rounded-xl">
          <EmptyState
            icon={Filter}
            title="No accounts match your filters"
            description="Try adjusting or clearing your filters to see more accounts."
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

      {!accountsQuery.isLoading && !accountsQuery.error && filteredAccounts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAccounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={openEditForm}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}


      <AccountForm
        open={formOpen}
        account={editingAccount}
        isSubmitting={isSubmitting}
        errorMessage={mutationError?.message ?? null}
        onSubmit={handleSubmit}
        onCancel={closeForm}
      />

      <DeleteAccountDialog
        open={deleteTarget !== null}
        account={deleteTarget}
        isDeleting={deleteMutation.isLoading}
        errorMessage={deleteMutation.error?.message ?? null}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </PageContainer>
  );
}

export default AccountsPage;

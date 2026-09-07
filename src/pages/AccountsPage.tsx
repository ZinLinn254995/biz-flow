import { useState } from 'react';
import { Plus, AlertCircle, Loader2, Wallet } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import EmptyState from '@/components/ui/EmptyState';
import { AccountCard } from '@/components/accounts/AccountCard';
import { AccountForm } from '@/components/accounts/AccountForm';
import { DeleteAccountDialog } from '@/components/accounts/DeleteAccountDialog';
import { useAccounts, useCreateAccount, useUpdateAccount, useDeleteAccount } from '@/hooks/accounts';
import type { Account } from '@/types/domain/account';
import type { AccountType } from '@/types/common/enums';

function AccountsPage() {
  const accountsQuery = useAccounts();
  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();
  const deleteMutation = useDeleteAccount();

  const [formOpen, setFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);

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
      <div className="flex items-center justify-end">
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

      {!accountsQuery.isLoading && !accountsQuery.error && accountsQuery.data && accountsQuery.data.length === 0 && (
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

      {!accountsQuery.isLoading && !accountsQuery.error && accountsQuery.data && accountsQuery.data.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accountsQuery.data.map((account) => (
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

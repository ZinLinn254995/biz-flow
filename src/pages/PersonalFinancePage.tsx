import { useState, useMemo } from 'react';
import { Plus, AlertCircle, Loader2, TrendingUp, TrendingDown, WalletCards, Search, X } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import EmptyState from '@/components/ui/EmptyState';
import { PersonalIncomeCard } from '@/components/personalFinance/PersonalIncomeCard';
import { PersonalIncomeForm } from '@/components/personalFinance/PersonalIncomeForm';
import { DeletePersonalIncomeDialog } from '@/components/personalFinance/DeletePersonalIncomeDialog';
import { PersonalExpenseCard } from '@/components/personalFinance/PersonalExpenseCard';
import { PersonalExpenseForm } from '@/components/personalFinance/PersonalExpenseForm';
import { DeletePersonalExpenseDialog } from '@/components/personalFinance/DeletePersonalExpenseDialog';
import {
  usePersonalIncomeRecords,
  useCreatePersonalIncome,
  useUpdatePersonalIncome,
  useDeletePersonalIncome,
} from '@/hooks/personalFinance';
import {
  usePersonalExpenses,
  useCreatePersonalExpense,
  useUpdatePersonalExpense,
  useDeletePersonalExpense,
} from '@/hooks/personalFinance';
import { useCategories } from '@/hooks/categories';
import { useAccounts } from '@/hooks/accounts';
import type { PersonalIncome, PersonalExpense } from '@/types/domain/personalFinance';
import type { EntityId } from '@/types/common/base';

function formatMoney(amountMinor: number, currency: string): string {
  return `${currency} ${(amountMinor / 100).toFixed(2)}`;
}

function computeTotals(records: { amount: { amountMinor: number; currency: string } }[]) {
  const totals = new Map<string, number>();
  for (const rec of records) {
    const key = rec.amount.currency;
    totals.set(key, (totals.get(key) ?? 0) + rec.amount.amountMinor);
  }
  return totals;
}

function PersonalFinancePage() {
  const incomeQuery = usePersonalIncomeRecords();
  const expenseQuery = usePersonalExpenses();
  const { data: categories } = useCategories();
  const { data: accounts } = useAccounts();

  const createIncomeMutation = useCreatePersonalIncome();
  const updateIncomeMutation = useUpdatePersonalIncome();
  const deleteIncomeMutation = useDeletePersonalIncome();

  const createExpenseMutation = useCreatePersonalExpense();
  const updateExpenseMutation = useUpdatePersonalExpense();
  const deleteExpenseMutation = useDeletePersonalExpense();

  const [incomeSearch, setIncomeSearch] = useState('');
  const [expenseSearch, setExpenseSearch] = useState('');
  const [incomeStartDate, setIncomeStartDate] = useState('');
  const [incomeEndDate, setIncomeEndDate] = useState('');
  const [expenseStartDate, setExpenseStartDate] = useState('');
  const [expenseEndDate, setExpenseEndDate] = useState('');

  const [incomeFormOpen, setIncomeFormOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<PersonalIncome | null>(null);
  const [deleteIncomeTarget, setDeleteIncomeTarget] = useState<PersonalIncome | null>(null);

  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<PersonalExpense | null>(null);
  const [deleteExpenseTarget, setDeleteExpenseTarget] = useState<PersonalExpense | null>(null);

  const categoryNameMap = useMemo(() => {
    const map = new Map<EntityId, string>();
    if (categories) {
      for (const cat of categories) {
        map.set(cat.id, cat.name);
      }
    }
    return map;
  }, [categories]);

  const accountNameMap = useMemo(() => {
    const map = new Map<EntityId, string>();
    if (accounts) {
      for (const acc of accounts) {
        map.set(acc.id, acc.name);
      }
    }
    return map;
  }, [accounts]);

  const filteredIncome = useMemo(() => {
    if (!incomeQuery.data) return [];
    let result = incomeQuery.data;
    const q = incomeSearch.trim().toLowerCase();
    if (q) result = result.filter((i) => i.source.toLowerCase().includes(q));
    if (incomeStartDate) result = result.filter((i) => i.date >= incomeStartDate);
    if (incomeEndDate) result = result.filter((i) => i.date <= incomeEndDate);
    return result;
  }, [incomeQuery.data, incomeSearch, incomeStartDate, incomeEndDate]);

  const filteredExpenses = useMemo(() => {
    if (!expenseQuery.data) return [];
    let result = expenseQuery.data;
    const q = expenseSearch.trim().toLowerCase();
    if (q) result = result.filter((e) => e.title.toLowerCase().includes(q));
    if (expenseStartDate) result = result.filter((e) => e.date >= expenseStartDate);
    if (expenseEndDate) result = result.filter((e) => e.date <= expenseEndDate);
    return result;
  }, [expenseQuery.data, expenseSearch, expenseStartDate, expenseEndDate]);

  const incomeTotals = useMemo(
    () => computeTotals(incomeQuery.data ?? []),
    [incomeQuery.data],
  );
  const expenseTotals = useMemo(
    () => computeTotals(expenseQuery.data ?? []),
    [expenseQuery.data],
  );

  const balanceByCurrency = useMemo(() => {
    const allCurrencies = new Set<string>([
      ...incomeTotals.keys(),
      ...expenseTotals.keys(),
    ]);
    const result = new Map<string, number>();
    for (const currency of allCurrencies) {
      const inc = incomeTotals.get(currency) ?? 0;
      const exp = expenseTotals.get(currency) ?? 0;
      result.set(currency, inc - exp);
    }
    return result;
  }, [incomeTotals, expenseTotals]);

  // Income handlers
  const openCreateIncome = () => {
    setEditingIncome(null);
    setIncomeFormOpen(true);
  };
  const openEditIncome = (income: PersonalIncome) => {
    setEditingIncome(income);
    setIncomeFormOpen(true);
  };
  const closeIncomeForm = () => {
    setIncomeFormOpen(false);
    setEditingIncome(null);
    createIncomeMutation.reset();
    updateIncomeMutation.reset();
  };
  const handleIncomeSubmit = async (values: {
    categoryId?: EntityId;
    source: string;
    date: string;
    amount: { amountMinor: number; currency: string };
    accountId?: EntityId;
    notes?: string;
  }) => {
    try {
      if (editingIncome) {
        await updateIncomeMutation.mutate(editingIncome.id, values);
      } else {
        await createIncomeMutation.mutate(values);
      }
      closeIncomeForm();
      incomeQuery.refresh();
    } catch {
      // error displayed via mutation state
    }
  };
  const confirmDeleteIncome = async () => {
    if (!deleteIncomeTarget) return;
    try {
      await deleteIncomeMutation.mutate(deleteIncomeTarget.id);
      setDeleteIncomeTarget(null);
      deleteIncomeMutation.reset();
      incomeQuery.refresh();
    } catch {
      // error displayed in dialog
    }
  };
  const cancelDeleteIncome = () => {
    setDeleteIncomeTarget(null);
    deleteIncomeMutation.reset();
  };

  // Expense handlers
  const openCreateExpense = () => {
    setEditingExpense(null);
    setExpenseFormOpen(true);
  };
  const openEditExpense = (expense: PersonalExpense) => {
    setEditingExpense(expense);
    setExpenseFormOpen(true);
  };
  const closeExpenseForm = () => {
    setExpenseFormOpen(false);
    setEditingExpense(null);
    createExpenseMutation.reset();
    updateExpenseMutation.reset();
  };
  const handleExpenseSubmit = async (values: {
    categoryId?: EntityId;
    title: string;
    date: string;
    amount: { amountMinor: number; currency: string };
    accountId?: EntityId;
    notes?: string;
  }) => {
    try {
      if (editingExpense) {
        await updateExpenseMutation.mutate(editingExpense.id, values);
      } else {
        await createExpenseMutation.mutate(values);
      }
      closeExpenseForm();
      expenseQuery.refresh();
    } catch {
      // error displayed via mutation state
    }
  };
  const confirmDeleteExpense = async () => {
    if (!deleteExpenseTarget) return;
    try {
      await deleteExpenseMutation.mutate(deleteExpenseTarget.id);
      setDeleteExpenseTarget(null);
      deleteExpenseMutation.reset();
      expenseQuery.refresh();
    } catch {
      // error displayed in dialog
    }
  };
  const cancelDeleteExpense = () => {
    setDeleteExpenseTarget(null);
    deleteExpenseMutation.reset();
  };

  const incomeSubmitting = editingIncome ? updateIncomeMutation.isLoading : createIncomeMutation.isLoading;
  const incomeError = editingIncome ? updateIncomeMutation.error : createIncomeMutation.error;
  const expenseSubmitting = editingExpense ? updateExpenseMutation.isLoading : createExpenseMutation.isLoading;
  const expenseError = editingExpense ? updateExpenseMutation.error : createExpenseMutation.error;

  return (
    <PageContainer title="Personal Finance" subtitle="Track your personal income and expenses.">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-50">
              <TrendingUp className="w-4 h-4 text-green-600" strokeWidth={2} />
            </div>
            <span className="text-sm font-medium text-gray-500">Total Income</span>
          </div>
          {incomeTotals.size === 0 ? (
            <p className="text-sm text-gray-400">No income recorded</p>
          ) : (
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {Array.from(incomeTotals.entries()).map(([currency, amountMinor]) => (
                <span key={currency} className="text-lg font-semibold text-green-600">
                  {formatMoney(amountMinor, currency)}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-50">
              <TrendingDown className="w-4 h-4 text-red-600" strokeWidth={2} />
            </div>
            <span className="text-sm font-medium text-gray-500">Total Expenses</span>
          </div>
          {expenseTotals.size === 0 ? (
            <p className="text-sm text-gray-400">No expenses recorded</p>
          ) : (
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {Array.from(expenseTotals.entries()).map(([currency, amountMinor]) => (
                <span key={currency} className="text-lg font-semibold text-red-600">
                  {formatMoney(amountMinor, currency)}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100">
              <WalletCards className="w-4 h-4 text-gray-600" strokeWidth={2} />
            </div>
            <span className="text-sm font-medium text-gray-500">Balance</span>
          </div>
          {balanceByCurrency.size === 0 ? (
            <p className="text-sm text-gray-400">No data</p>
          ) : (
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {Array.from(balanceByCurrency.entries()).map(([currency, amountMinor]) => (
                <span
                  key={currency}
                  className={`text-lg font-semibold ${amountMinor >= 0 ? 'text-gray-900' : 'text-red-600'}`}
                >
                  {formatMoney(amountMinor, currency)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Income Section */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
              <input
                type="text"
                value={incomeSearch}
                onChange={(e) => setIncomeSearch(e.target.value)}
                placeholder="Search income…"
                aria-label="Search income"
                className="pl-9 pr-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow w-full sm:w-48"
              />
            </div>
            <input
              type="date"
              value={incomeStartDate}
              onChange={(e) => setIncomeStartDate(e.target.value)}
              aria-label="Income start date"
              className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow"
            />
            <input
              type="date"
              value={incomeEndDate}
              onChange={(e) => setIncomeEndDate(e.target.value)}
              aria-label="Income end date"
              className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow"
            />
            {(incomeSearch || incomeStartDate || incomeEndDate) && (
              <button
                onClick={() => { setIncomeSearch(''); setIncomeStartDate(''); setIncomeEndDate(''); }}
                className="flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2} />
                Clear
              </button>
            )}
          </div>
          <button
            onClick={openCreateIncome}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            Add Income
          </button>
        </div>

        {incomeQuery.isLoading && (
          <div className="bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" strokeWidth={2} />
              <span className="ml-3 text-sm text-gray-500">Loading personal income…</span>
            </div>
          </div>
        )}

        {incomeQuery.error && !incomeQuery.isLoading && (
          <div className="bg-white border border-gray-200 rounded-xl">
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50 mb-3">
                <AlertCircle className="w-5 h-5 text-red-500" strokeWidth={1.5} />
              </div>
              <p className="text-sm text-gray-500 mb-3">We couldn't load your income records.</p>
              <button
                onClick={incomeQuery.refresh}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!incomeQuery.isLoading && !incomeQuery.error && filteredIncome.length === 0 && incomeSearch.trim() === '' && incomeStartDate === '' && incomeEndDate === '' && (
          <div className="bg-white border border-gray-200 rounded-xl">
            <EmptyState
              icon={TrendingUp}
              title="No personal income yet"
              description="Add your first income source to start tracking earnings."
              action={
                <button
                  onClick={openCreateIncome}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
                >
                  <Plus className="w-4 h-4" strokeWidth={2} />
                  Add Income
                </button>
              }
            />
          </div>
        )}

        {!incomeQuery.isLoading && !incomeQuery.error && filteredIncome.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIncome.map((income) => (
              <PersonalIncomeCard
                key={income.id}
                income={income}
                categoryName={income.categoryId ? categoryNameMap.get(income.categoryId) : undefined}
                accountName={income.accountId ? accountNameMap.get(income.accountId) : undefined}
                onEdit={openEditIncome}
                onDelete={setDeleteIncomeTarget}
              />
            ))}
          </div>
        )}
      </div>

      {/* Expense Section */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
              <input
                type="text"
                value={expenseSearch}
                onChange={(e) => setExpenseSearch(e.target.value)}
                placeholder="Search expenses…"
                aria-label="Search expenses"
                className="pl-9 pr-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow w-full sm:w-48"
              />
            </div>
            <input
              type="date"
              value={expenseStartDate}
              onChange={(e) => setExpenseStartDate(e.target.value)}
              aria-label="Expense start date"
              className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow"
            />
            <input
              type="date"
              value={expenseEndDate}
              onChange={(e) => setExpenseEndDate(e.target.value)}
              aria-label="Expense end date"
              className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow"
            />
            {(expenseSearch || expenseStartDate || expenseEndDate) && (
              <button
                onClick={() => { setExpenseSearch(''); setExpenseStartDate(''); setExpenseEndDate(''); }}
                className="flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2} />
                Clear
              </button>
            )}
          </div>
          <button
            onClick={openCreateExpense}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            Add Expense
          </button>
        </div>

        {expenseQuery.isLoading && (
          <div className="bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" strokeWidth={2} />
              <span className="ml-3 text-sm text-gray-500">Loading personal expenses…</span>
            </div>
          </div>
        )}

        {expenseQuery.error && !expenseQuery.isLoading && (
          <div className="bg-white border border-gray-200 rounded-xl">
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50 mb-3">
                <AlertCircle className="w-5 h-5 text-red-500" strokeWidth={1.5} />
              </div>
              <p className="text-sm text-gray-500 mb-3">We couldn't load your expense records.</p>
              <button
                onClick={expenseQuery.refresh}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!expenseQuery.isLoading && !expenseQuery.error && filteredExpenses.length === 0 && expenseSearch.trim() === '' && expenseStartDate === '' && expenseEndDate === '' && (
          <div className="bg-white border border-gray-200 rounded-xl">
            <EmptyState
              icon={TrendingDown}
              title="No personal expenses yet"
              description="Add your first expense to start tracking spending."
              action={
                <button
                  onClick={openCreateExpense}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
                >
                  <Plus className="w-4 h-4" strokeWidth={2} />
                  Add Expense
                </button>
              }
            />
          </div>
        )}

        {!expenseQuery.isLoading && !expenseQuery.error && filteredExpenses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExpenses.map((expense) => (
              <PersonalExpenseCard
                key={expense.id}
                expense={expense}
                categoryName={expense.categoryId ? categoryNameMap.get(expense.categoryId) : undefined}
                accountName={expense.accountId ? accountNameMap.get(expense.accountId) : undefined}
                onEdit={openEditExpense}
                onDelete={setDeleteExpenseTarget}
              />
            ))}
          </div>
        )}
      </div>

      {/* Income Modal */}
      <PersonalIncomeForm
        open={incomeFormOpen}
        income={editingIncome}
        categories={categories ?? []}
        accounts={accounts ?? []}
        isSubmitting={incomeSubmitting}
        errorMessage={incomeError?.message ?? null}
        onSubmit={handleIncomeSubmit}
        onCancel={closeIncomeForm}
      />

      <DeletePersonalIncomeDialog
        open={deleteIncomeTarget !== null}
        income={deleteIncomeTarget}
        isDeleting={deleteIncomeMutation.isLoading}
        errorMessage={deleteIncomeMutation.error?.message ?? null}
        onConfirm={confirmDeleteIncome}
        onCancel={cancelDeleteIncome}
      />

      {/* Expense Modal */}
      <PersonalExpenseForm
        open={expenseFormOpen}
        expense={editingExpense}
        categories={categories ?? []}
        accounts={accounts ?? []}
        isSubmitting={expenseSubmitting}
        errorMessage={expenseError?.message ?? null}
        onSubmit={handleExpenseSubmit}
        onCancel={closeExpenseForm}
      />

      <DeletePersonalExpenseDialog
        open={deleteExpenseTarget !== null}
        expense={deleteExpenseTarget}
        isDeleting={deleteExpenseMutation.isLoading}
        errorMessage={deleteExpenseMutation.error?.message ?? null}
        onConfirm={confirmDeleteExpense}
        onCancel={cancelDeleteExpense}
      />
    </PageContainer>
  );
}

export default PersonalFinancePage;

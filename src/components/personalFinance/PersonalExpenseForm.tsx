import { useEffect, useRef, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { PersonalExpense } from '@/types/domain/personalFinance';
import type { Category } from '@/types/domain/category';
import type { Account } from '@/types/domain/account';
import type { EntityId } from '@/types/common/base';

interface PersonalExpenseFormProps {
  open: boolean;
  expense?: PersonalExpense | null;
  categories: Category[];
  accounts: Account[];
  isSubmitting: boolean;
  errorMessage?: string | null;
  onSubmit: (values: {
    categoryId?: EntityId;
    title: string;
    date: string;
    amount: { amountMinor: number; currency: string };
    accountId?: EntityId;
    notes?: string;
  }) => void;
  onCancel: () => void;
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'CNY', 'BRL', 'ZAR'];

function formatFromMinor(amountMinor: number): string {
  return (amountMinor / 100).toFixed(2);
}

function parseToMinor(value: string): number {
  const parsed = parseFloat(value);
  if (isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}

export function PersonalExpenseForm({
  open,
  expense,
  categories,
  accounts,
  isSubmitting,
  errorMessage,
  onSubmit,
  onCancel,
}: PersonalExpenseFormProps) {
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('0');
  const [currency, setCurrency] = useState('USD');
  const [accountId, setAccountId] = useState('');
  const [notes, setNotes] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTitle(expense?.title ?? '');
      setCategoryId(expense?.categoryId ?? '');
      setDate(expense?.date ?? new Date().toISOString().slice(0, 10));
      setAmount(expense ? formatFromMinor(expense.amount.amountMinor) : '0');
      setCurrency(expense?.amount.currency ?? 'USD');
      setAccountId(expense?.accountId ?? '');
      setNotes(expense?.notes ?? '');
      setLocalError(null);
      const timer = setTimeout(() => titleInputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open, expense]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, isSubmitting, onCancel]);

  if (!open) return null;

  const availableCategories = categories.filter(
    (c) => c.scope === 'personal' && (!c.direction || c.direction === 'expense'),
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setLocalError('Expense title is required.');
      return;
    }
    if (!date.trim()) {
      setLocalError('Date is required.');
      return;
    }
    const amountMinor = parseToMinor(amount);
    if (amountMinor < 0) {
      setLocalError('Amount must not be negative.');
      return;
    }
    setLocalError(null);
    onSubmit({
      categoryId: categoryId ? (categoryId as EntityId) : undefined,
      title: trimmedTitle,
      date: date.trim(),
      amount: { amountMinor, currency },
      accountId: accountId ? (accountId as EntityId) : undefined,
      notes: notes.trim() || undefined,
    });
  };

  const displayError = localError ?? errorMessage;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="expense-form-title"
        className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
          <h2 id="expense-form-title" className="text-base font-semibold text-gray-900">
            {expense ? 'Edit Expense' : 'Add Expense'}
          </h2>
          <button
            onClick={() => !isSubmitting && onCancel()}
            disabled={isSubmitting}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 disabled:opacity-50"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="px-5 py-4 space-y-4">
          <div>
            <label htmlFor="pexpense-title" className="block text-sm font-medium text-gray-700 mb-1.5">
              Title <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              ref={titleInputRef}
              id="pexpense-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              required
              aria-required="true"
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-400"
              placeholder="e.g. Groceries"
            />
          </div>

          <div>
            <label htmlFor="pexpense-category" className="block text-sm font-medium text-gray-700 mb-1.5">
              Category
            </label>
            <select
              id="pexpense-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">No category</option>
              {availableCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pexpense-date" className="block text-sm font-medium text-gray-700 mb-1.5">
                Date <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                id="pexpense-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={isSubmitting}
                required
                aria-required="true"
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
            <div>
              <label htmlFor="pexpense-amount" className="block text-sm font-medium text-gray-700 mb-1.5">
                Amount <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  id="pexpense-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isSubmitting}
                  required
                  aria-required="true"
                  className="flex-1 px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-400"
                />
                <select
                  id="pexpense-currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  disabled={isSubmitting}
                  className="w-20 px-2 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-400"
                >
                  {CURRENCIES.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="pexpense-account" className="block text-sm font-medium text-gray-700 mb-1.5">
              Account
            </label>
            <select
              id="pexpense-account"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">No account</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="pexpense-notes" className="block text-sm font-medium text-gray-700 mb-1.5">
              Notes
            </label>
            <textarea
              id="pexpense-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
              rows={2}
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow resize-none disabled:bg-gray-50 disabled:text-gray-400"
              placeholder="Optional"
            />
          </div>

          {displayError && (
            <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {displayError}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => !isSubmitting && onCancel()}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving…' : expense ? 'Save Changes' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

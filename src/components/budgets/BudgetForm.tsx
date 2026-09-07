import { useEffect, useRef, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Budget } from '@/types/domain/budget';
import type { Category } from '@/types/domain/category';
import type { BudgetPeriod } from '@/types/common/enums';
import type { EntityId } from '@/types/common/base';

interface BudgetFormProps {
  open: boolean;
  budget?: Budget | null;
  categories: Category[];
  isSubmitting: boolean;
  errorMessage?: string | null;
  onSubmit: (values: {
    categoryId: EntityId;
    limit: { amountMinor: number; currency: string };
    period: BudgetPeriod;
    startDate: string;
    endDate: string;
    notes?: string;
  }) => void;
  onCancel: () => void;
}

const PERIODS: BudgetPeriod[] = ['weekly', 'monthly', 'quarterly', 'yearly'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'CNY', 'BRL', 'ZAR'];

function formatFromMinor(amountMinor: number): string {
  return (amountMinor / 100).toFixed(2);
}

function parseToMinor(value: string): number {
  const parsed = parseFloat(value);
  if (isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}

export function BudgetForm({
  open,
  budget,
  categories,
  isSubmitting,
  errorMessage,
  onSubmit,
  onCancel,
}: BudgetFormProps) {
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('0');
  const [currency, setCurrency] = useState('USD');
  const [period, setPeriod] = useState<BudgetPeriod>('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const categorySelectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (open) {
      setCategoryId(budget?.categoryId ?? '');
      setAmount(budget ? formatFromMinor(budget.limit.amountMinor) : '0');
      setCurrency(budget?.limit.currency ?? 'USD');
      setPeriod(budget?.period ?? 'monthly');
      setStartDate(budget?.startDate ?? new Date().toISOString().slice(0, 10));
      setEndDate(budget?.endDate ?? '');
      setNotes(budget?.notes ?? '');
      setLocalError(null);
      const timer = setTimeout(() => categorySelectRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open, budget]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, isSubmitting, onCancel]);

  if (!open) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      setLocalError('Please select a category.');
      return;
    }
    if (!startDate.trim()) {
      setLocalError('Start date is required.');
      return;
    }
    if (!endDate.trim()) {
      setLocalError('End date is required.');
      return;
    }
    const amountMinor = parseToMinor(amount);
    if (amountMinor < 0) {
      setLocalError('Budget limit must not be negative.');
      return;
    }
    setLocalError(null);
    onSubmit({
      categoryId: categoryId as EntityId,
      limit: { amountMinor, currency },
      period,
      startDate: startDate.trim(),
      endDate: endDate.trim(),
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
        aria-labelledby="budget-form-title"
        className="w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
          <h2 id="budget-form-title" className="text-base font-semibold text-gray-900">
            {budget ? 'Edit Budget' : 'Add Budget'}
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
            <label htmlFor="budget-category" className="block text-sm font-medium text-gray-700 mb-1.5">
              Category <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <select
              ref={categorySelectRef}
              id="budget-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={isSubmitting}
              required
              aria-required="true"
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="budget-limit" className="block text-sm font-medium text-gray-700 mb-1.5">
              Limit <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <div className="flex gap-2">
              <input
                id="budget-limit"
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
                id="budget-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                disabled={isSubmitting}
                className="w-20 px-2 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-400"
              >
                {CURRENCIES.map((code) => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="budget-period" className="block text-sm font-medium text-gray-700 mb-1.5">
              Period <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <select
              id="budget-period"
              value={period}
              onChange={(e) => setPeriod(e.target.value as BudgetPeriod)}
              disabled={isSubmitting}
              required
              aria-required="true"
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-400"
            >
              {PERIODS.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="budget-start-date" className="block text-sm font-medium text-gray-700 mb-1.5">
                Start Date <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                id="budget-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isSubmitting}
                required
                aria-required="true"
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
            <div>
              <label htmlFor="budget-end-date" className="block text-sm font-medium text-gray-700 mb-1.5">
                End Date <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                id="budget-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isSubmitting}
                required
                aria-required="true"
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
          </div>

          <div>
            <label htmlFor="budget-notes" className="block text-sm font-medium text-gray-700 mb-1.5">
              Notes
            </label>
            <textarea
              id="budget-notes"
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
              {isSubmitting ? 'Saving…' : budget ? 'Save Changes' : 'Add Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { Pencil, Trash2, Target, Loader2 } from 'lucide-react';
import { useBudgetSpending } from '@/hooks/budgets';
import type { Budget } from '@/types/domain/budget';

interface BudgetCardProps {
  budget: Budget;
  categoryName?: string;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
}

function formatMoney(amountMinor: number, currency: string): string {
  return `${currency} ${(amountMinor / 100).toFixed(2)}`;
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

const periodConfig: Record<string, { label: string; bg: string; text: string }> = {
  weekly: { label: 'Weekly', bg: 'bg-blue-50', text: 'text-blue-700' },
  monthly: { label: 'Monthly', bg: 'bg-green-50', text: 'text-green-700' },
  quarterly: { label: 'Quarterly', bg: 'bg-purple-50', text: 'text-purple-700' },
  yearly: { label: 'Yearly', bg: 'bg-orange-50', text: 'text-orange-700' },
};

export function BudgetCard({ budget, categoryName, onEdit, onDelete }: BudgetCardProps) {
  const period = periodConfig[budget.period] ?? { label: budget.period, bg: 'bg-gray-100', text: 'text-gray-600' };
  const spendingQuery = useBudgetSpending(budget);
  const spending = spendingQuery.data;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 shrink-0">
          <Target className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {categoryName ?? 'Unknown Category'}
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${period.bg} ${period.text}`}>
              {period.label}
            </span>
          </div>
        </div>
        <span className="text-sm font-semibold text-gray-900 shrink-0">
          {formatMoney(budget.limit.amountMinor, budget.limit.currency)}
        </span>
      </div>

      <p className="text-xs text-gray-400">
        {formatDate(budget.startDate)} – {formatDate(budget.endDate)}
      </p>

      {budget.notes && (
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
          {budget.notes}
        </p>
      )}

      <div className="space-y-2" aria-label="Budget spending progress">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Spent</span>
          {spendingQuery.isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-label="Loading spending" />
          ) : (
            <span>
              {formatMoney(spending?.spent.amountMinor ?? 0, budget.limit.currency)} of {formatMoney(budget.limit.amountMinor, budget.limit.currency)}
            </span>
          )}
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-100" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={spending?.percentUsed ?? 0}>
          <div className={`h-full rounded-full transition-all ${spending?.isOverLimit ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${spending?.percentUsed ?? 0}%` }} />
        </div>
        {spending && (
          <p className={`text-xs ${spending.isOverLimit ? 'text-red-600' : 'text-gray-500'}`}>
            {spending.isOverLimit ? 'Over budget by ' : 'Remaining '}
            {formatMoney(Math.abs(spending.remaining.amountMinor), budget.limit.currency)}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => onEdit(budget)}
          aria-label={`Edit budget ${categoryName ?? budget.id}`}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
        >
          <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
          Edit
        </button>
        <button
          onClick={() => onDelete(budget)}
          aria-label={`Delete budget ${categoryName ?? budget.id}`}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
        >
          <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
          Delete
        </button>
      </div>
    </div>
  );
}

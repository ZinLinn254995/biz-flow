import { Pencil, Trash2, Receipt } from 'lucide-react';
import type { BusinessExpense } from '@/types/domain/businessExpense';
import type { EntityId } from '@/types/common/base';

interface BusinessExpenseCardProps {
  expense: BusinessExpense;
  businessName?: string;
  categoryName?: string;
  onEdit: (expense: BusinessExpense) => void;
  onDelete: (expense: BusinessExpense) => void;
}

function formatMoney(amountMinor: number, currency: string): string {
  return `${currency} ${(amountMinor / 100).toFixed(2)}`;
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function BusinessExpenseCard({ expense, businessName, categoryName, onEdit, onDelete }: BusinessExpenseCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 shrink-0">
          <Receipt className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {expense.title}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            {businessName && (
              <span className="text-xs text-gray-400 truncate">{businessName}</span>
            )}
            {categoryName && (
              <>
                <span className="text-xs text-gray-300">·</span>
                <span className="text-xs text-gray-400 truncate">{categoryName}</span>
              </>
            )}
          </div>
        </div>
        <span className="text-sm font-semibold text-gray-900 shrink-0">
          {formatMoney(expense.amount.amountMinor, expense.amount.currency)}
        </span>
      </div>

      <p className="text-xs text-gray-400">{formatDate(expense.date)}</p>

      {expense.notes && (
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
          {expense.notes}
        </p>
      )}

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => onEdit(expense)}
          aria-label={`Edit ${expense.title}`}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
        >
          <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
          Edit
        </button>
        <button
          onClick={() => onDelete(expense)}
          aria-label={`Delete ${expense.title}`}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
        >
          <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
          Delete
        </button>
      </div>
    </div>
  );
}

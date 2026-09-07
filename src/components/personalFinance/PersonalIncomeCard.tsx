import { Pencil, Trash2, TrendingUp } from 'lucide-react';
import type { PersonalIncome } from '@/types/domain/personalFinance';

interface PersonalIncomeCardProps {
  income: PersonalIncome;
  categoryName?: string;
  accountName?: string;
  onEdit: (income: PersonalIncome) => void;
  onDelete: (income: PersonalIncome) => void;
}

function formatMoney(amountMinor: number, currency: string): string {
  return `${currency} ${(amountMinor / 100).toFixed(2)}`;
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function PersonalIncomeCard({ income, categoryName, accountName, onEdit, onDelete }: PersonalIncomeCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50 shrink-0">
          <TrendingUp className="w-5 h-5 text-green-600" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {income.source}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            {categoryName && (
              <span className="text-xs text-gray-400 truncate">{categoryName}</span>
            )}
            {accountName && (
              <>
                <span className="text-xs text-gray-300">·</span>
                <span className="text-xs text-gray-400 truncate">{accountName}</span>
              </>
            )}
          </div>
        </div>
        <span className="text-sm font-semibold text-green-600 shrink-0">
          {formatMoney(income.amount.amountMinor, income.amount.currency)}
        </span>
      </div>

      <p className="text-xs text-gray-400">{formatDate(income.date)}</p>

      {income.notes && (
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
          {income.notes}
        </p>
      )}

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => onEdit(income)}
          aria-label={`Edit ${income.source}`}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
        >
          <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
          Edit
        </button>
        <button
          onClick={() => onDelete(income)}
          aria-label={`Delete ${income.source}`}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
        >
          <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
          Delete
        </button>
      </div>
    </div>
  );
}

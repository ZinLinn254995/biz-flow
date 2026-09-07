import { Pencil, Trash2, Wallet } from 'lucide-react';
import type { Account } from '@/types/domain/account';

interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
}

function formatMoney(amountMinor: number, currency: string): string {
  return `${currency} ${(amountMinor / 100).toFixed(2)}`;
}

const typeConfig: Record<string, { label: string; bg: string; text: string }> = {
  cash: { label: 'Cash', bg: 'bg-green-50', text: 'text-green-700' },
  bank: { label: 'Bank', bg: 'bg-blue-50', text: 'text-blue-700' },
  wallet: { label: 'Wallet', bg: 'bg-purple-50', text: 'text-purple-700' },
  other: { label: 'Other', bg: 'bg-gray-100', text: 'text-gray-600' },
};

export function AccountCard({ account, onEdit, onDelete }: AccountCardProps) {
  const type = typeConfig[account.type] ?? { label: account.type, bg: 'bg-gray-100', text: 'text-gray-600' };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 shrink-0">
          <Wallet className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">{account.name}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${type.bg} ${type.text}`}>
              {type.label}
            </span>
            {account.institution && (
              <span className="text-xs text-gray-400 truncate">{account.institution}</span>
            )}
          </div>
        </div>
        <span className="text-sm font-semibold text-gray-900 shrink-0">
          {formatMoney(account.balance.amountMinor, account.balance.currency)}
        </span>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => onEdit(account)}
          aria-label={`Edit account ${account.name}`}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
        >
          <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
          Edit
        </button>
        <button
          onClick={() => onDelete(account)}
          aria-label={`Delete account ${account.name}`}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
        >
          <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
          Delete
        </button>
      </div>
    </div>
  );
}

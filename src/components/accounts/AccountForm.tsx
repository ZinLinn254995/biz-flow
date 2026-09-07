import { useEffect, useRef, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Account } from '@/types/domain/account';
import type { AccountType } from '@/types/common/enums';

interface AccountFormProps {
  open: boolean;
  account?: Account | null;
  isSubmitting: boolean;
  errorMessage?: string | null;
  onSubmit: (values: {
    name: string;
    type: AccountType;
    balance: { amountMinor: number; currency: string };
    institution?: string;
  }) => void;
  onCancel: () => void;
}

const ACCOUNT_TYPES: AccountType[] = ['cash', 'bank', 'wallet', 'other'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'CNY', 'BRL', 'ZAR'];

function formatFromMinor(amountMinor: number): string {
  return (amountMinor / 100).toFixed(2);
}

function parseToMinor(value: string): number {
  const parsed = parseFloat(value);
  if (isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}

export function AccountForm({
  open,
  account,
  isSubmitting,
  errorMessage,
  onSubmit,
  onCancel,
}: AccountFormProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('cash');
  const [amount, setAmount] = useState('0');
  const [currency, setCurrency] = useState('USD');
  const [institution, setInstitution] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(account?.name ?? '');
      setType(account?.type ?? 'cash');
      setAmount(account ? formatFromMinor(account.balance.amountMinor) : '0');
      setCurrency(account?.balance.currency ?? 'USD');
      setInstitution(account?.institution ?? '');
      setLocalError(null);
      const timer = setTimeout(() => nameInputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open, account]);

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
    const trimmedName = name.trim();
    if (!trimmedName) {
      setLocalError('Account name is required.');
      return;
    }
    const amountMinor = parseToMinor(amount);
    if (amountMinor < 0) {
      setLocalError('Balance must not be negative.');
      return;
    }
    setLocalError(null);
    onSubmit({
      name: trimmedName,
      type,
      balance: { amountMinor, currency },
      institution: institution.trim() || undefined,
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
        aria-labelledby="account-form-title"
        className="w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
          <h2 id="account-form-title" className="text-base font-semibold text-gray-900">
            {account ? 'Edit Account' : 'Add Account'}
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
            <label htmlFor="account-name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Name <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              ref={nameInputRef}
              id="account-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              required
              aria-required="true"
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-400"
              placeholder="e.g. Checking Account"
            />
          </div>

          <div>
            <label htmlFor="account-type" className="block text-sm font-medium text-gray-700 mb-1.5">
              Type <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <select
              id="account-type"
              value={type}
              onChange={(e) => setType(e.target.value as AccountType)}
              disabled={isSubmitting}
              required
              aria-required="true"
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-400"
            >
              {ACCOUNT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="account-balance" className="block text-sm font-medium text-gray-700 mb-1.5">
              Initial Balance <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <div className="flex gap-2">
              <input
                id="account-balance"
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
                id="account-currency"
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
            <label htmlFor="account-institution" className="block text-sm font-medium text-gray-700 mb-1.5">
              Institution
            </label>
            <input
              id="account-institution"
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-400"
              placeholder="e.g. Bank of America"
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
              {isSubmitting ? 'Saving…' : account ? 'Save Changes' : 'Add Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

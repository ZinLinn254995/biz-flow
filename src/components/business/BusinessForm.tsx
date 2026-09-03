import { useEffect, useRef, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Business } from '@/types/domain/business';

interface BusinessFormProps {
  open: boolean;
  business?: Business | null;
  isSubmitting: boolean;
  errorMessage?: string | null;
  onSubmit: (values: { name: string; description?: string; currency: string }) => void;
  onCancel: () => void;
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'CNY', 'BRL', 'ZAR'];

export function BusinessForm({
  open,
  business,
  isSubmitting,
  errorMessage,
  onSubmit,
  onCancel,
}: BusinessFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [localError, setLocalError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(business?.name ?? '');
      setDescription(business?.description ?? '');
      setCurrency(business?.currency ?? 'USD');
      setLocalError(null);
      const timer = setTimeout(() => nameInputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open, business]);

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setLocalError('Business name is required.');
      return;
    }
    if (!currency) {
      setLocalError('Currency is required.');
      return;
    }
    setLocalError(null);
    onSubmit({
      name: trimmedName,
      description: description.trim() || undefined,
      currency: currency.trim(),
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
        aria-labelledby="business-form-title"
        className="w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-200"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 id="business-form-title" className="text-base font-semibold text-gray-900">
            {business ? 'Edit Business' : 'Create Business'}
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
            <label htmlFor="business-name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Name <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              ref={nameInputRef}
              id="business-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              required
              aria-required="true"
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-400"
              placeholder="e.g. My Coffee Shop"
            />
          </div>

          <div>
            <label htmlFor="business-description" className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              id="business-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows={3}
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow resize-none disabled:bg-gray-50 disabled:text-gray-400"
              placeholder="Optional description"
            />
          </div>

          <div>
            <label htmlFor="business-currency" className="block text-sm font-medium text-gray-700 mb-1.5">
              Currency <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <select
              id="business-currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              disabled={isSubmitting}
              required
              aria-required="true"
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-400"
            >
              {CURRENCIES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
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
              {isSubmitting ? 'Saving…' : business ? 'Save Changes' : 'Create Business'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

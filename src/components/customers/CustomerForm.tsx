import { useEffect, useRef, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Customer } from '@/types/domain/customer';
import type { Business } from '@/types/domain/business';
import type { EntityId } from '@/types/common/base';

interface CustomerFormProps {
  open: boolean;
  customer?: Customer | null;
  businesses: Business[];
  isSubmitting: boolean;
  errorMessage?: string | null;
  onSubmit: (values: {
    businessId: EntityId;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    notes?: string;
  }) => void;
  onCancel: () => void;
}

export function CustomerForm({
  open,
  customer,
  businesses,
  isSubmitting,
  errorMessage,
  onSubmit,
  onCancel,
}: CustomerFormProps) {
  const [businessId, setBusinessId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setBusinessId(customer?.businessId ?? '');
      setName(customer?.name ?? '');
      setEmail(customer?.email ?? '');
      setPhone(customer?.phone ?? '');
      setAddress(customer?.address ?? '');
      setNotes(customer?.notes ?? '');
      setLocalError(null);
      const timer = setTimeout(() => nameInputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open, customer]);

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
      setLocalError('Customer name is required.');
      return;
    }
    if (!businessId) {
      setLocalError('Please select a business.');
      return;
    }
    setLocalError(null);
    onSubmit({
      businessId: businessId as EntityId,
      name: trimmedName,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
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
        aria-labelledby="customer-form-title"
        className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
          <h2 id="customer-form-title" className="text-base font-semibold text-gray-900">
            {customer ? 'Edit Customer' : 'Add Customer'}
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
            <label htmlFor="customer-business" className="block text-sm font-medium text-gray-700 mb-1.5">
              Business <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <select
              id="customer-business"
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value)}
              disabled={isSubmitting}
              required
              aria-required="true"
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">Select a business…</option>
              {businesses.map((biz) => (
                <option key={biz.id} value={biz.id}>
                  {biz.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="customer-name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Name <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              ref={nameInputRef}
              id="customer-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              required
              aria-required="true"
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-400"
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="customer-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                id="customer-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-400"
                placeholder="Optional"
              />
            </div>
            <div>
              <label htmlFor="customer-phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone
              </label>
              <input
                id="customer-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-400"
                placeholder="Optional"
              />
            </div>
          </div>

          <div>
            <label htmlFor="customer-address" className="block text-sm font-medium text-gray-700 mb-1.5">
              Address
            </label>
            <input
              id="customer-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-400"
              placeholder="Optional"
            />
          </div>

          <div>
            <label htmlFor="customer-notes" className="block text-sm font-medium text-gray-700 mb-1.5">
              Notes
            </label>
            <textarea
              id="customer-notes"
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
              {isSubmitting ? 'Saving…' : customer ? 'Save Changes' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

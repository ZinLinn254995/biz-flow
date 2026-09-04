import { useEffect, useRef, useState, type FormEvent } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Sale, SaleItem } from '@/types/domain/sale';
import type { Business } from '@/types/domain/business';
import type { Customer } from '@/types/domain/customer';
import type { InventoryItem } from '@/types/domain/inventory';
import type { EntityId, Money } from '@/types/common/base';

interface SaleFormProps {
  open: boolean;
  sale?: Sale | null;
  businesses: Business[];
  customers: Customer[];
  inventoryItems: InventoryItem[];
  isSubmitting: boolean;
  errorMessage?: string | null;
  onSubmit: (values: {
    businessId: EntityId;
    customerId?: EntityId;
    date: string;
    items: SaleItem[];
    totalAmount: Money;
    paymentStatus: Sale['paymentStatus'];
    notes?: string;
  }) => void;
  onCancel: () => void;
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'CNY', 'BRL', 'ZAR'];
const PAYMENT_STATUSES: Sale['paymentStatus'][] = ['pending', 'partial', 'paid', 'refunded'];

interface DraftItem {
  inventoryItemId: string;
  name: string;
  quantity: string;
  unitPriceMinor: string;
}

function formatFromMinor(amountMinor: number): string {
  return (amountMinor / 100).toFixed(2);
}

function parseToMinor(value: string): number {
  const parsed = parseFloat(value);
  if (isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}

function computeLineTotal(qty: number, unitPriceMinor: number): number {
  return qty * unitPriceMinor;
}

function computeTotal(items: DraftItem[]): number {
  return items.reduce((sum, item) => {
    const qty = parseInt(item.quantity, 10) || 0;
    const unit = parseToMinor(item.unitPriceMinor);
    return sum + computeLineTotal(qty, unit);
  }, 0);
}

export function SaleForm({
  open,
  sale,
  businesses,
  customers,
  inventoryItems,
  isSubmitting,
  errorMessage,
  onSubmit,
  onCancel,
}: SaleFormProps) {
  const [businessId, setBusinessId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [date, setDate] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<Sale['paymentStatus']>('pending');
  const [notes, setNotes] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [items, setItems] = useState<DraftItem[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      setBusinessId(sale?.businessId ?? '');
      setCustomerId(sale?.customerId ?? '');
      setDate(sale?.date ?? new Date().toISOString().slice(0, 10));
      setPaymentStatus(sale?.paymentStatus ?? 'pending');
      setNotes(sale?.notes ?? '');
      setCurrency(sale?.totalAmount?.currency ?? 'USD');
      setItems(
        sale?.items?.map((item) => ({
          inventoryItemId: item.inventoryItemId,
          name: item.name,
          quantity: String(item.quantity),
          unitPriceMinor: formatFromMinor(item.unitPrice.amountMinor),
        })) ?? [],
      );
      setLocalError(null);
    }
  }, [open, sale]);

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

  const availableCustomers = customers.filter((c) => !businessId || c.businessId === businessId);
  const availableInventory = inventoryItems.filter((i) => !businessId || i.businessId === businessId);

  const addLineItem = () => {
    setItems((prev) => [
      ...prev,
      { inventoryItemId: '', name: '', quantity: '1', unitPriceMinor: '0' },
    ]);
  };

  const removeLineItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: keyof DraftItem, value: string) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      if (field === 'inventoryItemId') {
        const invItem = availableInventory.find((i) => i.id === value);
        if (invItem) {
          next[index].name = invItem.name;
          next[index].unitPriceMinor = formatFromMinor(invItem.salePrice.amountMinor);
        }
      }
      return next;
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!businessId) {
      setLocalError('Please select a business.');
      return;
    }
    if (!date.trim()) {
      setLocalError('Date is required.');
      return;
    }
    if (items.length === 0) {
      setLocalError('At least one item is required.');
      return;
    }
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.inventoryItemId) {
        setLocalError(`Item ${i + 1}: Please select a product.`);
        return;
      }
      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        setLocalError(`Item ${i + 1}: Quantity must be a positive integer.`);
        return;
      }
      const unitMinor = parseToMinor(item.unitPriceMinor);
      if (unitMinor < 0) {
        setLocalError(`Item ${i + 1}: Unit price must not be negative.`);
        return;
      }
    }

    setLocalError(null);

    const saleItems: SaleItem[] = items.map((item) => {
      const qty = parseInt(item.quantity, 10);
      const unitMinor = parseToMinor(item.unitPriceMinor);
      return {
        inventoryItemId: item.inventoryItemId as EntityId,
        name: item.name,
        quantity: qty,
        unitPrice: { amountMinor: unitMinor, currency },
        lineTotal: { amountMinor: computeLineTotal(qty, unitMinor), currency },
      };
    });

    const totalMinor = computeTotal(items);

    onSubmit({
      businessId: businessId as EntityId,
      customerId: customerId ? (customerId as EntityId) : undefined,
      date: date.trim(),
      items: saleItems,
      totalAmount: { amountMinor: totalMinor, currency },
      paymentStatus,
      notes: notes.trim() || undefined,
    });
  };

  const displayError = localError ?? errorMessage;
  const totalMinor = computeTotal(items);

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
        aria-labelledby="sale-form-title"
        className="w-full max-w-2xl bg-white rounded-xl shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
          <h2 id="sale-form-title" className="text-base font-semibold text-gray-900">
            {sale ? 'Edit Sale' : 'New Sale'}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sale-business" className="block text-sm font-medium text-gray-700 mb-1.5">
                Business <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <select
                id="sale-business"
                value={businessId}
                onChange={(e) => {
                  setBusinessId(e.target.value);
                  setCustomerId('');
                }}
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
              <label htmlFor="sale-customer" className="block text-sm font-medium text-gray-700 mb-1.5">
                Customer
              </label>
              <select
                id="sale-customer"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">No customer</option>
                {availableCustomers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sale-date" className="block text-sm font-medium text-gray-700 mb-1.5">
                Date <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                id="sale-date"
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
              <label htmlFor="sale-payment-status" className="block text-sm font-medium text-gray-700 mb-1.5">
                Payment Status
              </label>
              <select
                id="sale-payment-status"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as Sale['paymentStatus'])}
                disabled={isSubmitting}
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-400"
              >
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Items <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <button
                ref={nameInputRef}
                type="button"
                onClick={addLineItem}
                disabled={isSubmitting}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                Add Item
              </button>
            </div>

            {items.length === 0 && (
              <p className="text-sm text-gray-400 py-3 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                No items added yet. Click "Add Item" to begin.
              </p>
            )}

            <div className="space-y-2">
              {items.map((item, index) => {
                const qty = parseInt(item.quantity, 10) || 0;
                const unitMinor = parseToMinor(item.unitPriceMinor);
                const lineTotal = computeLineTotal(qty, unitMinor);
                return (
                  <div key={index} className="flex flex-col sm:flex-row gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1 min-w-0">
                      <label htmlFor={`item-product-${index}`} className="sr-only">
                        Item {index + 1} product
                      </label>
                      <select
                        id={`item-product-${index}`}
                        value={item.inventoryItemId}
                        onChange={(e) => updateLineItem(index, 'inventoryItemId', e.target.value)}
                        disabled={isSubmitting}
                        className="w-full px-2 py-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-100"
                      >
                        <option value="">Select product…</option>
                        {availableInventory.map((inv) => (
                          <option key={inv.id} value={inv.id}>
                            {inv.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-16">
                        <label htmlFor={`item-qty-${index}`} className="sr-only">
                          Item {index + 1} quantity
                        </label>
                        <input
                          id={`item-qty-${index}`}
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                          disabled={isSubmitting}
                          placeholder="Qty"
                          className="w-full px-2 py-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-100"
                        />
                      </div>
                      <div className="w-24">
                        <label htmlFor={`item-price-${index}`} className="sr-only">
                          Item {index + 1} unit price
                        </label>
                        <input
                          id={`item-price-${index}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPriceMinor}
                          onChange={(e) => updateLineItem(index, 'unitPriceMinor', e.target.value)}
                          disabled={isSubmitting}
                          placeholder="Price"
                          className="w-full px-2 py-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-100"
                        />
                      </div>
                      <div className="flex items-center text-xs font-medium text-gray-600 min-w-[60px] text-right">
                        {currency} {formatFromMinor(lineTotal)}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLineItem(index)}
                        disabled={isSubmitting}
                        aria-label={`Remove item ${index + 1}`}
                        className="flex items-center justify-center w-8 h-8 text-red-500 hover:bg-red-50 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 disabled:opacity-50 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {items.length > 0 && (
              <div className="flex items-center justify-end gap-2 pt-1">
                <span className="text-sm text-gray-500">Total:</span>
                <span className="text-sm font-semibold text-gray-900">
                  {currency} {formatFromMinor(totalMinor)}
                </span>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="sale-currency" className="block text-sm font-medium text-gray-700 mb-1.5">
              Currency
            </label>
            <select
              id="sale-currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              disabled={isSubmitting}
              className="w-full sm:w-32 px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-400"
            >
              {CURRENCIES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="sale-notes" className="block text-sm font-medium text-gray-700 mb-1.5">
              Notes
            </label>
            <textarea
              id="sale-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
              rows={2}
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow resize-none disabled:bg-gray-50 disabled:text-gray-400"
              placeholder="Optional notes"
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
              {isSubmitting ? 'Saving…' : sale ? 'Save Changes' : 'Create Sale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

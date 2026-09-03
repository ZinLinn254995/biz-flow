import { useEffect, useRef, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { InventoryItem } from '@/types/domain/inventory';
import type { Business } from '@/types/domain/business';
import type { EntityId } from '@/types/common/base';

interface InventoryFormProps {
  open: boolean;
  item?: InventoryItem | null;
  businesses: Business[];
  isSubmitting: boolean;
  errorMessage?: string | null;
  onSubmit: (values: {
    businessId: EntityId;
    name: string;
    sku?: string;
    quantity: number;
    unit: string;
    costPrice: { amountMinor: number; currency: string };
    salePrice: { amountMinor: number; currency: string };
    reorderThreshold?: number;
    stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  }) => void;
  onCancel: () => void;
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'CNY', 'BRL', 'ZAR'];
const UNITS = ['pcs', 'kg', 'g', 'litre', 'ml', 'box', 'pack', 'metre', 'cm'];

function formatFromMinor(amountMinor: number): string {
  return (amountMinor / 100).toFixed(2);
}

function parseToMinor(value: string): number {
  const parsed = parseFloat(value);
  if (isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}

export function InventoryForm({
  open,
  item,
  businesses,
  isSubmitting,
  errorMessage,
  onSubmit,
  onCancel,
}: InventoryFormProps) {
  const [businessId, setBusinessId] = useState('');
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [quantity, setQuantity] = useState('0');
  const [unit, setUnit] = useState('pcs');
  const [costPrice, setCostPrice] = useState('0');
  const [costCurrency, setCostCurrency] = useState('USD');
  const [salePrice, setSalePrice] = useState('0');
  const [saleCurrency, setSaleCurrency] = useState('USD');
  const [reorderThreshold, setReorderThreshold] = useState('');
  const [stockStatus, setStockStatus] = useState<'in_stock' | 'low_stock' | 'out_of_stock'>('in_stock');
  const [localError, setLocalError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setBusinessId(item?.businessId ?? '');
      setName(item?.name ?? '');
      setSku(item?.sku ?? '');
      setQuantity(String(item?.quantity ?? 0));
      setUnit(item?.unit ?? 'pcs');
      setCostPrice(item ? formatFromMinor(item.costPrice.amountMinor) : '0');
      setCostCurrency(item?.costPrice.currency ?? 'USD');
      setSalePrice(item ? formatFromMinor(item.salePrice.amountMinor) : '0');
      setSaleCurrency(item?.salePrice.currency ?? 'USD');
      setReorderThreshold(item?.reorderThreshold != null ? String(item.reorderThreshold) : '');
      setStockStatus(item?.stockStatus ?? 'in_stock');
      setLocalError(null);
      const timer = setTimeout(() => nameInputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open, item]);

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
      setLocalError('Item name is required.');
      return;
    }
    if (!businessId) {
      setLocalError('Please select a business.');
      return;
    }
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 0) {
      setLocalError('Quantity must be a non-negative integer.');
      return;
    }
    if (!unit.trim()) {
      setLocalError('Unit is required.');
      return;
    }
    const costMinor = parseToMinor(costPrice);
    if (costMinor < 0) {
      setLocalError('Cost price must not be negative.');
      return;
    }
    const saleMinor = parseToMinor(salePrice);
    if (saleMinor < 0) {
      setLocalError('Sale price must not be negative.');
      return;
    }
    const threshold = reorderThreshold.trim() === '' ? undefined : parseInt(reorderThreshold, 10);
    if (threshold != null && (isNaN(threshold) || threshold < 0)) {
      setLocalError('Reorder threshold must be a non-negative integer.');
      return;
    }

    setLocalError(null);
    onSubmit({
      businessId: businessId as EntityId,
      name: trimmedName,
      sku: sku.trim() || undefined,
      quantity: qty,
      unit: unit.trim(),
      costPrice: { amountMinor: costMinor, currency: costCurrency },
      salePrice: { amountMinor: saleMinor, currency: saleCurrency },
      reorderThreshold: threshold,
      stockStatus,
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
        aria-labelledby="inventory-form-title"
        className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
          <h2 id="inventory-form-title" className="text-base font-semibold text-gray-900">
            {item ? 'Edit Inventory Item' : 'Add Inventory Item'}
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
            <label htmlFor="inventory-business" className="block text-sm font-medium text-gray-700 mb-1.5">
              Business <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <select
              id="inventory-business"
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
            <label htmlFor="inventory-name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Item Name <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              ref={nameInputRef}
              id="inventory-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              required
              aria-required="true"
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-400"
              placeholder="e.g. Coffee Beans 1kg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="inventory-sku" className="block text-sm font-medium text-gray-700 mb-1.5">
                SKU
              </label>
              <input
                id="inventory-sku"
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-400"
                placeholder="Optional"
              />
            </div>
            <div>
              <label htmlFor="inventory-unit" className="block text-sm font-medium text-gray-700 mb-1.5">
                Unit <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <select
                id="inventory-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                disabled={isSubmitting}
                required
                aria-required="true"
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-400"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="inventory-quantity" className="block text-sm font-medium text-gray-700 mb-1.5">
                Quantity <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                id="inventory-quantity"
                type="number"
                min="0"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={isSubmitting}
                required
                aria-required="true"
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
            <div>
              <label htmlFor="inventory-reorder" className="block text-sm font-medium text-gray-700 mb-1.5">
                Reorder Threshold
              </label>
              <input
                id="inventory-reorder"
                type="number"
                min="0"
                step="1"
                value={reorderThreshold}
                onChange={(e) => setReorderThreshold(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-400"
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="inventory-cost" className="block text-sm font-medium text-gray-700 mb-1.5">
                Cost Price <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  id="inventory-cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  disabled={isSubmitting}
                  required
                  aria-required="true"
                  className="flex-1 px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-400"
                />
                <select
                  id="inventory-cost-currency"
                  value={costCurrency}
                  onChange={(e) => setCostCurrency(e.target.value)}
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
            <div>
              <label htmlFor="inventory-sale" className="block text-sm font-medium text-gray-700 mb-1.5">
                Sale Price <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  id="inventory-sale"
                  type="number"
                  min="0"
                  step="0.01"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  disabled={isSubmitting}
                  required
                  aria-required="true"
                  className="flex-1 px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-400"
                />
                <select
                  id="inventory-sale-currency"
                  value={saleCurrency}
                  onChange={(e) => setSaleCurrency(e.target.value)}
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
            <label htmlFor="inventory-stock-status" className="block text-sm font-medium text-gray-700 mb-1.5">
              Stock Status
            </label>
            <select
              id="inventory-stock-status"
              value={stockStatus}
              onChange={(e) => setStockStatus(e.target.value as 'in_stock' | 'low_stock' | 'out_of_stock')}
              disabled={isSubmitting}
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
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
              {isSubmitting ? 'Saving…' : item ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

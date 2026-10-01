import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import type { Business } from '@/types/domain/business';
import type { InventoryItem } from '@/types/domain/inventory';
import type { Purchase, PurchaseItem } from '@/types/domain/purchase';
import type { EntityId, Money } from '@/types/common/base';

interface PurchaseFormProps {
  open: boolean;
  purchase?: Purchase | null;
  businesses: Business[];
  inventoryItems: InventoryItem[];
  isSubmitting: boolean;
  errorMessage?: string | null;
  onSubmit: (values: {
    businessId: EntityId;
    date: string;
    items: PurchaseItem[];
    totalAmount: Money;
    supplierName?: string;
    notes?: string;
  }) => void;
  onCancel: () => void;
}

interface DraftItem {
  inventoryItemId: string;
  name: string;
  quantity: string;
  unitCostMinor: string;
}

function formatFromMinor(amountMinor: number): string {
  return (amountMinor / 100).toFixed(2);
}

function parseMinor(value: string): number | null {
  if (!/^\d+(\.\d{0,2})?$/.test(value.trim())) return null;
  const [whole, fraction = ''] = value.trim().split('.');
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
}

function formatMoney(amountMinor: number, currency: string): string {
  return `${currency} ${(amountMinor / 100).toFixed(2)}`;
}

export function PurchaseForm({
  open,
  purchase,
  businesses,
  inventoryItems,
  isSubmitting,
  errorMessage,
  onSubmit,
  onCancel,
}: PurchaseFormProps) {
  const [businessId, setBusinessId] = useState('');
  const [date, setDate] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [notes, setNotes] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [items, setItems] = useState<DraftItem[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setBusinessId(purchase?.businessId ?? '');
    setDate(purchase?.date ?? new Date().toISOString().slice(0, 10));
    setSupplierName(purchase?.supplierName ?? '');
    setNotes(purchase?.notes ?? '');
    setCurrency(purchase?.totalAmount.currency ?? 'USD');
    setItems(purchase?.items.map((item) => ({
      inventoryItemId: item.inventoryItemId,
      name: item.name,
      quantity: String(item.quantity),
      unitCostMinor: formatFromMinor(item.unitCost.amountMinor),
    })) ?? []);
    setLocalError(null);
  }, [open, purchase]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, isSubmitting, onCancel]);

  if (!open) return null;

  const availableInventory = inventoryItems.filter((item) => !businessId || item.businessId === businessId);
  const totalMinor = items.reduce((sum, item) => {
    const quantity = Number.parseInt(item.quantity, 10) || 0;
    const unitCost = parseMinor(item.unitCostMinor) ?? 0;
    return sum + quantity * unitCost;
  }, 0);

  const addLine = () => setItems((current) => [...current, { inventoryItemId: '', name: '', quantity: '1', unitCostMinor: '0.00' }]);
  const removeLine = (index: number) => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  const updateLine = (index: number, field: keyof DraftItem, value: string) => {
    setItems((current) => {
      const next = [...current];
      next[index] = { ...next[index], [field]: value };
      if (field === 'inventoryItemId') {
        const inventoryItem = availableInventory.find((item) => item.id === value);
        if (inventoryItem) {
          next[index].name = inventoryItem.name;
          next[index].unitCostMinor = formatFromMinor(inventoryItem.costPrice.amountMinor);
          setCurrency(inventoryItem.costPrice.currency);
        }
      }
      return next;
    });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!businessId) return setLocalError('Please select a business.');
    if (!date.trim()) return setLocalError('Date is required.');
    if (items.length === 0) return setLocalError('At least one item is required.');

    const purchaseItems: PurchaseItem[] = [];
    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      const quantity = Number.parseInt(item.quantity, 10);
      const unitCost = parseMinor(item.unitCostMinor);
      if (!item.inventoryItemId) return setLocalError(`Item ${index + 1}: Please select an inventory item.`);
      if (!Number.isInteger(quantity) || quantity <= 0) return setLocalError(`Item ${index + 1}: Quantity must be a positive integer.`);
      if (unitCost === null) return setLocalError(`Item ${index + 1}: Unit cost must be a valid non-negative amount with up to two decimals.`);
      purchaseItems.push({
        inventoryItemId: item.inventoryItemId as EntityId,
        name: item.name,
        quantity,
        unitCost: { amountMinor: unitCost, currency },
        lineTotal: { amountMinor: quantity * unitCost, currency },
      });
    }

    setLocalError(null);
    onSubmit({
      businessId: businessId as EntityId,
      date: date.trim(),
      items: purchaseItems,
      totalAmount: { amountMinor: purchaseItems.reduce((sum, item) => sum + item.lineTotal.amountMinor, 0), currency },
      supplierName: supplierName.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  const displayError = localError ?? errorMessage;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50" onClick={(event) => { if (event.target === event.currentTarget && !isSubmitting) onCancel(); }}>
      <div role="dialog" aria-modal="true" aria-labelledby="purchase-form-title" className="w-full max-w-2xl bg-white rounded-xl shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 id="purchase-form-title" className="text-base font-semibold text-gray-900">{purchase ? 'Edit Purchase' : 'New Purchase'}</h2>
          <button onClick={() => !isSubmitting && onCancel()} disabled={isSubmitting} aria-label="Close dialog" className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-50"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} noValidate className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block text-sm font-medium text-gray-700">Business <span className="text-red-500">*</span>
              <select value={businessId} onChange={(event) => setBusinessId(event.target.value)} disabled={isSubmitting} className="mt-1.5 w-full px-3 py-2 text-sm font-normal text-gray-900 border border-gray-300 rounded-lg">
                <option value="">Select a business…</option>
                {businesses.map((business) => <option key={business.id} value={business.id}>{business.name}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium text-gray-700">Purchase date <span className="text-red-500">*</span>
              <input type="date" value={date} onChange={(event) => setDate(event.target.value)} disabled={isSubmitting} className="mt-1.5 w-full px-3 py-2 text-sm font-normal text-gray-900 border border-gray-300 rounded-lg" />
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block text-sm font-medium text-gray-700">Supplier name
              <input value={supplierName} onChange={(event) => setSupplierName(event.target.value)} disabled={isSubmitting} className="mt-1.5 w-full px-3 py-2 text-sm font-normal text-gray-900 border border-gray-300 rounded-lg" />
            </label>
            <label className="block text-sm font-medium text-gray-700">Currency
              <input value={currency} onChange={(event) => setCurrency(event.target.value.toUpperCase())} maxLength={3} disabled={isSubmitting} className="mt-1.5 w-full px-3 py-2 text-sm font-normal text-gray-900 border border-gray-300 rounded-lg" />
            </label>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2"><label className="text-sm font-medium text-gray-700">Items <span className="text-red-500">*</span></label><button type="button" onClick={addLine} disabled={isSubmitting} className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg"><Plus className="w-3.5 h-3.5" /> Add Item</button></div>
            {items.length === 0 && <p className="text-sm text-gray-400 py-3 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">No items added yet.</p>}
            <div className="space-y-2">
              {items.map((item, index) => {
                const quantity = Number.parseInt(item.quantity, 10) || 0;
                const unitCost = parseMinor(item.unitCostMinor) ?? 0;
                return <div key={index} className="grid grid-cols-1 sm:grid-cols-[1fr_90px_120px_auto] gap-2 items-end p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <label className="text-xs text-gray-500">Inventory item<select value={item.inventoryItemId} onChange={(event) => updateLine(index, 'inventoryItemId', event.target.value)} disabled={isSubmitting} className="mt-1 w-full px-2 py-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg"><option value="">Select item…</option>{availableInventory.map((inventoryItem) => <option key={inventoryItem.id} value={inventoryItem.id}>{inventoryItem.name}</option>)}</select></label>
                  <label className="text-xs text-gray-500">Quantity<input type="number" min="1" step="1" value={item.quantity} onChange={(event) => updateLine(index, 'quantity', event.target.value)} disabled={isSubmitting} className="mt-1 w-full px-2 py-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg" /></label>
                  <label className="text-xs text-gray-500">Unit cost<input inputMode="decimal" value={item.unitCostMinor} onChange={(event) => updateLine(index, 'unitCostMinor', event.target.value)} disabled={isSubmitting} className="mt-1 w-full px-2 py-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg" /><span className="block mt-1 text-gray-700">Line: {formatMoney(quantity * unitCost, currency)}</span></label>
                  <button type="button" onClick={() => removeLine(index)} disabled={isSubmitting} aria-label={`Remove item ${index + 1}`} className="p-2 text-red-600 border border-red-200 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>;
              })}
            </div>
          </div>
          <label className="block text-sm font-medium text-gray-700">Notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} disabled={isSubmitting} rows={3} className="mt-1.5 w-full px-3 py-2 text-sm font-normal text-gray-900 border border-gray-300 rounded-lg" /></label>
          <div className="flex items-center justify-between border-t border-gray-200 pt-4"><span className="text-sm font-medium text-gray-600">Purchase total</span><span className="text-lg font-semibold text-gray-900">{formatMoney(totalMinor, currency)}</span></div>
          {displayError && <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{displayError}</p>}
          <div className="flex justify-end gap-3"><button type="button" onClick={onCancel} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg">Cancel</button><button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg disabled:opacity-50">{isSubmitting ? 'Saving…' : purchase ? 'Save Changes' : 'Create Purchase'}</button></div>
        </form>
      </div>
    </div>
  );
}

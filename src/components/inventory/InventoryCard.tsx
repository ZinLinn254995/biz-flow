import { Pencil, Trash2, Package } from 'lucide-react';
import type { InventoryItem } from '@/types/domain/inventory';
import type { Business } from '@/types/domain/business';
import type { EntityId } from '@/types/common/base';

interface InventoryCardProps {
  item: InventoryItem;
  businessName?: string;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
}

const stockStatusConfig: Record<
  InventoryItem['stockStatus'],
  { label: string; bg: string; text: string; dot: string }
> = {
  in_stock: { label: 'In Stock', bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  low_stock: { label: 'Low Stock', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  out_of_stock: { label: 'Out of Stock', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
};

function formatMoney(amountMinor: number, currency: string): string {
  return `${currency} ${(amountMinor / 100).toFixed(2)}`;
}

export function InventoryCard({ item, businessName, onEdit, onDelete }: InventoryCardProps) {
  const status = stockStatusConfig[item.stockStatus];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 shrink-0">
          <Package className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {item.name}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            {item.sku && (
              <span className="text-xs text-gray-400">SKU: {item.sku}</span>
            )}
            {businessName && (
              <span className="text-xs text-gray-400 truncate">{businessName}</span>
            )}
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full ${status.bg} ${status.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="text-gray-400">Quantity</p>
          <p className="font-medium text-gray-900 mt-0.5">
            {item.quantity} {item.unit}
          </p>
        </div>
        <div>
          <p className="text-gray-400">Cost</p>
          <p className="font-medium text-gray-900 mt-0.5">
            {formatMoney(item.costPrice.amountMinor, item.costPrice.currency)}
          </p>
        </div>
        <div>
          <p className="text-gray-400">Sale</p>
          <p className="font-medium text-gray-900 mt-0.5">
            {formatMoney(item.salePrice.amountMinor, item.salePrice.currency)}
          </p>
        </div>
      </div>

      {item.reorderThreshold != null && (
        <p className="text-xs text-gray-400">
          Reorder at: {item.reorderThreshold} {item.unit}
        </p>
      )}

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => onEdit(item)}
          aria-label={`Edit ${item.name}`}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
        >
          <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
          Edit
        </button>
        <button
          onClick={() => onDelete(item)}
          aria-label={`Delete ${item.name}`}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
        >
          <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
          Delete
        </button>
      </div>
    </div>
  );
}

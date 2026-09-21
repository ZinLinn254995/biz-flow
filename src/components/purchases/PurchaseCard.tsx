import { Eye, Pencil, Trash2, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Purchase } from '@/types/domain/purchase';

interface PurchaseCardProps {
  purchase: Purchase;
  businessName?: string;
  onEdit: (purchase: Purchase) => void;
  onDelete: (purchase: Purchase) => void;
}

function formatMoney(amountMinor: number, currency: string): string {
  return `${currency} ${(amountMinor / 100).toFixed(2)}`;
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function PurchaseCard({ purchase, businessName, onEdit, onDelete }: PurchaseCardProps) {
  const itemCount = purchase.items.length;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 shrink-0">
          <Package className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">{formatDate(purchase.date)}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            {businessName && <span className="text-xs text-gray-400 truncate">{businessName}</span>}
            {purchase.supplierName && (
              <>
                <span className="text-xs text-gray-300">·</span>
                <span className="text-xs text-gray-400 truncate">{purchase.supplierName}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-gray-400">Items</p>
          <p className="font-medium text-gray-900 mt-0.5">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
        </div>
        <div>
          <p className="text-gray-400">Total</p>
          <p className="font-medium text-gray-900 mt-0.5">
            {formatMoney(purchase.totalAmount.amountMinor, purchase.totalAmount.currency)}
          </p>
        </div>
      </div>

      {purchase.notes && <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{purchase.notes}</p>}

      <div className="flex items-center gap-2 pt-1">
        <Link
          to={`/purchases/${purchase.id}`}
          aria-label={`View purchase ${formatDate(purchase.date)}`}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
        >
          <Eye className="w-3.5 h-3.5" strokeWidth={2} /> View
        </Link>
        <button
          onClick={() => onEdit(purchase)}
          aria-label={`Edit purchase ${formatDate(purchase.date)}`}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
        >
          <Pencil className="w-3.5 h-3.5" strokeWidth={2} /> Edit
        </button>
        <button
          onClick={() => onDelete(purchase)}
          aria-label={`Delete purchase ${formatDate(purchase.date)}`}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
        >
          <Trash2 className="w-3.5 h-3.5" strokeWidth={2} /> Delete
        </button>
      </div>
    </div>
  );
}

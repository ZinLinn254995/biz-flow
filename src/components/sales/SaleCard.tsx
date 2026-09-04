import { Pencil, Trash2, ShoppingCart } from 'lucide-react';
import type { Sale } from '@/types/domain/sale';
import type { EntityId } from '@/types/common/base';

interface SaleCardProps {
  sale: Sale;
  businessName?: string;
  customerName?: string;
  onEdit: (sale: Sale) => void;
  onDelete: (sale: Sale) => void;
}

const paymentStatusConfig: Record<
  Sale['paymentStatus'],
  { label: string; bg: string; text: string; dot: string }
> = {
  pending: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  partial: { label: 'Partial', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  paid: { label: 'Paid', bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  refunded: { label: 'Refunded', bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
};

function formatMoney(amountMinor: number, currency: string): string {
  return `${currency} ${(amountMinor / 100).toFixed(2)}`;
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function SaleCard({ sale, businessName, customerName, onEdit, onDelete }: SaleCardProps) {
  const status = paymentStatusConfig[sale.paymentStatus];
  const itemCount = sale.items.length;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 shrink-0">
          <ShoppingCart className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">
            {formatDate(sale.date)}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            {businessName && (
              <span className="text-xs text-gray-400 truncate">{businessName}</span>
            )}
            {customerName && (
              <>
                <span className="text-xs text-gray-300">·</span>
                <span className="text-xs text-gray-400 truncate">{customerName}</span>
              </>
            )}
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full ${status.bg} ${status.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-gray-400">Items</p>
          <p className="font-medium text-gray-900 mt-0.5">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </p>
        </div>
        <div>
          <p className="text-gray-400">Total</p>
          <p className="font-medium text-gray-900 mt-0.5">
            {formatMoney(sale.totalAmount.amountMinor, sale.totalAmount.currency)}
          </p>
        </div>
      </div>

      {sale.notes && (
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
          {sale.notes}
        </p>
      )}

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => onEdit(sale)}
          aria-label={`Edit sale ${formatDate(sale.date)}`}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
        >
          <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
          Edit
        </button>
        <button
          onClick={() => onDelete(sale)}
          aria-label={`Delete sale ${formatDate(sale.date)}`}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
        >
          <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
          Delete
        </button>
      </div>
    </div>
  );
}

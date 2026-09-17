import { Printer } from 'lucide-react';
import type { Sale } from '@/types/domain/sale';

interface SaleReceiptProps {
  sale: Sale;
  businessName?: string;
  customerName?: string;
  onPrint: () => void;
}

function formatMoney(amountMinor: number, currency: string): string {
  return `${currency} ${(amountMinor / 100).toFixed(2)}`;
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export function SaleReceipt({ sale, businessName, customerName, onPrint }: SaleReceiptProps) {
  return (
    <section className="bg-white border border-gray-200 rounded-xl p-6 print:border-0 print:rounded-none print:p-0" aria-label="Sale receipt">
      <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Receipt</p>
          <h2 className="mt-1 text-xl font-semibold text-gray-900">{businessName ?? 'Sale'}</h2>
          <p className="mt-1 text-sm text-gray-500">{formatDate(sale.date)}</p>
        </div>
        <button
          type="button"
          onClick={onPrint}
          className="print:hidden flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
        >
          <Printer className="w-4 h-4" strokeWidth={2} />
          Print
        </button>
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-gray-200 text-sm">
        <div>
          <dt className="text-gray-400">Payment status</dt>
          <dd className="mt-1 font-medium capitalize text-gray-900">{sale.paymentStatus}</dd>
        </div>
        {customerName && (
          <div>
            <dt className="text-gray-400">Customer</dt>
            <dd className="mt-1 font-medium text-gray-900">{customerName}</dd>
          </div>
        )}
      </dl>

      <div className="py-5 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Items</h3>
        <div className="mt-3 divide-y divide-gray-100">
          {sale.items.map((item, index) => (
            <div key={`${item.inventoryItemId}-${index}`} className="flex items-start justify-between gap-4 py-3 text-sm">
              <div>
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="mt-1 text-gray-500">
                  {item.quantity} × {formatMoney(item.unitPrice.amountMinor, item.unitPrice.currency)}
                </p>
              </div>
              <p className="font-medium text-gray-900">{formatMoney(item.lineTotal.amountMinor, item.lineTotal.currency)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 py-5">
        <span className="text-base font-semibold text-gray-900">Total</span>
        <span className="text-lg font-semibold text-gray-900">
          {formatMoney(sale.totalAmount.amountMinor, sale.totalAmount.currency)}
        </span>
      </div>

      {sale.notes && (
        <div className="border-t border-gray-200 pt-5 text-sm">
          <p className="text-gray-400">Notes</p>
          <p className="mt-1 text-gray-700 whitespace-pre-wrap">{sale.notes}</p>
        </div>
      )}
    </section>
  );
}
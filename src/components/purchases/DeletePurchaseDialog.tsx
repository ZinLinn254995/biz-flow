import { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { Purchase } from '@/types/domain/purchase';

interface DeletePurchaseDialogProps {
  open: boolean;
  purchase: Purchase | null;
  isDeleting: boolean;
  errorMessage?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function DeletePurchaseDialog({
  open,
  purchase,
  isDeleting,
  errorMessage,
  onConfirm,
  onCancel,
}: DeletePurchaseDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => cancelButtonRef.current?.focus(), 50);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isDeleting) onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, isDeleting, onCancel]);

  if (!open || !purchase) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isDeleting) onCancel();
      }}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="delete-purchase-title" className="w-full max-w-sm bg-white rounded-xl shadow-xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-50">
              <AlertTriangle className="w-4 h-4 text-red-600" strokeWidth={2} />
            </div>
            <h2 id="delete-purchase-title" className="text-base font-semibold text-gray-900">Delete Purchase</h2>
          </div>
          <button onClick={() => !isDeleting && onCancel()} disabled={isDeleting} aria-label="Close dialog" className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50">
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            Are you sure you want to delete the purchase from <span className="font-semibold text-gray-900">{formatDate(purchase.date)}</span>? This will reverse its stock increase.
          </p>
          {errorMessage && <p role="alert" className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{errorMessage}</p>}
        </div>
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-200">
          <button ref={cancelButtonRef} type="button" onClick={() => !isDeleting && onCancel()} disabled={isDeleting} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50">Cancel</button>
          <button type="button" onClick={onConfirm} disabled={isDeleting} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">{isDeleting ? 'Deleting…' : 'Delete'}</button>
        </div>
      </div>
    </div>
  );
}

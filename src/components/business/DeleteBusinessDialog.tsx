import { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { Business } from '@/types/domain/business';

interface DeleteBusinessDialogProps {
  open: boolean;
  business: Business | null;
  isDeleting: boolean;
  errorMessage?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteBusinessDialog({
  open,
  business,
  isDeleting,
  errorMessage,
  onConfirm,
  onCancel,
}: DeleteBusinessDialogProps) {
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => cancelBtnRef.current?.focus(), 50);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, isDeleting, onCancel]);

  if (!open || !business) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-business-title"
        className="w-full max-w-sm bg-white rounded-xl shadow-xl border border-gray-200"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-50">
              <AlertTriangle className="w-4 h-4 text-red-600" strokeWidth={2} />
            </div>
            <h2 id="delete-business-title" className="text-base font-semibold text-gray-900">
              Delete Business
            </h2>
          </div>
          <button
            onClick={() => !isDeleting && onCancel()}
            disabled={isDeleting}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 disabled:opacity-50"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        <div className="px-5 py-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            Are you sure you want to delete <span className="font-semibold text-gray-900">{business.name}</span>?
            This action cannot be undone.
          </p>

          {errorMessage && (
            <p role="alert" className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {errorMessage}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-200">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={() => !isDeleting && onCancel()}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

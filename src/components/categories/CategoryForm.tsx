import { useEffect, useRef, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Category } from '@/types/domain/category';
import type { CategoryScope, TransactionDirection } from '@/types/common/enums';

interface CategoryFormProps {
  open: boolean;
  category?: Category | null;
  isSubmitting: boolean;
  errorMessage?: string | null;
  onSubmit: (values: {
    name: string;
    scope: CategoryScope;
    direction?: TransactionDirection;
  }) => void;
  onCancel: () => void;
}

const SCOPES: CategoryScope[] = ['business', 'personal'];
const DIRECTIONS: TransactionDirection[] = ['income', 'expense'];

export function CategoryForm({
  open,
  category,
  isSubmitting,
  errorMessage,
  onSubmit,
  onCancel,
}: CategoryFormProps) {
  const [name, setName] = useState('');
  const [scope, setScope] = useState<CategoryScope>('business');
  const [direction, setDirection] = useState<TransactionDirection | ''>('');
  const [localError, setLocalError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(category?.name ?? '');
      setScope(category?.scope ?? 'business');
      setDirection(category?.direction ?? '');
      setLocalError(null);
      const timer = setTimeout(() => nameInputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open, category]);

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
      setLocalError('Category name is required.');
      return;
    }
    setLocalError(null);
    onSubmit({
      name: trimmedName,
      scope,
      direction: direction || undefined,
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
        aria-labelledby="category-form-title"
        className="w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
          <h2 id="category-form-title" className="text-base font-semibold text-gray-900">
            {category ? 'Edit Category' : 'Add Category'}
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
            <label htmlFor="category-name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Name <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              ref={nameInputRef}
              id="category-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              required
              aria-required="true"
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-400"
              placeholder="e.g. Office Supplies"
            />
          </div>

          <div>
            <label htmlFor="category-scope" className="block text-sm font-medium text-gray-700 mb-1.5">
              Scope <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <select
              id="category-scope"
              value={scope}
              onChange={(e) => setScope(e.target.value as CategoryScope)}
              disabled={isSubmitting}
              required
              aria-required="true"
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-400"
            >
              {SCOPES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="category-direction" className="block text-sm font-medium text-gray-700 mb-1.5">
              Direction
            </label>
            <select
              id="category-direction"
              value={direction}
              onChange={(e) => setDirection(e.target.value as TransactionDirection | '')}
              disabled={isSubmitting}
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">None</option>
              {DIRECTIONS.map((d) => (
                <option key={d} value={d}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </option>
              ))}
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
              {isSubmitting ? 'Saving…' : category ? 'Save Changes' : 'Add Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

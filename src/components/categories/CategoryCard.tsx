import { Pencil, Trash2, Tag } from 'lucide-react';
import type { Category } from '@/types/domain/category';

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

const scopeConfig: Record<string, { label: string; bg: string; text: string }> = {
  business: { label: 'Business', bg: 'bg-blue-50', text: 'text-blue-700' },
  personal: { label: 'Personal', bg: 'bg-purple-50', text: 'text-purple-700' },
};

const directionConfig: Record<string, { label: string; bg: string; text: string }> = {
  income: { label: 'Income', bg: 'bg-green-50', text: 'text-green-700' },
  expense: { label: 'Expense', bg: 'bg-red-50', text: 'text-red-700' },
};

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const scope = scopeConfig[category.scope] ?? { label: category.scope, bg: 'bg-gray-100', text: 'text-gray-600' };
  const direction = category.direction
    ? directionConfig[category.direction] ?? { label: category.direction, bg: 'bg-gray-100', text: 'text-gray-600' }
    : null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 shrink-0">
          <Tag className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {category.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${scope.bg} ${scope.text}`}>
              {scope.label}
            </span>
            {direction && (
              <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${direction.bg} ${direction.text}`}>
                {direction.label}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => onEdit(category)}
          aria-label={`Edit category ${category.name}`}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
        >
          <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
          Edit
        </button>
        <button
          onClick={() => onDelete(category)}
          aria-label={`Delete category ${category.name}`}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
        >
          <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
          Delete
        </button>
      </div>
    </div>
  );
}

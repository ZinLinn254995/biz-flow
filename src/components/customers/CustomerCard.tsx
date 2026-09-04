import { Pencil, Trash2, Users, Mail, Phone, MapPin } from 'lucide-react';
import type { Customer } from '@/types/domain/customer';

interface CustomerCardProps {
  customer: Customer;
  businessName?: string;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export function CustomerCard({ customer, businessName, onEdit, onDelete }: CustomerCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 shrink-0">
          <Users className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {customer.name}
          </h3>
          {businessName && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">{businessName}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        {customer.email && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" strokeWidth={2} />
            <span className="truncate">{customer.email}</span>
          </div>
        )}
        {customer.phone && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" strokeWidth={2} />
            <span className="truncate">{customer.phone}</span>
          </div>
        )}
        {customer.address && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" strokeWidth={2} />
            <span className="truncate">{customer.address}</span>
          </div>
        )}
      </div>

      {customer.notes && (
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
          {customer.notes}
        </p>
      )}

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => onEdit(customer)}
          aria-label={`Edit ${customer.name}`}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
        >
          <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
          Edit
        </button>
        <button
          onClick={() => onDelete(customer)}
          aria-label={`Delete ${customer.name}`}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
        >
          <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
          Delete
        </button>
      </div>
    </div>
  );
}

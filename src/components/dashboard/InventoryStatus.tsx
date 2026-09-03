import { Package, AlertTriangle, PackageX, Boxes } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';

function InventoryStatus() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">
        Inventory Status
      </h2>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Boxes className="w-3.5 h-3.5 text-gray-500" strokeWidth={2} />
            <span className="text-xs text-gray-500">Total Items</span>
          </div>
          <p className="text-lg font-bold text-gray-900">—</p>
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <AlertTriangle
              className="w-3.5 h-3.5 text-amber-600"
              strokeWidth={2}
            />
            <span className="text-xs text-gray-500">Low Stock</span>
          </div>
          <p className="text-lg font-bold text-gray-900">—</p>
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <PackageX className="w-3.5 h-3.5 text-red-600" strokeWidth={2} />
            <span className="text-xs text-gray-500">Out of Stock</span>
          </div>
          <p className="text-lg font-bold text-gray-900">—</p>
        </div>
      </div>
      <div className="border-t border-gray-100 pt-4">
        <EmptyState
          icon={Package}
          title="No inventory data yet"
          description="Your inventory status and stock alerts will appear here once you add products."
        />
      </div>
    </div>
  );
}

export default InventoryStatus;

import { BaseEntity, EntityId, Money } from '@/types/common/base';
import { StockStatus } from '@/types/common/enums';

/**
 * A product or stock-keeping unit tracked by a business.
 */
export interface InventoryItem extends BaseEntity {
  businessId: EntityId;
  name: string;
  /** Optional SKU or internal code. */
  sku?: string;
  quantity: number;
  /** Unit of measure, e.g. "pcs", "kg", "litre". */
  unit: string;
  /** Cost price in minor units. */
  costPrice: Money;
  /** Selling price in minor units. */
  salePrice: Money;
  /** Threshold below which the item is considered low stock. */
  reorderThreshold?: number;
  /** Derived stock status — stored for query convenience. */
  stockStatus: StockStatus;
}

import { BaseEntity, EntityId, Money } from '@/types/common/base';

/**
 * A single line item within a purchase.
 */
export interface PurchaseItem {
  inventoryItemId: EntityId;
  name: string;
  quantity: number;
  unitCost: Money;
  lineTotal: Money;
}

/**
 * A purchase transaction for a business.
 * Purchases increase stock and stay distinct from business expenses.
 */
export interface Purchase extends BaseEntity {
  businessId: EntityId;
  /** ISO-8601 date the purchase occurred. */
  date: string;
  items: PurchaseItem[];
  totalAmount: Money;
  supplierName?: string;
  notes?: string;
}

import { BaseEntity, EntityId, Money } from '@/types/common/base';
import { PaymentStatus } from '@/types/common/enums';

/**
 * A single line item within a sale.
 */
export interface SaleItem {
  inventoryItemId: EntityId;
  name: string;
  quantity: number;
  unitPrice: Money;
  lineTotal: Money;
}

/**
 * A sales transaction for a business.
 * May optionally reference a customer.
 */
export interface Sale extends BaseEntity {
  businessId: EntityId;
  customerId?: EntityId;
  /** ISO-8601 date the sale occurred. */
  date: string;
  items: SaleItem[];
  totalAmount: Money;
  paymentStatus: PaymentStatus;
  notes?: string;
}

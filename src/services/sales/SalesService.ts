import type { SaleRepository } from '@/types/repositories/saleRepository';
import type { Sale, SaleItem } from '@/types/domain/sale';
import type { EntityId, Money } from '@/types/common/base';
import { requireNonEmptyString, validateMoney, validateQuantity, trimToNull } from '@/services/common';

export class SalesService {
  constructor(private readonly repository: SaleRepository) {}

  async getSaleById(id: EntityId): Promise<Sale | null> {
    return this.repository.getById(id);
  }

  async getAllSales(): Promise<Sale[]> {
    return this.repository.getAll();
  }

  async getSalesByBusinessId(businessId: EntityId): Promise<Sale[]> {
    return this.repository.getByBusinessId(businessId);
  }

  async createSale(input: {
    businessId: EntityId;
    customerId?: EntityId;
    date: string;
    items: SaleItem[];
    totalAmount: Money;
    paymentStatus: Sale['paymentStatus'];
    notes?: string;
  }): Promise<Sale> {
    requireNonEmptyString(input.businessId, 'businessId');
    const date = requireNonEmptyString(input.date, 'date');
    if (!Array.isArray(input.items)) {
      throw new Error('items must be an array');
    }
    for (const item of input.items) {
      requireNonEmptyString(item.inventoryItemId, 'items[].inventoryItemId');
      requireNonEmptyString(item.name, 'items[].name');
      validateQuantity(item.quantity, 'items[].quantity');
      validateMoney(item.unitPrice, 'items[].unitPrice');
      validateMoney(item.lineTotal, 'items[].lineTotal');
    }
    validateMoney(input.totalAmount, 'totalAmount');
    const notes = trimToNull(input.notes) ?? undefined;

    return this.repository.create({ ...input, date, notes });
  }

  async updateSale(id: EntityId, changes: Partial<Sale>): Promise<Sale> {
    if (changes.date !== undefined) {
      requireNonEmptyString(changes.date, 'date');
    }
    if (changes.items !== undefined) {
      for (const item of changes.items) {
        requireNonEmptyString(item.inventoryItemId, 'items[].inventoryItemId');
        requireNonEmptyString(item.name, 'items[].name');
        validateQuantity(item.quantity, 'items[].quantity');
        validateMoney(item.unitPrice, 'items[].unitPrice');
        validateMoney(item.lineTotal, 'items[].lineTotal');
      }
    }
    if (changes.totalAmount !== undefined) {
      validateMoney(changes.totalAmount, 'totalAmount');
    }
    return this.repository.update(id, changes);
  }

  async deleteSale(id: EntityId): Promise<void> {
    return this.repository.remove(id);
  }
}

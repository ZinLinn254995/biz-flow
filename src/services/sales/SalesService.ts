import type { SaleRepository } from '@/types/repositories/saleRepository';
import type { InventoryRepository } from '@/types/repositories/inventoryRepository';
import type { Sale, SaleItem } from '@/types/domain/sale';
import type { InventoryItem } from '@/types/domain/inventory';
import type { EntityId, Money } from '@/types/common/base';
import { requireNonEmptyString, validateMoney, validateQuantity, trimToNull, ValidationError } from '@/services/common';
import { directTransactionRunner, type TransactionRunner } from '@/services/common/transaction';
import type { StockMutationService } from '@/services/inventory/StockMutationService';

/**
 * Verifies that every line total shares one currency and that their sum
 * equals the declared sale total. Money stays in integer minor units.
 */
function validateSaleTotal(items: SaleItem[], totalAmount: Money): void {
  if (items.length === 0) {
    if (totalAmount.amountMinor !== 0) {
      throw new ValidationError('totalAmount must be 0 when a sale has no items');
    }
    return;
  }
  const currency = items[0].lineTotal.currency;
  let sum = 0;
  for (const item of items) {
    if (item.lineTotal.currency !== currency) {
      throw new ValidationError('All sale items must use the same currency');
    }
    sum += item.lineTotal.amountMinor;
  }
  if (totalAmount.currency !== currency) {
    throw new ValidationError(
      `totalAmount currency ${totalAmount.currency} does not match item currency ${currency}`,
    );
  }
  if (totalAmount.amountMinor !== sum) {
    throw new ValidationError(
      `totalAmount ${totalAmount.amountMinor} does not match the sum of line totals ${sum}`,
    );
  }
}


export class SalesService {
  constructor(
    private readonly repository: SaleRepository,
    private readonly inventoryRepository?: InventoryRepository,
    private readonly transactionRunner: TransactionRunner = directTransactionRunner,
    private readonly stockMutationService?: StockMutationService,
  ) {}

  /**
   * Runs stock movements and sale persistence as one atomic unit. With the
   * Dexie-backed runner injected, a mid-operation failure rolls everything
   * back; the inline compensation below remains as a safety net for the
   * non-transactional fallback.
   */
  private runAtomic<T>(work: () => Promise<T>): Promise<T> {
    return this.transactionRunner.run(work);
  }

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
    validateSaleTotal(input.items, input.totalAmount);

    const notes = trimToNull(input.notes) ?? undefined;

    return this.runAtomic(async () => {
      const items = await Promise.all(input.items.map(async (item) => {
        if (item.costAtSale || !this.inventoryRepository) return item;
        const inventoryItem = await this.inventoryRepository.getById(item.inventoryItemId);
        return inventoryItem
          ? { ...item, costAtSale: { kind: 'known' as const, value: inventoryItem.costPrice, provenance: 'inventory-item-cost' } }
          : { ...item, costAtSale: { kind: 'unknown' as const, reason: 'inventory-item-not-found' } };
      }));
      const saleInput = { ...input, items };
      if (!this.inventoryRepository) return this.repository.create({ ...saleInput, date, notes });
      if (!this.stockMutationService) throw new Error('StockMutationService is required for sale operations');
      await this.stockMutationService.apply(
        items.map((item) => ({ inventoryItemId: item.inventoryItemId, delta: -item.quantity })),
        `sale-${Date.now()}` as EntityId,
        'sale',
      );
      return this.repository.create({ ...saleInput, date, notes });
    });
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

    // Cross-check items against the declared total before any stock movement.
    if (changes.items !== undefined && changes.totalAmount !== undefined) {
      validateSaleTotal(changes.items, changes.totalAmount);
    } else if (changes.items !== undefined || changes.totalAmount !== undefined) {
      const persisted = await this.repository.getById(id);
      if (persisted) {
        validateSaleTotal(changes.items ?? persisted.items, changes.totalAmount ?? persisted.totalAmount);
      }
    }


    if (changes.items && this.inventoryRepository) {
      const oldSale = await this.repository.getById(id);
      if (!oldSale) {
        throw new Error(`Sale not found: ${id}`);
      }
      const newItems = changes.items.map((item, index) => item.costAtSale
        ? item
        : { ...item, costAtSale: oldSale.items[index]?.costAtSale });
      const normalizedChanges = changes.items
        ? { ...changes, items: newItems }
        : changes;
      return this.runAtomic(async () => {
        if (!this.stockMutationService) throw new Error('StockMutationService is required for sale operations');
      await this.stockMutationService.apply(
          oldSale.items.map((item) => ({ inventoryItemId: item.inventoryItemId, delta: item.quantity })),
          `sale-reversal-${id}-${Date.now()}` as EntityId,
          'reversal',
          id,
        );
        await this.stockMutationService.apply(
          newItems.map((item) => ({ inventoryItemId: item.inventoryItemId, delta: -item.quantity })),
          `sale-update-${id}-${Date.now()}` as EntityId,
          'sale',
          id,
        );
        return this.repository.update(id, normalizedChanges);
      });
    }

    return this.repository.update(id, changes);
  }

  async deleteSale(id: EntityId): Promise<void> {
    if (!this.inventoryRepository) return this.repository.remove(id);
    const sale = await this.repository.getById(id);
    if (!sale) return this.repository.remove(id);
    await this.runAtomic(async () => {
      if (!this.stockMutationService) throw new Error('StockMutationService is required for sale operations');
      await this.stockMutationService.apply(
        sale.items.map((item) => ({ inventoryItemId: item.inventoryItemId, delta: sale.items.length ? item.quantity : 0 })),
        `sale-delete-${id}-${Date.now()}` as EntityId,
        'reversal',
        id,
      );
      await this.repository.remove(id);
    });
  }

}

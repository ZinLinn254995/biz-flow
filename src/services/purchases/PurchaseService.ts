import type { PurchaseRepository } from '@/types/repositories/purchaseRepository';
import type { InventoryRepository } from '@/types/repositories/inventoryRepository';
import type { Purchase, PurchaseItem } from '@/types/domain/purchase';
import type { EntityId, Money } from '@/types/common/base';
import { requireNonEmptyString, validateMoney, validateQuantity, trimToNull, ValidationError } from '@/services/common';
import { directTransactionRunner, type TransactionRunner } from '@/services/common/transaction';
import type { StockMutationService } from '@/services/inventory/StockMutationService';

function validatePurchaseTotal(items: PurchaseItem[], totalAmount: Money): void {
  if (items.length === 0) {
    if (totalAmount.amountMinor !== 0) {
      throw new ValidationError('totalAmount must be 0 when a purchase has no items');
    }
    return;
  }

  const currency = items[0].lineTotal.currency;
  let sum = 0;
  for (const item of items) {
    if (item.lineTotal.currency !== currency) {
      throw new ValidationError('All purchase items must use the same currency');
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

export class PurchaseService {
  constructor(
    private readonly repository: PurchaseRepository,
    private readonly inventoryRepository?: InventoryRepository,
    private readonly transactionRunner: TransactionRunner = directTransactionRunner,
    private readonly stockMutationService?: StockMutationService,
  ) {}

  private runAtomic<T>(work: () => Promise<T>): Promise<T> {
    return this.transactionRunner.run(work);
  }

  async getPurchaseById(id: EntityId): Promise<Purchase | null> {
    return this.repository.getById(id);
  }

  async getAllPurchases(): Promise<Purchase[]> {
    return this.repository.getAll();
  }

  async getPurchasesByBusinessId(businessId: EntityId): Promise<Purchase[]> {
    return this.repository.getByBusinessId(businessId);
  }

  async createPurchase(input: {
    businessId: EntityId;
    date: string;
    items: PurchaseItem[];
    totalAmount: Money;
    supplierName?: string;
    notes?: string;
  }): Promise<Purchase> {
    requireNonEmptyString(input.businessId, 'businessId');
    const date = requireNonEmptyString(input.date, 'date');
    if (!Array.isArray(input.items)) {
      throw new Error('items must be an array');
    }

    for (const item of input.items) {
      requireNonEmptyString(item.inventoryItemId, 'items[].inventoryItemId');
      requireNonEmptyString(item.name, 'items[].name');
      validateQuantity(item.quantity, 'items[].quantity');
      validateMoney(item.unitCost, 'items[].unitCost');
      validateMoney(item.lineTotal, 'items[].lineTotal');
    }

    validateMoney(input.totalAmount, 'totalAmount');
    validatePurchaseTotal(input.items, input.totalAmount);

    const supplierName = trimToNull(input.supplierName) ?? undefined;
    const notes = trimToNull(input.notes) ?? undefined;

    return this.runAtomic(async () => {
      if (!this.inventoryRepository) return this.repository.create({ ...input, date, supplierName, notes });
      if (!this.stockMutationService) throw new Error('StockMutationService is required for purchase operations');
      await this.stockMutationService.apply(
        input.items.map((item) => ({ inventoryItemId: item.inventoryItemId, delta: item.quantity })),
        `purchase-${Date.now()}` as EntityId,
        'purchase',
      );
      return this.repository.create({ ...input, date, supplierName, notes });
    });
  }

  async updatePurchase(id: EntityId, changes: Partial<Purchase>): Promise<Purchase> {
    if (changes.date !== undefined) {
      requireNonEmptyString(changes.date, 'date');
    }

    if (changes.items !== undefined) {
      for (const item of changes.items) {
        requireNonEmptyString(item.inventoryItemId, 'items[].inventoryItemId');
        requireNonEmptyString(item.name, 'items[].name');
        validateQuantity(item.quantity, 'items[].quantity');
        validateMoney(item.unitCost, 'items[].unitCost');
        validateMoney(item.lineTotal, 'items[].lineTotal');
      }
    }

    if (changes.totalAmount !== undefined) {
      validateMoney(changes.totalAmount, 'totalAmount');
    }

    const normalizedChanges = changes.supplierName !== undefined
      ? { ...changes, supplierName: trimToNull(changes.supplierName) ?? undefined }
      : changes;

    if (changes.items !== undefined && changes.totalAmount !== undefined) {
      validatePurchaseTotal(changes.items, changes.totalAmount);
    } else if (changes.items !== undefined || changes.totalAmount !== undefined) {
      const persisted = await this.repository.getById(id);
      if (persisted) {
        validatePurchaseTotal(changes.items ?? persisted.items, changes.totalAmount ?? persisted.totalAmount);
      }
    }

    if (changes.items && this.inventoryRepository) {
      const oldPurchase = await this.repository.getById(id);
      if (!oldPurchase) {
        throw new Error(`Purchase not found: ${id}`);
      }

      const newItems = changes.items;
      return this.runAtomic(async () => {
        if (!this.stockMutationService) throw new Error('StockMutationService is required for purchase operations');
      await this.stockMutationService.apply(
          oldPurchase.items.map((item) => ({ inventoryItemId: item.inventoryItemId, delta: -item.quantity })),
          `purchase-reversal-${id}-${Date.now()}` as EntityId,
          'reversal',
          id,
        );
        await this.stockMutationService.apply(
          newItems.map((item) => ({ inventoryItemId: item.inventoryItemId, delta: item.quantity })),
          `purchase-update-${id}-${Date.now()}` as EntityId,
          'purchase',
          id,
        );
        return this.repository.update(id, normalizedChanges);
      });
    }

    return this.repository.update(id, normalizedChanges);
  }

  async deletePurchase(id: EntityId): Promise<void> {
    if (!this.inventoryRepository) return this.repository.remove(id);

    const purchase = await this.repository.getById(id);
    if (!purchase) return this.repository.remove(id);

    await this.runAtomic(async () => {
      if (!this.stockMutationService) throw new Error('StockMutationService is required for purchase operations');
      await this.stockMutationService.apply(
        purchase.items.map((item) => ({ inventoryItemId: item.inventoryItemId, delta: -item.quantity })),
        `purchase-delete-${id}-${Date.now()}` as EntityId,
        'reversal',
        id,
      );
      await this.repository.remove(id);
    });
  }

}

import type { PurchaseRepository } from '@/types/repositories/purchaseRepository';
import type { InventoryRepository } from '@/types/repositories/inventoryRepository';
import type { Purchase, PurchaseItem } from '@/types/domain/purchase';
import type { InventoryItem } from '@/types/domain/inventory';
import type { EntityId, Money } from '@/types/common/base';
import type { StockStatus } from '@/types/common/enums';
import { requireNonEmptyString, validateMoney, validateQuantity, trimToNull, ValidationError } from '@/services/common';
import { directTransactionRunner, type TransactionRunner } from '@/services/common/transaction';

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

function computeStockStatus(quantity: number, reorderThreshold?: number): StockStatus {
  if (quantity <= 0) return 'out_of_stock';
  if (reorderThreshold !== undefined && quantity <= reorderThreshold) return 'low_stock';
  return 'in_stock';
}

export class PurchaseService {
  constructor(
    private readonly repository: PurchaseRepository,
    private readonly inventoryRepository?: InventoryRepository,
    private readonly transactionRunner: TransactionRunner = directTransactionRunner,
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

    const notes = trimToNull(input.notes) ?? undefined;

    return this.runAtomic(async () => {
      await this.increaseStock(input.items);
      try {
        return await this.repository.create({ ...input, date, notes });
      } catch (error) {
        await this.reverseStock(input.items);
        throw error;
      }
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
        await this.reverseStock(oldPurchase.items);
        try {
          await this.increaseStock(newItems);
        } catch (error) {
          await this.increaseStock(oldPurchase.items);
          throw error;
        }

        try {
          return await this.repository.update(id, changes);
        } catch (error) {
          await this.reverseStock(newItems);
          await this.increaseStock(oldPurchase.items);
          throw error;
        }
      });
    }

    return this.repository.update(id, changes);
  }

  async deletePurchase(id: EntityId): Promise<void> {
    if (!this.inventoryRepository) return this.repository.remove(id);

    const purchase = await this.repository.getById(id);
    if (!purchase) return this.repository.remove(id);

    await this.runAtomic(async () => {
      await this.reverseStock(purchase.items);
      try {
        await this.repository.remove(id);
      } catch (error) {
        await this.increaseStock(purchase.items);
        throw error;
      }
    });
  }

  private async increaseStock(items: PurchaseItem[]): Promise<void> {
    if (!this.inventoryRepository) return;

    const quantities = new Map<EntityId, number>();
    for (const item of items) {
      quantities.set(
        item.inventoryItemId,
        (quantities.get(item.inventoryItemId) ?? 0) + item.quantity,
      );
    }

    const applied: PurchaseItem[] = [];
    try {
      for (const [itemId, qtyToAdd] of quantities) {
        const invItem = await this.inventoryRepository.getById(itemId);
        if (!invItem) {
          throw new Error(`Inventory item not found: ${itemId}`);
        }

        const newQty = invItem.quantity + qtyToAdd;
        await this.inventoryRepository.update(itemId, {
          quantity: newQty,
          stockStatus: computeStockStatus(newQty, invItem.reorderThreshold),
        });
        applied.push({
          inventoryItemId: itemId,
          name: invItem.name,
          quantity: qtyToAdd,
          unitCost: invItem.costPrice,
          lineTotal: { amountMinor: 0, currency: invItem.costPrice.currency },
        });
      }
    } catch (error) {
      await this.reverseStock(applied);
      throw error;
    }
  }

  private async reverseStock(items: PurchaseItem[]): Promise<void> {
    if (!this.inventoryRepository) return;

    const quantities = new Map<EntityId, number>();
    for (const item of items) {
      quantities.set(
        item.inventoryItemId,
        (quantities.get(item.inventoryItemId) ?? 0) + item.quantity,
      );
    }

    for (const [itemId, qtyToRemove] of quantities) {
      const invItem = await this.inventoryRepository.getById(itemId);
      if (invItem) {
        const newQty = invItem.quantity - qtyToRemove;
        await this.inventoryRepository.update(itemId, {
          quantity: newQty,
          stockStatus: computeStockStatus(newQty, invItem.reorderThreshold),
        });
      }
    }
  }
}

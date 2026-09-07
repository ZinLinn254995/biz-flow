import type { SaleRepository } from '@/types/repositories/saleRepository';
import type { InventoryRepository } from '@/types/repositories/inventoryRepository';
import type { Sale, SaleItem } from '@/types/domain/sale';
import type { InventoryItem } from '@/types/domain/inventory';
import type { EntityId, Money } from '@/types/common/base';
import type { StockStatus } from '@/types/common/enums';
import { requireNonEmptyString, validateMoney, validateQuantity, trimToNull, ValidationError } from '@/services/common';
import { directTransactionRunner, type TransactionRunner } from '@/services/common/transaction';

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


function computeStockStatus(quantity: number, reorderThreshold?: number): StockStatus {
  if (quantity <= 0) return 'out_of_stock';
  if (reorderThreshold !== undefined && quantity <= reorderThreshold) return 'low_stock';
  return 'in_stock';
}

export class SalesService {
  constructor(
    private readonly repository: SaleRepository,
    private readonly inventoryRepository?: InventoryRepository,
    private readonly transactionRunner: TransactionRunner = directTransactionRunner,
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
      await this.deductStock(input.items);
      try {
        return await this.repository.create({ ...input, date, notes });
      } catch (err) {
        await this.restoreStock(input.items);
        throw err;
      }
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
      const newItems = changes.items;
      return this.runAtomic(async () => {
        await this.restoreStock(oldSale.items);
        try {
          await this.deductStock(newItems);
        } catch (error) {
          await this.deductStock(oldSale.items);
          throw error;
        }
        try {
          return await this.repository.update(id, changes);
        } catch (error) {
          await this.restoreStock(newItems);
          await this.deductStock(oldSale.items);
          throw error;
        }
      });
    }

    return this.repository.update(id, changes);
  }

  async deleteSale(id: EntityId): Promise<void> {
    if (!this.inventoryRepository) return this.repository.remove(id);
    const sale = await this.repository.getById(id);
    if (!sale) return this.repository.remove(id);
    await this.runAtomic(async () => {
      await this.restoreStock(sale.items);
      try {
        await this.repository.remove(id);
      } catch (error) {
        await this.deductStock(sale.items);
        throw error;
      }
    });
  }

  private async deductStock(items: SaleItem[]): Promise<void> {
    if (!this.inventoryRepository) return;

    const quantities = new Map<EntityId, number>();
    for (const item of items) {
      quantities.set(
        item.inventoryItemId,
        (quantities.get(item.inventoryItemId) ?? 0) + item.quantity,
      );
    }

    const applied: SaleItem[] = [];
    try {
      for (const [itemId, qtyToDeduct] of quantities) {
        const invItem = await this.inventoryRepository.getById(itemId);
        if (!invItem) {
          throw new Error(`Inventory item not found: ${itemId}`);
        }
        if (invItem.quantity < qtyToDeduct) {
          throw new Error(
            `Insufficient stock for "${invItem.name}": available ${invItem.quantity}, requested ${qtyToDeduct}`,
          );
        }
        const newQty = invItem.quantity - qtyToDeduct;
        await this.inventoryRepository.update(itemId, {
          quantity: newQty,
          stockStatus: computeStockStatus(newQty, invItem.reorderThreshold),
        });
        applied.push({
          inventoryItemId: itemId,
          name: invItem.name,
          quantity: qtyToDeduct,
          unitPrice: invItem.salePrice,
          lineTotal: { amountMinor: 0, currency: invItem.salePrice.currency },
        });
      }
    } catch (error) {
      await this.restoreStock(applied);
      throw error;
    }
  }

  private async restoreStock(items: SaleItem[]): Promise<void> {
    if (!this.inventoryRepository) return;

    const quantities = new Map<EntityId, number>();
    for (const item of items) {
      quantities.set(
        item.inventoryItemId,
        (quantities.get(item.inventoryItemId) ?? 0) + item.quantity,
      );
    }

    for (const [itemId, qtyToRestore] of quantities) {
      const invItem = await this.inventoryRepository.getById(itemId);
      if (invItem) {
        const newQty = invItem.quantity + qtyToRestore;
        await this.inventoryRepository.update(itemId, {
          quantity: newQty,
          stockStatus: computeStockStatus(newQty, invItem.reorderThreshold),
        });
      }
    }
  }
}

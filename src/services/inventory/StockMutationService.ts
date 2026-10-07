import type { EntityId } from '@/types/common/base';
import type { InventoryRepository } from '@/types/repositories/inventoryRepository';
import type { StockMovementRepository } from '@/types/repositories/stockMovementRepository';
import type { StockMutation, StockMovementKind } from '@/types/domain/stockMovement';
import type { TransactionRunner } from '@/services/common/transaction';
import { validateQuantity, ValidationError } from '@/services/common';

function status(quantity: number, threshold?: number) {
  if (quantity <= 0) return 'out_of_stock' as const;
  if (threshold !== undefined && quantity <= threshold) return 'low_stock' as const;
  return 'in_stock' as const;
}

export class StockMutationService {
  constructor(
    private readonly inventory: InventoryRepository,
    private readonly movements: StockMovementRepository,
    private readonly transaction: TransactionRunner,
  ) {}

  async apply(mutations: StockMutation[], operationId: EntityId, kind: StockMovementKind, sourceId?: EntityId): Promise<void> {
    if (mutations.length === 0) return;
    const aggregated = new Map<EntityId, number>();
    for (const mutation of mutations) {
      validateQuantity(Math.abs(mutation.delta), 'stock delta');
      if (!Number.isInteger(mutation.delta)) throw new ValidationError('stock delta must be an integer');
      aggregated.set(mutation.inventoryItemId, (aggregated.get(mutation.inventoryItemId) ?? 0) + mutation.delta);
    }
    const current = new Map<EntityId, { quantity: number; threshold?: number }>();
    for (const [id, delta] of aggregated) {
      const item = await this.inventory.getById(id);
      if (!item) throw new Error(`Inventory item not found: ${id}`);
      const next = item.quantity + delta;
      if (next < 0) throw new ValidationError(`Stock cannot become negative for "${item.name}"`);
      current.set(id, { quantity: next, threshold: item.reorderThreshold });
    }
    await this.transaction.run(async () => {
      for (const [id, delta] of aggregated) {
        const next = current.get(id)!;
        await this.inventory.update(id, { quantity: next.quantity, stockStatus: status(next.quantity, next.threshold) });
        await this.movements.create({ inventoryItemId: id, delta, kind, operationId, sourceId, provenance: 'application' });
      }
    });
  }
}

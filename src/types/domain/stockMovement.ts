import type { BaseEntity, EntityId } from '@/types/common/base';

export type StockMovementKind = 'opening' | 'purchase' | 'sale' | 'adjustment' | 'reversal';

export interface StockMovement extends BaseEntity {
  inventoryItemId: EntityId;
  delta: number;
  kind: StockMovementKind;
  operationId: EntityId;
  sourceId?: EntityId;
  reversalOfMovementId?: EntityId;
  provenance?: string;
}

export interface StockMutation {
  inventoryItemId: EntityId;
  delta: number;
}

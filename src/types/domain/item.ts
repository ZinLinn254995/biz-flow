import { BaseEntity, EntityId } from '@/types/common/base';

/** Generic identity for item-like concepts planned for later milestones. */
export interface GenericItem extends BaseEntity {
  name: string;
  categoryId?: EntityId;
  kind: 'inventory';
}

export type GenericItemKind = GenericItem['kind'];

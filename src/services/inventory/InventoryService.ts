import type { InventoryRepository } from '@/types/repositories/inventoryRepository';
import type { InventoryItem } from '@/types/domain/inventory';
import type { EntityId } from '@/types/common/base';
import { requireNonEmptyString, validateMoney, validateQuantity, trimToNull } from '@/services/common';

export class InventoryService {
  constructor(private readonly repository: InventoryRepository) {}

  async getInventoryItemById(id: EntityId): Promise<InventoryItem | null> {
    return this.repository.getById(id);
  }

  async getAllInventoryItems(): Promise<InventoryItem[]> {
    return this.repository.getAll();
  }

  async getInventoryItemsByBusinessId(businessId: EntityId): Promise<InventoryItem[]> {
    return this.repository.getByBusinessId(businessId);
  }

  async createInventoryItem(input: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem> {
    requireNonEmptyString(input.businessId, 'businessId');
    const name = requireNonEmptyString(input.name, 'name');
    const unit = requireNonEmptyString(input.unit, 'unit');
    validateQuantity(input.quantity, 'quantity');
    validateMoney(input.costPrice, 'costPrice');
    validateMoney(input.salePrice, 'salePrice');
    const sku = trimToNull(input.sku) ?? undefined;

    return this.repository.create({ ...input, name, unit, sku });
  }

  async updateInventoryItem(id: EntityId, changes: Partial<InventoryItem>): Promise<InventoryItem> {
    if (changes.name !== undefined) {
      requireNonEmptyString(changes.name, 'name');
    }
    if (changes.unit !== undefined) {
      requireNonEmptyString(changes.unit, 'unit');
    }
    if (changes.quantity !== undefined) {
      validateQuantity(changes.quantity, 'quantity');
    }
    if (changes.costPrice !== undefined) {
      validateMoney(changes.costPrice, 'costPrice');
    }
    if (changes.salePrice !== undefined) {
      validateMoney(changes.salePrice, 'salePrice');
    }
    return this.repository.update(id, changes);
  }

  async deleteInventoryItem(id: EntityId): Promise<void> {
    return this.repository.remove(id);
  }
}

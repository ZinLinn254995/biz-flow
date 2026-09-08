import type { BusinessRepository } from '@/types/repositories/businessRepository';
import type { Business } from '@/types/domain/business';
import type { EntityId } from '@/types/common/base';
import { requireNonEmptyString, trimToNull } from '@/services/common';

export class BusinessService {
  constructor(private readonly repository: BusinessRepository) {}

  async getBusinessById(id: EntityId): Promise<Business | null> {
    return this.repository.getById(id);
  }

  async getAllBusinesses(): Promise<Business[]> {
    return this.repository.getAll();
  }

  async createBusiness(input: {
    name: string;
    description?: string;
    currency: string;
  }): Promise<Business> {
    const name = requireNonEmptyString(input.name, 'name');
    const currency = requireNonEmptyString(input.currency, 'currency');
    const description = trimToNull(input.description) ?? undefined;

    return this.repository.create({ name, description, currency });
  }

  async updateBusiness(id: EntityId, changes: Partial<Business>): Promise<Business> {
    if (changes.name !== undefined) {
      requireNonEmptyString(changes.name, 'name');
    }
    if (changes.currency !== undefined) {
      requireNonEmptyString(changes.currency, 'currency');
    }
    if (changes.description !== undefined) {
      changes.description = trimToNull(changes.description) ?? undefined;
    }
    return this.repository.update(id, changes);
  }

  async deleteBusiness(id: EntityId): Promise<void> {
    return this.repository.removeCascade(id);
  }
}

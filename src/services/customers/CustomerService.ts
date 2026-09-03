import type { CustomerRepository } from '@/types/repositories/customerRepository';
import type { Customer } from '@/types/domain/customer';
import type { EntityId } from '@/types/common/base';
import { requireNonEmptyString, trimToNull } from '@/services/common';

export class CustomerService {
  constructor(private readonly repository: CustomerRepository) {}

  async getCustomerById(id: EntityId): Promise<Customer | null> {
    return this.repository.getById(id);
  }

  async getAllCustomers(): Promise<Customer[]> {
    return this.repository.getAll();
  }

  async getCustomersByBusinessId(businessId: EntityId): Promise<Customer[]> {
    return this.repository.getByBusinessId(businessId);
  }

  async createCustomer(input: {
    businessId: EntityId;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    notes?: string;
  }): Promise<Customer> {
    requireNonEmptyString(input.businessId, 'businessId');
    const name = requireNonEmptyString(input.name, 'name');
    const email = trimToNull(input.email) ?? undefined;
    const phone = trimToNull(input.phone) ?? undefined;
    const address = trimToNull(input.address) ?? undefined;
    const notes = trimToNull(input.notes) ?? undefined;

    return this.repository.create({ ...input, name, email, phone, address, notes });
  }

  async updateCustomer(id: EntityId, changes: Partial<Customer>): Promise<Customer> {
    if (changes.name !== undefined) {
      requireNonEmptyString(changes.name, 'name');
    }
    if (changes.email !== undefined) {
      changes.email = trimToNull(changes.email) ?? undefined;
    }
    if (changes.phone !== undefined) {
      changes.phone = trimToNull(changes.phone) ?? undefined;
    }
    if (changes.address !== undefined) {
      changes.address = trimToNull(changes.address) ?? undefined;
    }
    if (changes.notes !== undefined) {
      changes.notes = trimToNull(changes.notes) ?? undefined;
    }
    return this.repository.update(id, changes);
  }

  async deleteCustomer(id: EntityId): Promise<void> {
    return this.repository.remove(id);
  }
}

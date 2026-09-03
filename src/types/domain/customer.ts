import { BaseEntity, EntityId } from '@/types/common/base';

/**
 * A customer associated with a business.
 */
export interface Customer extends BaseEntity {
  businessId: EntityId;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

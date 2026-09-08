import { Repository } from '@/types/repositories/repository';
import { Business } from '@/types/domain/business';
import { EntityId } from '@/types/common/base';

export interface BusinessRepository extends Repository<Business> {
  removeCascade(id: EntityId): Promise<void>;
}

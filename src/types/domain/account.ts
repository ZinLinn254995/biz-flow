import { BaseEntity, Money } from '@/types/common/base';
import { AccountType } from '@/types/common/enums';

/**
 * A liquid asset account (cash, bank, wallet) for tracking money flow.
 */
export interface Account extends BaseEntity {
  name: string;
  type: AccountType;
  /** Current balance in minor units. */
  balance: Money;
  /** Institution or provider name, if applicable. */
  institution?: string;
}

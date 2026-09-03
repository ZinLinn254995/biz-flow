import { ValidationError } from './errors';

/**
 * Trims a string and returns null if the result is empty.
 */
export function trimToNull(value: string | undefined | null): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Requires a non-empty trimmed string, throwing ValidationError otherwise.
 */
export function requireNonEmptyString(value: string | undefined | null, field: string): string {
  const trimmed = (value ?? '').trim();
  if (trimmed.length === 0) {
    throw new ValidationError(`${field} must not be empty`);
  }
  return trimmed;
}

/**
 * Validates that a Money object has a non-negative integer amountMinor
 * and a non-empty currency code.
 */
export function validateMoney(amount: { amountMinor: number; currency: string }, field: string): void {
  if (!Number.isInteger(amount.amountMinor)) {
    throw new ValidationError(`${field}.amountMinor must be an integer`);
  }
  if (amount.amountMinor < 0) {
    throw new ValidationError(`${field}.amountMinor must not be negative`);
  }
  if (!amount.currency || amount.currency.trim().length === 0) {
    throw new ValidationError(`${field}.currency must not be empty`);
  }
}

/**
 * Validates that a quantity is a non-negative integer.
 */
export function validateQuantity(value: number, field: string): void {
  if (!Number.isInteger(value)) {
    throw new ValidationError(`${field} must be an integer`);
  }
  if (value < 0) {
    throw new ValidationError(`${field} must not be negative`);
  }
}

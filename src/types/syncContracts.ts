import type { EntityId, ISODateString } from '@/types/common/base';

export const SYNC_CONTRACT_VERSION = 1 as const;

export type SyncClassification = 'SYNCHRONIZED' | 'LOCAL_ONLY' | 'DEFERRED';
export type OwnershipKind = 'ANONYMOUS_LOCAL' | 'ACCOUNT';
export type SynchronizationState = 'LOCAL_ONLY' | 'PENDING' | 'SYNCING' | 'SYNCHRONIZED' | 'FAILED' | 'CONFLICT';
export type MigrationState = 'NOT_STARTED' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'REQUIRES_REVIEW';
export type TombstoneState = 'ACTIVE' | 'DELETED';

export interface SyncMetadata {
  contractVersion: typeof SYNC_CONTRACT_VERSION;
  ownership: OwnershipKind;
  accountId?: EntityId;
  revision: number;
  lastKnownRevision: number;
  synchronization: SynchronizationState;
  tombstone: TombstoneState;
  schemaVersion: number;
  migration: MigrationState;
  updatedAt: ISODateString;
}

export interface SyncEntityClassification {
  entity: string;
  classification: SyncClassification;
  rationale: string;
}

export const SYNC_ENTITY_CLASSIFICATIONS: readonly SyncEntityClassification[] = [
  { entity: 'Business', classification: 'SYNCHRONIZED', rationale: 'Business ownership anchors business-scoped records.' },
  { entity: 'InventoryItem', classification: 'SYNCHRONIZED', rationale: 'Inventory is business data whose changes must remain consistent across devices.' },
  { entity: 'Sale', classification: 'SYNCHRONIZED', rationale: 'Sales are durable financial records and reference inventory and customers.' },
  { entity: 'SaleItem', classification: 'SYNCHRONIZED', rationale: 'Sale line data is part of the sale aggregate and must travel with it.' },
  { entity: 'Customer', classification: 'SYNCHRONIZED', rationale: 'Customers are business-scoped records referenced by sales.' },
  { entity: 'BusinessExpense', classification: 'SYNCHRONIZED', rationale: 'Business expenses are durable financial records.' },
  { entity: 'PersonalIncome', classification: 'SYNCHRONIZED', rationale: 'Personal income is durable user finance data.' },
  { entity: 'PersonalExpense', classification: 'SYNCHRONIZED', rationale: 'Personal expenses are durable user finance data.' },
  { entity: 'Category', classification: 'SYNCHRONIZED', rationale: 'Categories are referenced by financial records and must preserve scope.' },
  { entity: 'Budget', classification: 'SYNCHRONIZED', rationale: 'Budgets are durable personal finance planning records.' },
  { entity: 'Account', classification: 'SYNCHRONIZED', rationale: 'Accounts contain durable financial state represented in minor units.' },
] as const;

export const SYNC_CLASSIFICATIONS: readonly SyncClassification[] = ['SYNCHRONIZED', 'LOCAL_ONLY', 'DEFERRED'];
export const SYNCHRONIZATION_STATES: readonly SynchronizationState[] = ['LOCAL_ONLY', 'PENDING', 'SYNCING', 'SYNCHRONIZED', 'FAILED', 'CONFLICT'];
export const MIGRATION_STATES: readonly MigrationState[] = ['NOT_STARTED', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'REQUIRES_REVIEW'];

export function isSyncClassification(value: string): value is SyncClassification {
  return SYNC_CLASSIFICATIONS.includes(value as SyncClassification);
}

export function isSynchronizationState(value: string): value is SynchronizationState {
  return SYNCHRONIZATION_STATES.includes(value as SynchronizationState);
}

export function isMigrationState(value: string): value is MigrationState {
  return MIGRATION_STATES.includes(value as MigrationState);
}

export function isValidRevisionPair(revision: number, lastKnownRevision: number): boolean {
  return Number.isInteger(revision) && revision >= 0 && Number.isInteger(lastKnownRevision) && lastKnownRevision >= 0 && lastKnownRevision <= revision;
}

export function isValidSyncMetadata(metadata: SyncMetadata): boolean {
  const ownershipValid = metadata.ownership === 'ACCOUNT' ? Boolean(metadata.accountId) : metadata.accountId === undefined;
  return metadata.contractVersion === SYNC_CONTRACT_VERSION
    && ownershipValid
    && isValidRevisionPair(metadata.revision, metadata.lastKnownRevision)
    && isSynchronizationState(metadata.synchronization)
    && (metadata.tombstone === 'ACTIVE' || metadata.tombstone === 'DELETED')
    && Number.isInteger(metadata.schemaVersion) && metadata.schemaVersion >= 1
    && isMigrationState(metadata.migration);
}

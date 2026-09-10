import { describe, expect, it } from 'vitest';
import {
  MIGRATION_STATES,
  SYNC_ENTITY_CLASSIFICATIONS,
  SYNCHRONIZATION_STATES,
  isMigrationState,
  isSyncClassification,
  isSynchronizationState,
  isValidRevisionPair,
  isValidSyncMetadata,
} from '@/types/syncContracts';

describe('P4.1 sync-ready contracts', () => {
  it('classifies every current domain entity without inventing entities', () => {
    expect(SYNC_ENTITY_CLASSIFICATIONS).toHaveLength(11);
    expect(new Set(SYNC_ENTITY_CLASSIFICATIONS.map(({ entity }) => entity)).size).toBe(11);
    expect(SYNC_ENTITY_CLASSIFICATIONS.every(({ classification }) => classification === 'SYNCHRONIZED')).toBe(true);
  });

  it('accepts only the defined synchronization and migration states', () => {
    expect(SYNCHRONIZATION_STATES).toEqual(['LOCAL_ONLY', 'PENDING', 'SYNCING', 'SYNCHRONIZED', 'FAILED', 'CONFLICT']);
    expect(MIGRATION_STATES).toContain('REQUIRES_REVIEW');
    expect(isSyncClassification('SYNCHRONIZED')).toBe(true);
    expect(isSyncClassification('remote')).toBe(false);
    expect(isSynchronizationState('CONFLICT')).toBe(true);
    expect(isSynchronizationState('queued')).toBe(false);
    expect(isMigrationState('IN_PROGRESS')).toBe(true);
    expect(isMigrationState('done')).toBe(false);
  });

  it('requires monotonic non-negative revision pairs', () => {
    expect(isValidRevisionPair(2, 1)).toBe(true);
    expect(isValidRevisionPair(0, 0)).toBe(true);
    expect(isValidRevisionPair(1, 2)).toBe(false);
    expect(isValidRevisionPair(-1, 0)).toBe(false);
    expect(isValidRevisionPair(1.5, 1)).toBe(false);
  });

  it('keeps ownership and metadata rules explicit', () => {
    const anonymous = {
      contractVersion: 1 as const,
      ownership: 'ANONYMOUS_LOCAL' as const,
      revision: 0,
      lastKnownRevision: 0,
      synchronization: 'LOCAL_ONLY' as const,
      tombstone: 'ACTIVE' as const,
      schemaVersion: 1,
      migration: 'NOT_STARTED' as const,
      updatedAt: '2026-09-09T00:00:00.000Z',
    };
    expect(isValidSyncMetadata(anonymous)).toBe(true);
    expect(isValidSyncMetadata({ ...anonymous, ownership: 'ACCOUNT', accountId: 'acct-1' as never })).toBe(true);
    expect(isValidSyncMetadata({ ...anonymous, ownership: 'ACCOUNT' })).toBe(false);
    expect(isValidSyncMetadata({ ...anonymous, revision: 1, lastKnownRevision: 2 })).toBe(false);
  });
});

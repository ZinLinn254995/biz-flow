import { describe, expect, it, vi } from 'vitest';
import { DataBackupService } from '@/services/dataBackup/DataBackupService';

const data = {
  businesses: [], inventoryItems: [], sales: [], customers: [], businessExpenses: [],
  personalIncomes: [], personalExpenses: [], categories: [], budgets: [], accounts: [],
};

describe('DataBackupService', () => {
  it('exports a versioned snapshot', async () => {
    const repository = { exportData: vi.fn().mockResolvedValue(data), replaceData: vi.fn() };
    const backup = await new DataBackupService(repository).exportData();
    expect(backup.version).toBe(1);
    expect(backup.data).toEqual(data);
    expect(backup.exportedAt).toEqual(expect.any(String));
  });

  it('rejects unsupported backups before writing', async () => {
    const repository = { exportData: vi.fn(), replaceData: vi.fn() };
    await expect(new DataBackupService(repository).importData({ version: 99, data })).rejects.toThrow();
    expect(repository.replaceData).not.toHaveBeenCalled();
  });

  it('restores a valid snapshot', async () => {
    const repository = { exportData: vi.fn(), replaceData: vi.fn().mockResolvedValue(undefined) };
    await new DataBackupService(repository).importData({ version: 1, exportedAt: new Date().toISOString(), data });
    expect(repository.replaceData).toHaveBeenCalledWith(data);
  });
});

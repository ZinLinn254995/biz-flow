import { ValidationError } from '@/services/common';
import { BACKUP_ENTITIES, BACKUP_VERSION, type BackupData, type DataBackupRepository } from '@/types/repositories/dataBackupRepository';

export class DataBackupService {
  constructor(private readonly repository: DataBackupRepository) {}

  async exportData(): Promise<BackupData> {
    return { version: BACKUP_VERSION, exportedAt: new Date().toISOString(), data: await this.repository.exportData() };
  }

  async importData(input: unknown): Promise<void> {
    const data = this.validate(input);
    await this.repository.replaceData(data);
  }

  private validate(input: unknown): BackupData['data'] {
    if (!input || typeof input !== 'object') throw new ValidationError('Backup must be a JSON object');
    const backup = input as Partial<BackupData>;
    if (backup.version !== BACKUP_VERSION || !backup.data || typeof backup.data !== 'object') {
      throw new ValidationError('Unsupported or invalid backup version');
    }
    const data = backup.data as Partial<BackupData['data']>;
    for (const entity of BACKUP_ENTITIES) {
      if (!Array.isArray(data[entity])) throw new ValidationError(`Backup is missing ${entity}`);
    }
    return data as BackupData['data'];
  }
}

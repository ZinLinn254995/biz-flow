import { useServiceContainer } from '@/hooks/common';
import { useMutation } from '@/hooks/common/useMutation';
import type { BackupData } from '@/types/repositories/dataBackupRepository';

export function useDataBackup() {
  const { dataBackupService } = useServiceContainer();
  if (!dataBackupService) throw new Error('Data backup service is not configured');
  const exportMutation = useMutation<[], BackupData>(() => dataBackupService.exportData());
  const importMutation = useMutation<[unknown], void>((input) => dataBackupService.importData(input));
  return { exportBackup: exportMutation, importBackup: importMutation };
}

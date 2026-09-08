import { useServiceContainer } from '@/hooks/common';
import { useMutation } from '@/hooks/common/useMutation';
export function useDataBackup() {
  const { dataBackupService } = useServiceContainer();
  if (!dataBackupService) throw new Error('Data backup service is not configured');
  const exportMutation = useMutation<[], unknown>(() => dataBackupService.exportData());
  const importMutation = useMutation<[unknown], void>((input) => dataBackupService.importData(input));
  return { exportBackup: exportMutation, importBackup: importMutation };
}

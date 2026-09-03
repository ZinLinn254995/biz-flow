import PageContainer from '@/components/layout/PageContainer';
import EmptyState from '@/components/ui/EmptyState';
import { Settings } from 'lucide-react';

function SettingsPage() {
  return (
    <PageContainer title="Settings">
      <div className="bg-white border border-gray-200 rounded-xl">
        <EmptyState
          icon={Settings}
          title="Coming Soon"
          description="This feature will be implemented in a future BizFlow development phase."
        />
      </div>
    </PageContainer>
  );
}

export default SettingsPage;

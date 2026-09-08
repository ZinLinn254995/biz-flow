'use client';

import { useState } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { useDataBackup } from '@/hooks/dataBackup/useDataBackup';
import { Check, Database, Download, Globe2, LockKeyhole, Palette, Settings, Upload } from 'lucide-react';

const settingsSections = [
  {
    title: 'Workspace preferences',
    description: 'The defaults used when you create new financial records.',
    icon: Globe2,
    items: [
      { label: 'Default currency', value: 'USD — US Dollar' },
      { label: 'Date format', value: 'YYYY-MM-DD' },
    ],
  },
  {
    title: 'Appearance',
    description: 'Keep the workspace focused and easy to scan.',
    icon: Palette,
    items: [{ label: 'Theme', value: 'Light' }],
  },
  {
    title: 'Your data',
    description: 'BizFlow stores your records locally in this browser.',
    icon: Database,
    items: [
      { label: 'Storage', value: 'Local-only' },
      { label: 'Network sync', value: 'Disabled' },
    ],
  },
];

function SettingsPage() {
  const { exportBackup, importBackup } = useDataBackup();
  const [message, setMessage] = useState<string | null>(null);

  const handleExport = async () => {
    const result = await exportBackup.mutate();
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bizflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage('Backup downloaded.');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await importBackup.mutate(JSON.parse(String(reader.result)));
        setMessage('Backup restored.');
      } catch {
        setMessage('That backup file could not be restored.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <PageContainer
      title="Settings"
      subtitle="Review your workspace preferences and how BizFlow handles your data."
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-4">
          {settingsSections.map(({ title, description, icon: Icon, items }) => (
            <section
              key={title}
              className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6"
              aria-labelledby={`${title}-heading`}
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-gray-100 p-2 text-gray-700" aria-hidden="true">
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 id={`${title}-heading`} className="text-base font-semibold text-gray-900">
                    {title}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-gray-500">{description}</p>
                  <dl className="mt-5 divide-y divide-gray-100 border-t border-gray-100">
                    {items.map((item) => (
                      <div key={item.label} className="flex items-center justify-between gap-4 py-3">
                        <dt className="text-sm text-gray-600">{item.label}</dt>
                        <dd className="text-right text-sm font-medium text-gray-900">{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </section>
          ))}
        </div>

        <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6" aria-labelledby="backup-heading">
    <div className="flex items-start gap-3">
      <div className="rounded-lg bg-gray-100 p-2 text-gray-700" aria-hidden="true"><Database size={18} /></div>
      <div className="min-w-0 flex-1">
        <h2 id="backup-heading" className="font-semibold text-gray-900">Data backup</h2>
        <p className="mt-1 text-sm leading-6 text-gray-600">Export your offline records or restore a BizFlow JSON backup.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={handleExport} disabled={exportBackup.isLoading} className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"><Download size={15} /> {exportBackup.isLoading ? 'Preparing…' : 'Export data'}</button>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700"><Upload size={15} /> Import data<input type="file" accept="application/json,.json" className="sr-only" onChange={handleImport} /></label>
        </div>
        {message && <p className="mt-3 text-sm text-gray-600" role="status">{message}</p>}
      </div>
    </div>
  </section>

  <aside className="h-fit rounded-xl border border-gray-200 bg-gray-900 p-5 text-white sm:p-6">
          <div className="flex items-center gap-2 text-gray-300">
            <LockKeyhole size={16} aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-[0.16em]">Privacy first</span>
          </div>
          <div className="mt-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10" aria-hidden="true">
            <Check size={22} />
          </div>
          <h2 className="mt-5 text-lg font-semibold">Your finances stay on this device.</h2>
          <p className="mt-2 text-sm leading-6 text-gray-300">
            BizFlow is offline-first. Your records are stored in local browser storage and are not sent to a server.
          </p>
          <div className="mt-6 flex items-center gap-2 border-t border-white/10 pt-4 text-xs text-gray-400">
            <Settings size={14} aria-hidden="true" />
            <span>More controls are planned for a future phase.</span>
          </div>
        </aside>
      </div>
    </PageContainer>
  );
}

export default SettingsPage;

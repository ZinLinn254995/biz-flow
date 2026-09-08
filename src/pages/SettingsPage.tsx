import PageContainer from '@/components/layout/PageContainer';
import { Check, Database, Globe2, LockKeyhole, Palette, Settings } from 'lucide-react';

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

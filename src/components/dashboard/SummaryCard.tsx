import { type LucideIcon } from 'lucide-react';

type Tone = 'neutral' | 'positive' | 'negative' | 'warning';

interface SummaryCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  tone?: Tone;
}

const toneStyles: Record<Tone, { iconBg: string; iconText: string }> = {
  neutral: { iconBg: 'bg-gray-100', iconText: 'text-gray-600' },
  positive: { iconBg: 'bg-green-50', iconText: 'text-green-600' },
  negative: { iconBg: 'bg-red-50', iconText: 'text-red-600' },
  warning: { iconBg: 'bg-amber-50', iconText: 'text-amber-600' },
};

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
  tone = 'neutral',
}: SummaryCardProps) {
  const styles = toneStyles[tone];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <div
          className={`flex items-center justify-center w-9 h-9 rounded-lg ${styles.iconBg}`}
        >
          <Icon className={`w-4 h-4 ${styles.iconText}`} strokeWidth={2} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 tracking-tight mb-1">
        {value}
      </p>
      <p className="text-xs text-gray-400">{description}</p>
    </div>
  );
}

export default SummaryCard;

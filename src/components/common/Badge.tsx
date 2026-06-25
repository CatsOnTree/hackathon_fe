import type { BadgeTone } from '../../utils/status';

const toneMap = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  blue: 'bg-sky-50 text-sky-700 ring-sky-200',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  red: 'bg-rose-50 text-rose-700 ring-rose-200',
  zinc: 'bg-zinc-100 text-zinc-700 ring-zinc-200',
};

export function Badge({ children, tone = 'zinc' }: { children: React.ReactNode; tone?: BadgeTone }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ring-1 ${toneMap[tone]}`}>
      {children}
    </span>
  );
}

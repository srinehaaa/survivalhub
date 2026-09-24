import type { Status } from '@/lib/types';

interface StatusConfig {
  label: string;
  badge: string;
  dot: string;
  text: string;
  bar: string;
  barBg: string;
}

export const statusConfig: Record<Status, StatusConfig> = {
  urgent: {
    label: 'Urgent',
    badge: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-500',
    text: 'text-red-600',
    bar: 'bg-red-500',
    barBg: 'bg-red-100',
  },
  high: {
    label: 'High',
    badge: 'bg-orange-50 text-orange-700 border-orange-200',
    dot: 'bg-orange-500',
    text: 'text-orange-600',
    bar: 'bg-orange-500',
    barBg: 'bg-orange-100',
  },
  medium: {
    label: 'Medium',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    text: 'text-amber-600',
    bar: 'bg-amber-500',
    barBg: 'bg-amber-100',
  },
  low: {
    label: 'Low',
    badge: 'bg-sky-50 text-sky-700 border-sky-200',
    dot: 'bg-sky-500',
    text: 'text-sky-600',
    bar: 'bg-sky-500',
    barBg: 'bg-sky-100',
  },
  safe: {
    label: 'Safe',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    text: 'text-emerald-600',
    bar: 'bg-emerald-500',
    barBg: 'bg-emerald-100',
  },
  watch: {
    label: 'Watch',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    text: 'text-amber-600',
    bar: 'bg-amber-500',
    barBg: 'bg-amber-100',
  },
  'at-risk': {
    label: 'At Risk',
    badge: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-500',
    text: 'text-red-600',
    bar: 'bg-red-500',
    barBg: 'bg-red-100',
  },
};

export function attendanceStatus(pct: number): Status {
  if (pct >= 75) return 'safe';
  if (pct >= 70) return 'watch';
  return 'at-risk';
}

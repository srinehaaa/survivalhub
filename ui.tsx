import type { ReactNode } from 'react';
import type { Status } from '@/lib/types';
import { statusConfig } from '@/lib/status';

export function Card({
  children,
  className = '',
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md hover:border-slate-300 transition-all' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function StatusBadge({ status, className = '' }: { status: Status; className?: string }) {
  const cfg = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.badge} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export function ProgressBar({
  value,
  barClass = 'bg-emerald-500',
  bgClass = 'bg-slate-100',
  className = '',
}: {
  value: number;
  barClass?: string;
  bgClass?: string;
  className?: string;
}) {
  return (
    <div className={`h-2 rounded-full overflow-hidden ${bgClass} ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${barClass}`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 mb-6 animate-fade-in-up">
      {icon && (
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-800 to-slate-700 text-white flex items-center justify-center shrink-0 shadow-sm">
          {icon}
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

import React from 'react';
import { IssueSeverity } from '../types';
import { ShieldAlert, AlertTriangle, CheckCircle } from 'lucide-react';

interface SeverityBadgeProps {
  severity: IssueSeverity | string | null | undefined;
  size?: 'sm' | 'md';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  size = 'md',
}) => {
  if (!severity) {
    return (
      <span className="inline-flex items-center text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-full px-2.5 py-0.5">
        Pending Triage
      </span>
    );
  }

  const getStyle = () => {
    switch (severity) {
      case 'High':
        return {
          classes: 'bg-rose-50/90 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60',
          icon: <ShieldAlert className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />,
          label: 'High Severity',
        };
      case 'Medium':
        return {
          classes: 'bg-amber-50/90 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60',
          icon: <AlertTriangle className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />,
          label: 'Medium',
        };
      case 'Low':
      default:
        return {
          classes: 'bg-sky-50/90 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/60',
          icon: <CheckCircle className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />,
          label: 'Low',
        };
    }
  };

  const style = getStyle();
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-[11px]';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold uppercase tracking-wider border backdrop-blur-xs ${style.classes} ${pad} whitespace-nowrap shadow-xs`}
    >
      {style.icon}
      <span>{style.label}</span>
    </span>
  );
};

import React from 'react';
import { IssueStatus } from '../types';
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

interface StatusBadgeProps {
  status: IssueStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStyle = () => {
    switch (status) {
      case 'Resolved':
        return {
          textColor: 'text-emerald-700 dark:text-emerald-300',
          dotColor: 'bg-emerald-500',
          dotGlow: 'shadow-[0_0_8px_rgba(16,185,129,0.6)]',
          bg: 'bg-emerald-50/80 dark:bg-emerald-950/50 border-emerald-200/80 dark:border-emerald-800/60',
          icon: <CheckCircle2 className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
          label: 'Resolved',
          pulse: false,
        };
      case 'In Progress':
        return {
          textColor: 'text-amber-700 dark:text-amber-300',
          dotColor: 'bg-amber-500',
          dotGlow: 'shadow-[0_0_8px_rgba(245,158,11,0.6)]',
          bg: 'bg-amber-50/80 dark:bg-amber-950/50 border-amber-200/80 dark:border-amber-800/60',
          icon: <Clock className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
          label: 'In Progress',
          pulse: true,
        };
      case 'Reported':
      default:
        return {
          textColor: 'text-blue-700 dark:text-blue-300',
          dotColor: 'bg-blue-500',
          dotGlow: 'shadow-[0_0_8px_rgba(59,130,246,0.6)]',
          bg: 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-200/80 dark:border-blue-800/60',
          icon: <AlertCircle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
          label: 'Reported',
          pulse: true,
        };
    }
  };

  const config = getStyle();
  const sizeClasses =
    size === 'sm'
      ? 'text-[10px] px-2.5 py-0.5 gap-1.5 font-semibold'
      : size === 'lg'
      ? 'text-xs px-3.5 py-1.5 gap-2 font-bold'
      : 'text-xs px-2.5 py-1 gap-1.5 font-semibold';

  return (
    <span
      className={`inline-flex items-center rounded-full border backdrop-blur-xs ${config.bg} ${config.textColor} ${sizeClasses} whitespace-nowrap shadow-xs transition-all`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${config.dotColor} ${config.dotGlow} ${
          config.pulse ? 'animate-pulse' : ''
        } shrink-0`}
      />
      <span>{config.label}</span>
    </span>
  );
};

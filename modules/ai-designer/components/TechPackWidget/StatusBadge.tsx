/**
 * StatusBadge Component
 * Shows the current status of tech pack generation
 */

import React from 'react';
import { CheckCircle2, Loader2, AlertCircle, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TechPackStatus } from '../../types/techPack';

interface StatusBadgeProps {
  status: TechPackStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'generated':
        return {
          icon: CheckCircle2,
          label: 'Generated',
          className: 'bg-green-50 text-green-700 border-green-200',
          iconClassName: 'text-green-600',
        };
      case 'generating':
        return {
          icon: Loader2,
          label: 'Generating',
          className: 'bg-amber-50 text-amber-700 border-amber-200',
          iconClassName: 'text-amber-600 animate-spin',
        };
      case 'error':
        return {
          icon: AlertCircle,
          label: 'Error',
          className: 'bg-red-50 text-red-700 border-red-200',
          iconClassName: 'text-red-600',
        };
      case 'not_generated':
      default:
        return {
          icon: Package,
          label: 'Not Generated',
          className: 'bg-gray-50 text-gray-700 border-gray-200',
          iconClassName: 'text-gray-600',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium',
        config.className,
        className
      )}
    >
      <Icon className={cn('h-3 w-3', config.iconClassName)} />
      <span>{config.label}</span>
    </div>
  );
}

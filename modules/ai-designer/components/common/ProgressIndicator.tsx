/**
 * Progress indicator component
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ProgressIndicatorProps {
  progress?: number;
  message?: string;
  className?: string;
  showSpinner?: boolean;
}

export function ProgressIndicator({
  progress,
  message,
  className,
  showSpinner = true,
}: ProgressIndicatorProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      {showSpinner && (
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      )}

      {progress !== undefined && (
        <div className="w-full max-w-xs">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          <div className="text-center text-sm text-gray-600 mt-1">
            {progress}%
          </div>
        </div>
      )}

      {message && (
        <p className="text-sm text-gray-600 text-center">{message}</p>
      )}
    </div>
  );
}

export default ProgressIndicator;

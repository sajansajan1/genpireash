/**
 * Loading skeleton component
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
}

export function LoadingSkeleton({ className, count = 1 }: LoadingSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-4 bg-taupe/30 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-taupe/20 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}

export function RevisionSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="aspect-square bg-taupe/20 rounded-lg"></div>
        ))}
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-4 bg-taupe/30 rounded w-3/4"></div>
        <div className="h-4 bg-taupe/20 rounded w-1/2"></div>
      </div>
    </div>
  );
}

export default LoadingSkeleton;

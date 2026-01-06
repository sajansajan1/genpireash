/**
 * TechPackLoadingSkeleton Component
 * Displays a loading skeleton when switching between revisions
 */

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export function TechPackLoadingSkeleton() {
  return (
    <div className="space-y-6 p-4">
      {/* Category Detection Skeleton */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-6 w-24" />
        </div>
      </Card>

      {/* Base View Analysis Skeleton */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-16" />
        </div>

        {/* View Cards */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-4 p-4 border rounded-lg">
            <div className="flex items-start gap-4">
              <Skeleton className="h-24 w-24 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </Card>

      {/* Close-ups Skeleton */}
      <Card className="p-4">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-32 w-full rounded" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </Card>

      {/* Technical Sketches Skeleton */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-48 w-full rounded" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

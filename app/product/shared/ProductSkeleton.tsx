"use client";

/**
 * Shared ProductSkeleton Component
 * Loading skeleton for product pages
 */

import { Skeleton } from "@/components/ui/skeleton";

interface ProductSkeletonProps {
  /** Whether to show expanded sidebar skeleton (default: collapsed) */
  expandedSidebar?: boolean;
}

export function ProductSkeleton({ expandedSidebar = false }: ProductSkeletonProps) {
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header skeleton */}
      <header className="flex-shrink-0 border-b bg-background">
        <div className="flex justify-between items-center px-3 py-2 min-h-[48px]">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
      </header>

      {/* Main layout skeleton */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar skeleton */}
        <aside
          className={`hidden md:flex border-r bg-muted/30 ${
            expandedSidebar ? "w-56 lg:w-64 flex-col" : "w-[60px]"
          }`}
        >
          <div className="flex flex-col items-center py-3 px-2 gap-3">
            <Skeleton className="h-9 w-9 rounded" />
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="w-8 h-px bg-border" />
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-9 w-9 rounded" />
            ))}
          </div>
        </aside>

        {/* Main content skeleton */}
        <main className="flex-1 overflow-y-auto">
          {/* Info bar skeleton */}
          <div className="bg-muted/30 border-b px-4 py-3">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>

          {/* Content area skeleton */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-8 w-24 rounded-md" />
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
            <Skeleton className="h-[500px] w-full rounded-lg" />
          </div>
        </main>
      </div>

      {/* Mobile bottom nav skeleton */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background">
        <div className="flex justify-around items-center py-2 px-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-10 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductSkeleton;

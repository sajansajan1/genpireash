/**
 * TechPackWidget Component
 * Compact widget that shows tech pack status and provides quick actions
 * Always visible in the AI Designer
 */

'use client';

import React from 'react';
import { Package, FileText, Download, Share2, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { TechPackWidgetProps, TechPackStatus } from '../../types/techPack';
import { TECH_PACK_CREDITS } from '../../types/techPack';

export function TechPackWidget({
  productId,
  isGenerated,
  isGenerating,
  generationProgress = 0,
  generationStep = '',
  techPackData,
  onGenerate,
  onExpand,
  className,
}: TechPackWidgetProps) {
  // Determine status
  const getStatus = (): TechPackStatus => {
    if (isGenerating) return 'generating';
    if (isGenerated) return 'generated';
    return 'not_generated';
  };

  const status = getStatus();

  // Don't show widget if no productId
  if (!productId) return null;

  return (
    <Card
      className={cn(
        // Position above bottom controls on mobile, right side on desktop
        'fixed bottom-24 right-4 z-50 w-[280px] shadow-lg border-2 transition-all duration-200 hover:shadow-xl',
        // On desktop: more space from bottom, wider
        'sm:bottom-6 sm:right-6 sm:w-[320px]',
        // Ensure clicks work and widget is above other elements
        'pointer-events-auto cursor-default',
        // Add backdrop for better visibility
        'bg-white backdrop-blur-sm',
        className
      )}
    >
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-gray-700" />
            <h3 className="font-semibold text-sm text-gray-900">Tech Pack</h3>
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Content based on status */}
        {status === 'not_generated' && (
          <div className="space-y-3">
            <p className="text-xs text-gray-600">
              Generate manufacturing-ready documentation for your product
            </p>
            <Button
              onClick={onGenerate}
              className="w-full gap-2 cursor-pointer"
              size="sm"
            >
              <Sparkles className="h-4 w-4" />
              Generate Tech Pack
              {TECH_PACK_CREDITS.GENERATION > 0 && (
                <span className="ml-auto text-xs opacity-80">
                  {TECH_PACK_CREDITS.GENERATION}⭐
                </span>
              )}
            </Button>
          </div>
        )}

        {status === 'generating' && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Progress value={generationProgress} className="h-2" />
              <p className="text-xs text-gray-600">{generationStep || 'Generating...'}</p>
            </div>
            <div className="flex items-center justify-center py-2">
              <div className="flex space-x-1">
                <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}

        {status === 'generated' && techPackData && (
          <div className="space-y-3">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-gray-700">
                <FileText className="h-3.5 w-3.5" />
                <span>PDF Ready</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-700">
                <Download className="h-3.5 w-3.5" />
                <span>Excel Ready</span>
              </div>
            </div>

            {/* Product Name */}
            {techPackData.tech_pack_data?.productName && (
              <p className="text-xs font-medium text-gray-900 line-clamp-1">
                {techPackData.tech_pack_data.productName}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={onExpand}
                variant="default"
                size="sm"
                className="flex-1 gap-1.5 cursor-pointer"
              >
                <span>View Full</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
              <Button
                onClick={onExpand}
                variant="outline"
                size="sm"
                className="px-2 cursor-pointer"
                title="Share"
              >
                <Share2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-3">
            <p className="text-xs text-red-600">
              Tech pack generation failed. Please try again.
            </p>
            <Button
              onClick={onGenerate}
              variant="outline"
              size="sm"
              className="w-full cursor-pointer"
            >
              Retry Generation
            </Button>
          </div>
        )}
      </div>

      {/* Subtle indicator for expandable content */}
      {status === 'generated' && (
        <div className="border-t px-4 py-2 bg-gray-50/50">
          <button
            onClick={onExpand}
            className="w-full flex items-center justify-between text-xs text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <span>Click to view details</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </Card>
  );
}

// Export for easy importing
export default TechPackWidget;

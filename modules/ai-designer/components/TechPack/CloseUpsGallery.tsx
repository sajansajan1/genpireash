/**
 * CloseUpsGallery Component
 *
 * Displays close-up images with:
 * - Progressive loading (show as they arrive)
 * - Skeleton loaders for pending images
 * - Image gallery with global viewer integration
 * - Shot metadata (focus area, description)
 * - Regenerate all functionality
 * - Beautiful masonry layout
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Focus,
  RefreshCw,
  Maximize2,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileText,
  Ruler,
} from 'lucide-react';
import Image from 'next/image';
import type { CloseUpData } from '../../store/techPackV2Store';
import { useImageViewerStore } from '../../store/imageViewerStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CloseUpsGalleryProps {
  closeUps: CloseUpData[];
  onRegenerateAll: () => void;
  isGenerating: boolean;
  expectedCount?: number; // For showing skeleton loaders
}

export function CloseUpsGallery({
  closeUps,
  onRegenerateAll,
  isGenerating,
  expectedCount = 3,
}: CloseUpsGalleryProps) {
  const [regenerating, setRegenerating] = useState(false);
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [selectedCloseUp, setSelectedCloseUp] = useState<CloseUpData | null>(null);
  const { openViewer } = useImageViewerStore();

  // Filter closeups by state
  const loadedCloseUps = closeUps.filter((c) => c.loadingState === 'loaded');
  const loadingCloseUps = closeUps.filter((c) => c.loadingState === 'loading');
  const errorCloseUps = closeUps.filter((c) => c.loadingState === 'error');

  // Only show skeleton loaders for expected images when actively generating
  const loadingCount = isGenerating
    ? Math.max(0, expectedCount - closeUps.length)
    : 0;

  const handleRegenerateAll = async () => {
    setRegenerating(true);
    try {
      await onRegenerateAll();
    } finally {
      setRegenerating(false);
    }
  };

  const handleViewCloseUp = (closeUp: CloseUpData) => {
    openViewer({
      url: closeUp.imageUrl,
      title: closeUp.shotMetadata.focus_area,
      description: closeUp.shotMetadata.description,
    });
  };

  // Don't show section if no close-ups and not generating
  if (closeUps.length === 0 && !isGenerating) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Focus className="h-4 w-4 text-[#1C1917]" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Close-Up Shots
          </h3>
        </div>

        {loadedCloseUps.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerateAll}
            disabled={regenerating || isGenerating}
          >
            {regenerating ? (
              <>
                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                <span className="text-[10px]">Regenerating...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-3 w-3 mr-2" />
                <span className="text-[10px]">Regenerate All (2 credits)</span>
              </>
            )}
          </Button>
        )}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Loaded Close-Ups */}
        {loadedCloseUps.map((closeUp) => (
          <Card
            key={closeUp.id}
            className="overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
          >
            {/* Image - Clickable to open viewer */}
            <div
              className="relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden cursor-pointer group flex-shrink-0"
              onClick={() => handleViewCloseUp(closeUp)}
            >
              <Image
                src={closeUp.thumbnailUrl || closeUp.imageUrl}
                alt={closeUp.shotMetadata.focus_area}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Maximize2 className="h-8 w-8 text-white" />
              </div>

              {/* Success Badge */}
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-black text-white text-[10px]">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Ready
                </Badge>
              </div>
            </div>

            {/* Metadata */}
            <div className="p-3 flex-1 flex flex-col justify-center">
              <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-1">
                {closeUp.shotMetadata.focus_area}
              </h4>
              <p className="text-[10px] text-gray-600 dark:text-gray-400 line-clamp-2">
                {closeUp.shotMetadata.description}
              </p>
            </div>

            {/* Footer with Action Buttons */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (closeUp.summary) {
                  setSelectedCloseUp(closeUp);
                  setSummaryDialogOpen(true);
                }
              }}
              disabled={!closeUp.summary}
              className={`p-3 bg-gray-50 dark:bg-gray-800 border-t flex items-center justify-between w-full transition-colors ${
                closeUp.summary ? 'hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer' : 'cursor-default'
              }`}
            >
              <div className="flex items-center gap-1 text-[10px] text-gray-600 dark:text-gray-400">
                <Ruler className="h-3 w-3" />
                <span>Detail analysis included</span>
              </div>
              {closeUp.summary && (
                <div className="flex items-center gap-1 text-[10px] text-[#D4A5AA] dark:text-[#E8B4B8]">
                  <FileText className="h-3 w-3" />
                  <span>View Guide</span>
                </div>
              )}
            </button>
          </Card>
        ))}

        {/* Loading Close-Ups */}
        {loadingCloseUps.map((closeUp) => (
          <Card key={closeUp.id} className="overflow-hidden">
            {/* Loading Skeleton with Animation */}
            <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-950 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-10 w-10 text-[#1C1917] animate-spin mx-auto mb-3" />
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Generating...
                  </p>
                </div>
              </div>

              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>

            {/* Metadata */}
            <div className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6 mt-1" />
            </div>
          </Card>
        ))}

        {/* Skeleton Loaders for Expected Images */}
        {Array.from({ length: loadingCount }).map((_, idx) => (
          <Card key={`skeleton-${idx}`} className="overflow-hidden">
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
              <Skeleton className="w-full h-full" />
            </div>
            <div className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6 mt-1" />
            </div>
          </Card>
        ))}

        {/* Error Close-Ups */}
        {errorCloseUps.map((closeUp) => (
          <Card key={closeUp.id} className="overflow-hidden border-2 border-red-300">
            {/* Error State */}
            <div className="relative aspect-square bg-red-50 dark:bg-red-950/20 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
                  <p className="text-xs font-medium text-red-700 dark:text-red-300">
                    Generation Failed
                  </p>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="p-3">
              <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-1">
                {closeUp.shotMetadata.focus_area}
              </h4>
              <p className="text-[10px] text-red-600 dark:text-red-400">
                Failed to generate this close-up
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* CSS for shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>

      {/* Close-Up Summary Dialog */}
      <Dialog open={summaryDialogOpen} onOpenChange={setSummaryDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Close-Up Detail Guide - {selectedCloseUp?.shotMetadata.focus_area || ''}
            </DialogTitle>
          </DialogHeader>

          {selectedCloseUp?.summary && (
            <div className="space-y-6 mt-4">
              {/* Overview */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Overview</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">{selectedCloseUp.summary.overview}</p>
              </div>

              {/* Material Details */}
              {selectedCloseUp.summary.materialDetails && selectedCloseUp.summary.materialDetails.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Material Details</h3>
                  <div className="space-y-2">
                    {selectedCloseUp.summary.materialDetails.map((material, idx) => (
                      <Card key={idx} className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-xs font-medium text-gray-900 dark:text-white">{material.material}</p>
                          <Badge variant="outline" className="text-[10px]">{material.finish}</Badge>
                        </div>
                        <p className="text-[10px] text-gray-600 dark:text-gray-400 mb-2">{material.quality}</p>
                        {material.properties && material.properties.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {material.properties.map((prop, propIdx) => (
                              <Badge key={propIdx} variant="secondary" className="text-[10px]">{prop}</Badge>
                            ))}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Construction Techniques */}
              {selectedCloseUp.summary.constructionTechniques && selectedCloseUp.summary.constructionTechniques.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Construction Techniques</h3>
                  <div className="space-y-2">
                    {selectedCloseUp.summary.constructionTechniques.map((technique, idx) => (
                      <Card key={idx} className="p-3">
                        <p className="text-xs font-medium text-gray-900 dark:text-white mb-1">{technique.technique}</p>
                        <p className="text-[10px] text-gray-700 dark:text-gray-300 mb-2">{technique.description}</p>
                        <Badge variant="outline" className="text-[10px]">{technique.specifications}</Badge>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Design Elements */}
              {selectedCloseUp.summary.designElements && selectedCloseUp.summary.designElements.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Design Elements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedCloseUp.summary.designElements.map((element, idx) => (
                      <Card key={idx} className="p-3">
                        <p className="text-xs font-medium text-gray-900 dark:text-white mb-1">{element.element}</p>
                        <p className="text-[10px] text-gray-700 dark:text-gray-300 mb-1">{element.description}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{element.purpose}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Color & Finish */}
              {selectedCloseUp.summary.colorAndFinish && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Color & Finish</h3>
                  <Card className="p-3">
                    <div className="flex items-center gap-3 mb-2">
                      {selectedCloseUp.summary.colorAndFinish.hex && (
                        <div
                          className="w-10 h-10 rounded-full border-2 border-gray-300"
                          style={{ backgroundColor: selectedCloseUp.summary.colorAndFinish.hex }}
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-900 dark:text-white">{selectedCloseUp.summary.colorAndFinish.primaryColor}</p>
                        {selectedCloseUp.summary.colorAndFinish.hex && (
                          <p className="text-[10px] text-gray-600 dark:text-gray-400">{selectedCloseUp.summary.colorAndFinish.hex}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Texture</p>
                        <p className="text-xs text-gray-900 dark:text-white">{selectedCloseUp.summary.colorAndFinish.texture}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Sheen</p>
                        <p className="text-xs text-gray-900 dark:text-white">{selectedCloseUp.summary.colorAndFinish.sheen}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Quality Indicators */}
              {selectedCloseUp.summary.qualityIndicators && selectedCloseUp.summary.qualityIndicators.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quality Indicators</h3>
                  <Card className="p-4 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                    <ul className="space-y-2">
                      {selectedCloseUp.summary.qualityIndicators.map((indicator, idx) => (
                        <li key={idx} className="text-xs text-gray-800 dark:text-gray-200 flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                          <span>{indicator}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              )}

              {/* Manufacturing Notes */}
              {selectedCloseUp.summary.manufacturingNotes && selectedCloseUp.summary.manufacturingNotes.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Manufacturing Notes</h3>
                  <Card className="p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                    <ul className="space-y-2">
                      {selectedCloseUp.summary.manufacturingNotes.map((note, idx) => (
                        <li key={idx} className="text-xs text-gray-800 dark:text-gray-200 flex items-start gap-2">
                          <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              )}

              {/* Summary */}
              {selectedCloseUp.summary.summary && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Summary</h3>
                  <Card className="p-4 bg-[#E8B4B8]/10 dark:bg-[#E8B4B8]/5 border-[#E8B4B8] dark:border-[#D4A5AA]">
                    <p className="text-xs text-gray-800 dark:text-gray-200">{selectedCloseUp.summary.summary}</p>
                  </Card>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

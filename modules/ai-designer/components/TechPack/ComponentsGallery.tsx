/**
 * ComponentsGallery Component
 *
 * Displays component/ingredient images with:
 * - Progressive loading (show as they arrive)
 * - Skeleton loaders for pending images
 * - Image gallery with global viewer integration
 * - Component metadata (name, type, guide)
 * - Regenerate all functionality
 * - Beautiful grid layout for factory sourcing
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Package,
  RefreshCw,
  Maximize2,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileText,
  Box,
  Plus,
  Sparkles,
  X,
} from 'lucide-react';
import Image from 'next/image';
import type { ComponentData } from '../../store/techPackV2Store';
import { useImageViewerStore } from '../../store/imageViewerStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

// Result type for custom component generation
export interface CustomComponentGenerationResult {
  success: boolean;
  error?: string;
  componentNotFound?: boolean;
  reason?: string;
  suggestions?: string[];
  data?: {
    component: {
      analysisId: string;
      componentName: string;
      componentType: string;
      imageUrl: string;
      thumbnailUrl?: string;
      guide: any;
    };
    creditsUsed: number;
  };
}

interface ComponentsGalleryProps {
  components: ComponentData[];
  onRegenerateAll: () => void;
  onGenerateCustomComponent?: (description: string) => Promise<CustomComponentGenerationResult>;
  isGenerating: boolean;
  expectedCount?: number; // For showing skeleton loaders
}

export function ComponentsGallery({
  components,
  onRegenerateAll,
  onGenerateCustomComponent,
  isGenerating,
  expectedCount = 5,
}: ComponentsGalleryProps) {
  const [regenerating, setRegenerating] = useState(false);
  const [guideDialogOpen, setGuideDialogOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<ComponentData | null>(null);
  const { openViewer } = useImageViewerStore();

  // Custom component dialog state
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [customDescription, setCustomDescription] = useState('');
  const [customGenerating, setCustomGenerating] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);
  const [customSuggestions, setCustomSuggestions] = useState<string[]>([]);

  // Filter components by state
  const loadedComponents = components.filter((c) => c.loadingState === 'loaded');
  const loadingComponents = components.filter((c) => c.loadingState === 'loading');
  const errorComponents = components.filter((c) => c.loadingState === 'error');

  // Only show skeleton loaders for expected images when actively generating
  const loadingCount = isGenerating
    ? Math.max(0, expectedCount - components.length)
    : 0;

  const handleRegenerateAll = async () => {
    setRegenerating(true);
    try {
      await onRegenerateAll();
    } finally {
      setRegenerating(false);
    }
  };

  const handleViewComponent = (component: ComponentData) => {
    openViewer({
      url: component.imageUrl,
      title: component.componentName,
      description: `${component.componentType} component`,
    });
  };

  // Handle custom component generation
  const handleGenerateCustomComponent = async () => {
    if (!onGenerateCustomComponent || !customDescription.trim()) return;

    setCustomGenerating(true);
    setCustomError(null);
    setCustomSuggestions([]);

    try {
      const result = await onGenerateCustomComponent(customDescription.trim());

      if (result.success) {
        // Success - close dialog and reset
        setCustomDialogOpen(false);
        setCustomDescription('');
      } else if (result.componentNotFound) {
        // Component doesn't exist in product
        setCustomError(result.reason || 'This component was not found in your product.');
        setCustomSuggestions(result.suggestions || []);
      } else {
        // Other error
        setCustomError(result.error || 'Failed to generate component image.');
      }
    } catch (error) {
      setCustomError(error instanceof Error ? error.message : 'An unexpected error occurred.');
    } finally {
      setCustomGenerating(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setCustomDescription(suggestion);
    setCustomError(null);
    setCustomSuggestions([]);
  };

  // Reset custom dialog state when closed
  const handleCustomDialogClose = (open: boolean) => {
    if (!open) {
      setCustomDescription('');
      setCustomError(null);
      setCustomSuggestions([]);
    }
    setCustomDialogOpen(open);
  };

  // Don't show section if no components and not generating
  if (components.length === 0 && !isGenerating) {
    return null;
  }

  // Helper to get component type color - using neutral gray color scheme
  const getComponentTypeColor = (type: string) => {
    // All component types use the same neutral gray scheme
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700';
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Package className="h-4 w-4 text-[#1C1917] flex-shrink-0" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Component Images
          </h3>
          <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">
            Factory Sourcing
          </Badge>
        </div>

        {loadedComponents.length > 0 && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Generate Custom Component Button */}
            {onGenerateCustomComponent && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCustomDialogOpen(true)}
                disabled={isGenerating || customGenerating}
                className="border-dashed"
              >
                <Plus className="h-3 w-3 sm:mr-1" />
                <span className="text-[10px] hidden sm:inline">Add Custom (2 credits)</span>
              </Button>
            )}

            {/* Regenerate All Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerateAll}
              disabled={regenerating || isGenerating}
            >
              {regenerating ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  <span className="text-[10px] hidden sm:inline">Regenerating...</span>
                  <span className="text-[10px] sm:hidden">...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 sm:mr-2" />
                  <span className="text-[10px] hidden sm:inline">Regenerate All (2 credits)</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Loaded Components */}
        {loadedComponents.map((component) => (
          <Card
            key={component.id}
            className="overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
          >
            {/* Image - Clickable to open viewer */}
            <div
              className="relative aspect-square bg-white dark:bg-gray-900 overflow-hidden cursor-pointer group flex-shrink-0 border-b"
              onClick={() => handleViewComponent(component)}
            >
              <Image
                src={component.thumbnailUrl || component.imageUrl}
                alt={component.componentName}
                fill
                className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
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

              {/* Component Type Badge */}
              <div className="absolute top-2 left-2">
                <Badge className={`text-[10px] ${getComponentTypeColor(component.componentType)}`}>
                  {component.componentType}
                </Badge>
              </div>
            </div>

            {/* Metadata */}
            <div className="p-3 flex-1 flex flex-col justify-center">
              <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                {component.componentName}
              </h4>
              {component.shotData?.component_type && (
                <p className="text-[10px] text-gray-600 dark:text-gray-400 capitalize">
                  {component.shotData.component_type}
                </p>
              )}
            </div>

            {/* Footer with Action Buttons */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (component.guide) {
                  setSelectedComponent(component);
                  setGuideDialogOpen(true);
                }
              }}
              disabled={!component.guide}
              className={`p-3 bg-gray-50 dark:bg-gray-800 border-t flex items-center justify-between w-full transition-colors ${
                component.guide ? 'hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer' : 'cursor-default'
              }`}
            >
              <div className="flex items-center gap-1 text-[10px] text-gray-600 dark:text-gray-400">
                <Box className="h-3 w-3" />
                <span>Factory specs</span>
              </div>
              {component.guide && (
                <div className="flex items-center gap-1 text-[10px] text-[#D4A5AA] dark:text-[#E8B4B8]">
                  <FileText className="h-3 w-3" />
                  <span>View Guide</span>
                </div>
              )}
            </button>
          </Card>
        ))}

        {/* Loading Components */}
        {loadingComponents.map((component) => (
          <Card key={component.id} className="overflow-hidden">
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
            </div>
          </Card>
        ))}

        {/* Error Components */}
        {errorComponents.map((component) => (
          <Card key={component.id} className="overflow-hidden border-2 border-red-300">
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
                {component.componentName}
              </h4>
              <p className="text-[10px] text-red-600 dark:text-red-400">
                Failed to generate
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

      {/* Component Guide Dialog */}
      <Dialog open={guideDialogOpen} onOpenChange={setGuideDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Component Guide - {selectedComponent?.componentName || ''}
            </DialogTitle>
          </DialogHeader>

          {selectedComponent?.guide && (
            <div className="space-y-6 mt-4">
              {/* Component Identification */}
              {selectedComponent.guide.component_identification && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Component Identification</h3>
                  <Card className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Component Name</p>
                        <p className="text-xs text-gray-900 dark:text-white font-medium">
                          {selectedComponent.guide.component_identification.component_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Type</p>
                        <Badge className={`text-[10px] ${getComponentTypeColor(selectedComponent.guide.component_identification.component_type)}`}>
                          {selectedComponent.guide.component_identification.component_type}
                        </Badge>
                      </div>
                      {selectedComponent.guide.component_identification.primary_function && (
                        <div className="col-span-2">
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Primary Function</p>
                          <p className="text-xs text-gray-700 dark:text-gray-300">
                            {selectedComponent.guide.component_identification.primary_function}
                          </p>
                        </div>
                      )}
                      {selectedComponent.guide.component_identification.visual_description && (
                        <div className="col-span-2">
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Visual Description</p>
                          <p className="text-xs text-gray-700 dark:text-gray-300">
                            {selectedComponent.guide.component_identification.visual_description}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              )}

              {/* Material Specifications */}
              {selectedComponent.guide.material_specifications && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Material Specifications</h3>
                  <Card className="p-4">
                    <div className="space-y-3">
                      {selectedComponent.guide.material_specifications.material_type && (
                        <div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Material Type</p>
                          <p className="text-xs text-gray-900 dark:text-white font-medium">
                            {selectedComponent.guide.material_specifications.material_type}
                          </p>
                        </div>
                      )}
                      {selectedComponent.guide.material_specifications.composition && (
                        <div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Composition</p>
                          <p className="text-xs text-gray-700 dark:text-gray-300">
                            {selectedComponent.guide.material_specifications.composition}
                          </p>
                        </div>
                      )}
                      {selectedComponent.guide.material_specifications.quality_grade && (
                        <div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Quality Grade</p>
                          <Badge variant="outline" className="text-[10px]">
                            {selectedComponent.guide.material_specifications.quality_grade}
                          </Badge>
                        </div>
                      )}
                      {selectedComponent.guide.material_specifications.finish && (
                        <div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Finish</p>
                          <p className="text-xs text-gray-700 dark:text-gray-300">
                            {selectedComponent.guide.material_specifications.finish}
                          </p>
                        </div>
                      )}
                      {selectedComponent.guide.material_specifications.color_details && (
                        <div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Color Details</p>
                          <p className="text-xs text-gray-700 dark:text-gray-300">
                            {selectedComponent.guide.material_specifications.color_details}
                          </p>
                        </div>
                      )}
                      {selectedComponent.guide.material_specifications.weight_gsm && (
                        <div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Weight (GSM)</p>
                          <p className="text-xs text-gray-900 dark:text-white font-medium">
                            {selectedComponent.guide.material_specifications.weight_gsm}
                          </p>
                        </div>
                      )}
                      {selectedComponent.guide.material_specifications.properties && selectedComponent.guide.material_specifications.properties.length > 0 && (
                        <div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">Properties</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedComponent.guide.material_specifications.properties.map((prop: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-[10px]">{prop}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              )}

              {/* Sourcing Information */}
              {selectedComponent.guide.sourcing_information && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Sourcing Information</h3>
                  <Card className="p-4 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
                    <div className="space-y-3">
                      {selectedComponent.guide.sourcing_information.supplier_type && (
                        <div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Supplier Type</p>
                          <p className="text-xs text-gray-900 dark:text-white">
                            {selectedComponent.guide.sourcing_information.supplier_type}
                          </p>
                        </div>
                      )}
                      {selectedComponent.guide.sourcing_information.market_availability && (
                        <div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Market Availability</p>
                          <p className="text-xs text-gray-700 dark:text-gray-300">
                            {selectedComponent.guide.sourcing_information.market_availability}
                          </p>
                        </div>
                      )}
                      {selectedComponent.guide.sourcing_information.estimated_cost && (
                        <div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Estimated Cost</p>
                          <p className="text-xs text-gray-900 dark:text-white font-medium">
                            {selectedComponent.guide.sourcing_information.estimated_cost}
                          </p>
                        </div>
                      )}
                      {selectedComponent.guide.sourcing_information.minimum_order_quantity && (
                        <div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Minimum Order Quantity</p>
                          <p className="text-xs text-gray-700 dark:text-gray-300">
                            {selectedComponent.guide.sourcing_information.minimum_order_quantity}
                          </p>
                        </div>
                      )}
                      {selectedComponent.guide.sourcing_information.lead_time && (
                        <div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Lead Time</p>
                          <p className="text-xs text-gray-700 dark:text-gray-300">
                            {selectedComponent.guide.sourcing_information.lead_time}
                          </p>
                        </div>
                      )}
                      {selectedComponent.guide.sourcing_information.alternatives && selectedComponent.guide.sourcing_information.alternatives.length > 0 && (
                        <div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">Alternatives</p>
                          <ul className="space-y-1">
                            {selectedComponent.guide.sourcing_information.alternatives.map((alt: string, idx: number) => (
                              <li key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                <span className="text-gray-600 dark:text-gray-400 mt-0.5">•</span>
                                <span>{alt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              )}

              {/* Quality Control */}
              {selectedComponent.guide.quality_control && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quality Control</h3>
                  <Card className="p-4 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
                    <div className="space-y-3">
                      {selectedComponent.guide.quality_control.inspection_points && selectedComponent.guide.quality_control.inspection_points.length > 0 && (
                        <div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">Inspection Points</p>
                          <ul className="space-y-2">
                            {selectedComponent.guide.quality_control.inspection_points.map((point: any, idx: number) => (
                              <li key={idx} className="text-xs text-gray-800 dark:text-gray-200">
                                <div className="flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <p className="font-medium">{point.method || point.checkpoint || 'Inspection Point'}</p>
                                    {point.acceptance_criteria && (
                                      <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">{point.acceptance_criteria}</p>
                                    )}
                                    {point.critical && (
                                      <Badge variant="outline" className="text-[10px] mt-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700">Critical</Badge>
                                    )}
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {selectedComponent.guide.quality_control.acceptance_criteria && (
                        <div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Acceptance Criteria</p>
                          <p className="text-xs text-gray-700 dark:text-gray-300">
                            {selectedComponent.guide.quality_control.acceptance_criteria}
                          </p>
                        </div>
                      )}
                      {selectedComponent.guide.quality_control.testing_requirements && selectedComponent.guide.quality_control.testing_requirements.length > 0 && (
                        <div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">Testing Requirements</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedComponent.guide.quality_control.testing_requirements.map((test: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-[10px]">{test}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              )}

              {/* Manufacturing Notes */}
              {selectedComponent.guide.manufacturing_notes && selectedComponent.guide.manufacturing_notes.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Manufacturing Notes</h3>
                  <Card className="p-4 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
                    <ul className="space-y-2">
                      {selectedComponent.guide.manufacturing_notes.map((note: string, idx: number) => (
                        <li key={idx} className="text-xs text-gray-800 dark:text-gray-200 flex items-start gap-2">
                          <span className="text-gray-600 dark:text-gray-400 mt-0.5">•</span>
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Custom Component Generation Dialog */}
      <Dialog open={customDialogOpen} onOpenChange={handleCustomDialogClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#1C1917]" />
              Generate Custom Component
            </DialogTitle>
            <DialogDescription className="text-xs">
              Describe a specific component from your product to generate its image.
              Only components that exist in your product can be generated.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Input Field */}
            <div className="space-y-2">
              <Label htmlFor="componentDescription" className="text-xs font-medium">
                Component Description
              </Label>
              <Input
                id="componentDescription"
                placeholder="e.g., metal zipper, leather strap, button closure..."
                value={customDescription}
                onChange={(e) => {
                  setCustomDescription(e.target.value);
                  if (customError) {
                    setCustomError(null);
                    setCustomSuggestions([]);
                  }
                }}
                disabled={customGenerating}
                className="text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customDescription.trim()) {
                    handleGenerateCustomComponent();
                  }
                }}
              />
              <p className="text-[10px] text-gray-500">
                Be specific about the component you want to visualize (3-500 characters)
              </p>
            </div>

            {/* Error Message */}
            {customError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-red-700 dark:text-red-300 font-medium">
                      Component Not Found
                    </p>
                    <p className="text-[10px] text-red-600 dark:text-red-400 mt-1">
                      {customError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Suggestions */}
            {customSuggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] text-gray-600 dark:text-gray-400 font-medium">
                  Try one of these components from your product:
                </p>
                <div className="flex flex-wrap gap-2">
                  {customSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-2 py-1 text-[10px] bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Credit Info */}
            <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <Badge variant="outline" className="text-[10px]">
                2 credits
              </Badge>
              <span className="text-[10px] text-gray-500">
                per custom component image
              </span>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCustomDialogClose(false)}
              disabled={customGenerating}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleGenerateCustomComponent}
              disabled={!customDescription.trim() || customDescription.trim().length < 3 || customGenerating}
              className="bg-[#1C1917] hover:bg-gray-800 text-white"
            >
              {customGenerating ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

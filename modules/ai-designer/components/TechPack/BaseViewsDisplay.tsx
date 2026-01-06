/**
 * BaseViewsDisplay Component
 *
 * Displays base view analysis results with:
 * - Expand/collapse functionality (one at a time)
 * - Material, color, and construction details
 * - Confidence scores
 * - Cached indicators
 * - Regeneration controls
 * - Edit field capabilities
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronDown,
  ChevronUp,
  Eye,
  RefreshCw,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import type { BaseViewData } from '../../store/techPackV2Store';
import { useTechPackV2Store } from '../../store/techPackV2Store';
import { EditableAnalysisField } from './EditableAnalysisField';
import type { ProductDimensionsData } from '../../types/techPack';

interface BaseViewsDisplayProps {
  baseViews: BaseViewData[];
  onToggleExpanded: (revisionId: string) => void;
  onRegenerateView: (revisionId: string) => void;
  isGenerating: boolean;
  productDimensions?: ProductDimensionsData | null;
}

interface MaterialInfo {
  material_type: string;
  confidence: number;
  properties?: string[];
}

interface ColorInfo {
  name: string;
  hex?: string;
  location: string;
}

interface ConstructionDetail {
  feature: string;
  description: string;
  location?: string;
}

interface AnalysisData {
  view_type?: string;
  product_category?: string;
  product_subcategory?: string;
  product_type?: string;
  product_details?: {
    style?: string;
    intended_use?: string;
    target_market?: string;
  };
  design_elements?: Record<string, any>;
  materials_detected?: Array<{
    component: string;
    material_type: string;
    percentage?: string;
    spec?: string;
    finish?: string;
    estimated_weight?: string;
  }>;
  colors_and_patterns?: {
    primary_color?: { name: string; hex: string };
    secondary_colors?: Array<{ name: string; hex: string }>;
    pattern_type?: string;
    finish?: string;
  };
  dimensions_estimated?: Record<string, {
    value: string;
    tolerance?: string;
    measurement_point?: string;
  }>;
  construction_details?: {
    construction_method?: string;
    seam_type?: string;
    stitching_details?: string;
    edge_finishing?: string;
    reinforcement?: string;
    special_features?: string[];
  };
  hardware_and_trims?: Array<{
    type?: string;
    material?: string;
    finish?: string;
    placement?: string;
  }>;
  quality_indicators?: {
    overall_quality?: string;
    craftsmanship?: string;
    finish_quality?: string;
    attention_to_detail?: string;
    visible_defects?: string[];
  };
  manufacturing_notes?: string[];
  cost_estimation?: {
    material_cost_range?: string;
    complexity?: string;
    production_difficulty?: string;
    estimated_production_time?: string;
  };
  confidence_scores?: {
    overall?: number;
    category_detection?: number;
    materials?: number;
    dimensions?: number;
    construction?: number;
  };
  analysis_notes?: string;

  // Legacy fields for backward compatibility
  colors_identified?: ColorInfo[];
  key_features?: string[];
  measurements?: Record<string, { value: string; unit: string }>;
}

export function BaseViewsDisplay({
  baseViews,
  onToggleExpanded,
  onRegenerateView,
  isGenerating,
  productDimensions,
}: BaseViewsDisplayProps) {
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const { updateBaseViewAnalysisField } = useTechPackV2Store();

  if (baseViews.length === 0) {
    return null;
  }

  const handleRegenerate = async (revisionId: string) => {
    setRegeneratingId(revisionId);
    try {
      onRegenerateView(revisionId);
    } finally {
      setRegeneratingId(null);
    }
  };

  const handleSaveField = async (
    revisionId: string,
    fieldPath: string,
    newValue: string
  ) => {
    try {
      // Update store immediately (optimistic update)
      updateBaseViewAnalysisField(revisionId, fieldPath, newValue);

      // Save to database
      const response = await fetch('/api/tech-pack-v2/update-analysis', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revisionId, fieldPath, value: newValue }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to save');
      }

      toast.success('Analysis updated successfully');
    } catch (error) {
      toast.error('Failed to save changes');
      throw error;
    }
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-[#1C1917]" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Base View Analysis
          </h3>
        </div>
      </div>

      {/* Base Views Grid */}
      <div className="space-y-3">
        {baseViews
          .filter((view) => view.viewType && view.imageUrl) // Safety filter to ensure valid data
          .map((view) => {
          const analysisData = view.analysisData as AnalysisData;

          return (
            <Card
              key={view.revisionId}
              className={`
                overflow-hidden transition-all duration-300 border-2
                ${view.isExpanded ? 'border-[#D4A5AA] shadow-lg' : 'border-gray-200 dark:border-gray-700'}
              `}
            >
              {/* Collapsed View - Always Visible */}
              <button
                onClick={() => onToggleExpanded(view.revisionId)}
                className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
              >
                {/* Thumbnail */}
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                  <Image
                    src={view.thumbnailUrl || view.imageUrl}
                    alt={view.viewType}
                    fill
                    className="object-cover"
                  />
                  {view.cached && (
                    <div className="absolute top-1 right-1">
                      <Badge variant="secondary" className="text-[10px] bg-black text-white">
                        <Zap className="h-3 w-3 mr-1" />
                        Cached
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-xs font-semibold text-gray-900 dark:text-white capitalize">
                      {view.viewType.replace('-', ' ')} View
                    </h4>
                    <Badge variant="outline" className="text-[10px]">
                      {Math.round((view.confidenceScore || 0.85) * 100)}% confidence
                    </Badge>
                  </div>

                  {/* Quick Summary */}
                  {analysisData && (
                    <p className="text-[10px] text-gray-600 dark:text-gray-400 truncate">
                      {analysisData.product_category && `${analysisData.product_category}`}
                      {analysisData.product_subcategory && ` · ${analysisData.product_subcategory}`}
                      {analysisData.materials_detected && analysisData.materials_detected.length > 0 && ` · ${analysisData.materials_detected.length} materials`}
                    </p>
                  )}
                </div>

                {/* Expand/Collapse Icon */}
                <div className="flex-shrink-0">
                  {view.isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </button>

              {/* Expanded View - Conditional */}
              {view.isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900">
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 mb-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRegenerate(view.revisionId)}
                      disabled={regeneratingId === view.revisionId || isGenerating}
                    >
                      {regeneratingId === view.revisionId ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          <span className="text-[10px]">Regenerating...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          <span className="text-[10px]">Regenerate View (1 credit)</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Full-Size Image */}
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 mb-6">
                    <Image
                      src={view.imageUrl}
                      alt={view.viewType}
                      fill
                      className="object-contain"
                    />
                  </div>

                  {/* Analysis Details */}
                  <div className="space-y-6">
                    {/* Product Information */}
                    {(analysisData?.product_category || analysisData?.product_type || analysisData?.product_details) && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                          Product Information
                        </h5>
                        <Card className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {analysisData.product_category && (
                              <div>
                                <p className="text-[10px] text-gray-500 mb-1">Category</p>
                                <p className="text-xs font-medium text-gray-900 dark:text-white">
                                  {analysisData.product_category}
                                </p>
                              </div>
                            )}
                            {analysisData.product_subcategory && (
                              <div>
                                <p className="text-[10px] text-gray-500 mb-1">Subcategory</p>
                                <p className="text-xs font-medium text-gray-900 dark:text-white">
                                  {analysisData.product_subcategory}
                                </p>
                              </div>
                            )}
                            {analysisData.product_type && (
                              <div>
                                <p className="text-[10px] text-gray-500 mb-1">Product Type</p>
                                <p className="text-xs font-medium text-gray-900 dark:text-white">
                                  {analysisData.product_type}
                                </p>
                              </div>
                            )}
                            {analysisData.product_details?.style && (
                              <div className="md:col-span-2">
                                <p className="text-[10px] text-gray-500 mb-1">Style Description</p>
                                <p className="text-xs text-gray-700 dark:text-gray-300">
                                  {analysisData.product_details.style}
                                </p>
                              </div>
                            )}
                            {analysisData.product_details?.intended_use && (
                              <div>
                                <p className="text-[10px] text-gray-500 mb-1">Intended Use</p>
                                <p className="text-xs font-medium text-gray-900 dark:text-white">
                                  {analysisData.product_details.intended_use}
                                </p>
                              </div>
                            )}
                            {analysisData.product_details?.target_market && (
                              <div>
                                <p className="text-[10px] text-gray-500 mb-1">Target Market</p>
                                <p className="text-xs font-medium text-gray-900 dark:text-white">
                                  {analysisData.product_details.target_market}
                                </p>
                              </div>
                            )}
                          </div>
                        </Card>
                      </div>
                    )}

                    {/* Colors and Patterns */}
                    {analysisData?.colors_and_patterns && (
                      analysisData.colors_and_patterns.primary_color ||
                      (analysisData.colors_and_patterns.secondary_colors && analysisData.colors_and_patterns.secondary_colors.length > 0) ||
                      analysisData.colors_and_patterns.pattern_type
                    ) && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                          Colors & Patterns
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {analysisData.colors_and_patterns.primary_color && (
                            <Card className="p-4">
                              <p className="text-[10px] text-gray-500 mb-2">Primary Color</p>
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-10 h-10 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                                  style={{ backgroundColor: analysisData.colors_and_patterns.primary_color.hex }}
                                />
                                <div>
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                                    {analysisData.colors_and_patterns.primary_color.name}
                                  </p>
                                  <p className="text-[10px] text-gray-500 font-mono">
                                    {analysisData.colors_and_patterns.primary_color.hex}
                                  </p>
                                </div>
                              </div>
                            </Card>
                          )}
                          {analysisData.colors_and_patterns.secondary_colors && analysisData.colors_and_patterns.secondary_colors.length > 0 && (
                            <Card className="p-4">
                              <p className="text-[10px] text-gray-500 mb-2">Secondary Colors</p>
                              <div className="flex flex-wrap gap-2">
                                {analysisData.colors_and_patterns.secondary_colors.map((color, idx) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <div
                                      className="w-6 h-6 rounded border-2 border-gray-300 dark:border-gray-600"
                                      style={{ backgroundColor: color.hex }}
                                      title={`${color.name} - ${color.hex}`}
                                    />
                                    <span className="text-[10px] text-gray-700 dark:text-gray-300 capitalize">
                                      {color.name}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </Card>
                          )}
                          {analysisData.colors_and_patterns.pattern_type && (
                            <div className="flex gap-2">
                              <Badge variant="secondary" className="text-[10px]">
                                Pattern: {analysisData.colors_and_patterns.pattern_type}
                              </Badge>
                              {analysisData.colors_and_patterns.finish && (
                                <Badge variant="secondary" className="text-[10px]">
                                  Finish: {analysisData.colors_and_patterns.finish}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Materials */}
                    {analysisData?.materials_detected && analysisData.materials_detected.length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          Materials Detected
                          <Badge variant="secondary" className="text-[10px]">{analysisData.materials_detected.length}</Badge>
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {analysisData.materials_detected.map((material, idx) => (
                            <Card key={idx} className="p-4">
                              <div className="space-y-2">
                                <div>
                                  <p className="text-[10px] text-gray-500">Component</p>
                                  <p className="text-xs font-medium text-gray-900 dark:text-white capitalize">
                                    {material.component}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-gray-500">Material Type</p>
                                  <p className="text-xs font-medium text-gray-900 dark:text-white capitalize">
                                    {material.material_type}
                                  </p>
                                </div>
                                {material.spec && material.spec !== 'Not specified' && (
                                  <div>
                                    <p className="text-[10px] text-gray-500">Specification</p>
                                    <p className="text-xs text-gray-700 dark:text-gray-300">{material.spec}</p>
                                  </div>
                                )}
                                {material.finish && material.finish !== 'Not specified' && (
                                  <Badge variant="outline" className="text-[10px]">
                                    Finish: {material.finish}
                                  </Badge>
                                )}
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dimensions - prioritize user dimensions over recommended, then AI-estimated */}
                    {(() => {
                      // Check if user has set custom dimensions (always prefer user over recommended)
                      const userDims = productDimensions?.user;
                      const hasUserDims = userDims && (
                        userDims.height || userDims.width || userDims.length ||
                        userDims.weight || userDims.volume || userDims.diameter ||
                        (userDims.additionalDimensions && userDims.additionalDimensions.length > 0)
                      );

                      // Fall back to recommended only if user hasn't set any dimensions
                      const recommendedDims = productDimensions?.recommended;
                      const hasRecommendedDims = !hasUserDims && recommendedDims && (
                        recommendedDims.height || recommendedDims.width || recommendedDims.length ||
                        recommendedDims.weight || recommendedDims.volume || recommendedDims.diameter ||
                        (recommendedDims.additionalDimensions && recommendedDims.additionalDimensions.length > 0)
                      );

                      // Use user dimensions if available, otherwise recommended
                      const approvedDims = hasUserDims ? userDims : (hasRecommendedDims ? recommendedDims : null);
                      const hasApprovedDims = hasUserDims || hasRecommendedDims;

                      const hasEstimatedDims = analysisData?.dimensions_estimated &&
                        Object.keys(analysisData.dimensions_estimated).length > 0;

                      if (!hasApprovedDims && !hasEstimatedDims) return null;

                      // Build dimensions array for display
                      const dimensionsToDisplay: Array<{ key: string; value: string; tolerance?: string; source: 'approved' | 'estimated' }> = [];

                      if (hasApprovedDims && approvedDims) {
                        // Use approved dimensions (user-set or recommended)
                        if (approvedDims.width) {
                          dimensionsToDisplay.push({ key: 'width', value: `${approvedDims.width.value} ${approvedDims.width.unit}`, tolerance: '±0.5 cm', source: 'approved' });
                        }
                        if (approvedDims.height) {
                          dimensionsToDisplay.push({ key: 'height', value: `${approvedDims.height.value} ${approvedDims.height.unit}`, tolerance: '±0.5 cm', source: 'approved' });
                        }
                        if (approvedDims.length) {
                          dimensionsToDisplay.push({ key: 'depth', value: `${approvedDims.length.value} ${approvedDims.length.unit}`, tolerance: '±0.5 cm', source: 'approved' });
                        }
                        if (approvedDims.weight) {
                          dimensionsToDisplay.push({ key: 'weight', value: `${approvedDims.weight.value} ${approvedDims.weight.unit}`, tolerance: '±50 g', source: 'approved' });
                        }
                        if (approvedDims.volume) {
                          dimensionsToDisplay.push({ key: 'volume', value: `${approvedDims.volume.value} ${approvedDims.volume.unit}`, source: 'approved' });
                        }
                        if (approvedDims.diameter) {
                          dimensionsToDisplay.push({ key: 'diameter', value: `${approvedDims.diameter.value} ${approvedDims.diameter.unit}`, tolerance: '±0.5 cm', source: 'approved' });
                        }
                        // Add additional dimensions
                        if (approvedDims.additionalDimensions) {
                          approvedDims.additionalDimensions.forEach((dim) => {
                            dimensionsToDisplay.push({ key: dim.name, value: `${dim.value} ${dim.unit}`, source: 'approved' });
                          });
                        }
                      } else if (hasEstimatedDims && analysisData?.dimensions_estimated) {
                        // Fall back to AI-estimated dimensions
                        Object.entries(analysisData.dimensions_estimated).forEach(([key, dimension]) => {
                          dimensionsToDisplay.push({
                            key,
                            value: dimension.value,
                            tolerance: dimension.tolerance,
                            source: 'estimated'
                          });
                        });
                      }

                      if (dimensionsToDisplay.length === 0) return null;

                      const isApproved = dimensionsToDisplay[0]?.source === 'approved';
                      const isUserSet = hasUserDims;

                      return (
                        <div>
                          <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            {isApproved ? 'Product Dimensions' : 'Estimated Dimensions'}
                            {isApproved && (
                              <Badge variant="secondary" className={`text-[10px] ${isUserSet ? 'bg-green-100 text-green-700 border-green-300' : 'bg-blue-100 text-blue-700 border-blue-300'}`}>
                                {isUserSet ? 'User Set' : 'Recommended'}
                              </Badge>
                            )}
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {dimensionsToDisplay.map((dim) => (
                              <Card key={dim.key} className="p-4">
                                <p className="text-[10px] text-gray-500 mb-1 capitalize">
                                  {dim.key}
                                </p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                  {dim.value}
                                </p>
                                {dim.tolerance && (
                                  <p className="text-[10px] text-gray-600 dark:text-gray-400">
                                    Tolerance: {dim.tolerance}
                                  </p>
                                )}
                              </Card>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Colors */}
                    {analysisData?.colors_identified && analysisData.colors_identified.length > 0 && (
                      <div>
                        <h5 className="text-xs font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          Colors Identified
                          <Badge variant="secondary" className="text-[10px]">{analysisData.colors_identified.length}</Badge>
                        </h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {analysisData.colors_identified.map((color, idx) => (
                            <Card key={idx} className="p-3">
                              <div className="flex items-center gap-2 mb-2">
                                {color.hex && (
                                  <div
                                    className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600"
                                    style={{ backgroundColor: color.hex }}
                                  />
                                )}
                              </div>
                              <EditableAnalysisField
                                label="Color Name"
                                value={color.name}
                                onSave={(newValue) =>
                                  handleSaveField(
                                    view.revisionId,
                                    `colors_identified.${idx}.name`,
                                    newValue
                                  )
                                }
                                type="text"
                                placeholder="e.g., Navy Blue, White"
                                className="mb-2"
                              />
                              <EditableAnalysisField
                                label="Hex Code"
                                value={color.hex || ''}
                                onSave={(newValue) =>
                                  handleSaveField(
                                    view.revisionId,
                                    `colors_identified.${idx}.hex`,
                                    newValue
                                  )
                                }
                                type="text"
                                placeholder="#RRGGBB"
                                className="mb-2"
                              />
                              <p className="text-[10px] text-gray-600 dark:text-gray-400">
                                Location: {color.location}
                              </p>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Construction Details */}
                    {analysisData?.construction_details && typeof analysisData.construction_details === 'object' && !Array.isArray(analysisData.construction_details) && (
                      (analysisData.construction_details.construction_method && analysisData.construction_details.construction_method !== 'Unknown') ||
                      (analysisData.construction_details.seam_type && analysisData.construction_details.seam_type !== 'Not visible') ||
                      (analysisData.construction_details.stitching_details && analysisData.construction_details.stitching_details !== 'Not visible') ||
                      (analysisData.construction_details.edge_finishing && analysisData.construction_details.edge_finishing !== 'Not visible') ||
                      (analysisData.construction_details.reinforcement && analysisData.construction_details.reinforcement !== 'Not visible') ||
                      (analysisData.construction_details.special_features && analysisData.construction_details.special_features.length > 0)
                    ) && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                          Construction Details
                        </h5>
                        <Card className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {analysisData.construction_details.construction_method && analysisData.construction_details.construction_method !== 'Unknown' && (
                              <div>
                                <p className="text-[10px] text-gray-500 mb-1">Construction Method</p>
                                <p className="text-xs font-medium text-gray-900 dark:text-white">
                                  {analysisData.construction_details.construction_method}
                                </p>
                              </div>
                            )}
                            {analysisData.construction_details.seam_type && analysisData.construction_details.seam_type !== 'Not visible' && (
                              <div>
                                <p className="text-[10px] text-gray-500 mb-1">Seam Type</p>
                                <p className="text-xs font-medium text-gray-900 dark:text-white">
                                  {analysisData.construction_details.seam_type}
                                </p>
                              </div>
                            )}
                            {analysisData.construction_details.stitching_details && analysisData.construction_details.stitching_details !== 'Not visible' && (
                              <div>
                                <p className="text-[10px] text-gray-500 mb-1">Stitching Details</p>
                                <p className="text-xs font-medium text-gray-900 dark:text-white">
                                  {analysisData.construction_details.stitching_details}
                                </p>
                              </div>
                            )}
                            {analysisData.construction_details.edge_finishing && analysisData.construction_details.edge_finishing !== 'Not visible' && (
                              <div>
                                <p className="text-[10px] text-gray-500 mb-1">Edge Finishing</p>
                                <p className="text-xs font-medium text-gray-900 dark:text-white">
                                  {analysisData.construction_details.edge_finishing}
                                </p>
                              </div>
                            )}
                            {analysisData.construction_details.reinforcement && analysisData.construction_details.reinforcement !== 'Not visible' && (
                              <div>
                                <p className="text-[10px] text-gray-500 mb-1">Reinforcement</p>
                                <p className="text-xs font-medium text-gray-900 dark:text-white">
                                  {analysisData.construction_details.reinforcement}
                                </p>
                              </div>
                            )}
                            {analysisData.construction_details.special_features && analysisData.construction_details.special_features.length > 0 && (
                              <div className="md:col-span-2">
                                <p className="text-[10px] text-gray-500 mb-2">Special Features</p>
                                <div className="flex flex-wrap gap-1">
                                  {analysisData.construction_details.special_features.map((feature, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-[10px]">
                                      {feature}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </Card>
                      </div>
                    )}

                    {/* Hardware and Trims */}
                    {analysisData?.hardware_and_trims && analysisData.hardware_and_trims.length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          Hardware & Trims
                          <Badge variant="secondary" className="text-[10px]">{analysisData.hardware_and_trims.length}</Badge>
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {analysisData.hardware_and_trims.map((hardware, idx) => (
                            <Card key={idx} className="p-4">
                              <div className="space-y-2">
                                {hardware.type && (
                                  <div>
                                    <p className="text-[10px] text-gray-500">Type</p>
                                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                                      {hardware.type}
                                    </p>
                                  </div>
                                )}
                                {hardware.material && (
                                  <div>
                                    <p className="text-[10px] text-gray-500">Material</p>
                                    <p className="text-xs text-gray-700 dark:text-gray-300">
                                      {hardware.material}
                                    </p>
                                  </div>
                                )}
                                <div className="flex gap-2">
                                  {hardware.finish && (
                                    <Badge variant="outline" className="text-[10px]">
                                      {hardware.finish}
                                    </Badge>
                                  )}
                                  {hardware.placement && (
                                    <Badge variant="secondary" className="text-[10px]">
                                      {hardware.placement}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quality Indicators */}
                    {analysisData?.quality_indicators && (
                      analysisData.quality_indicators.overall_quality ||
                      analysisData.quality_indicators.craftsmanship ||
                      analysisData.quality_indicators.finish_quality ||
                      analysisData.quality_indicators.attention_to_detail ||
                      (analysisData.quality_indicators.visible_defects && analysisData.quality_indicators.visible_defects.length > 0)
                    ) && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                          Quality Indicators
                        </h5>
                        <Card className="p-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {analysisData.quality_indicators.overall_quality && (
                              <div>
                                <p className="text-[10px] text-gray-500 mb-1">Overall Quality</p>
                                <Badge variant="default" className="text-[10px] capitalize">
                                  {analysisData.quality_indicators.overall_quality}
                                </Badge>
                              </div>
                            )}
                            {analysisData.quality_indicators.craftsmanship && (
                              <div>
                                <p className="text-[10px] text-gray-500 mb-1">Craftsmanship</p>
                                <Badge variant="default" className="text-[10px] capitalize">
                                  {analysisData.quality_indicators.craftsmanship}
                                </Badge>
                              </div>
                            )}
                            {analysisData.quality_indicators.finish_quality && (
                              <div>
                                <p className="text-[10px] text-gray-500 mb-1">Finish Quality</p>
                                <Badge variant="default" className="text-[10px] capitalize">
                                  {analysisData.quality_indicators.finish_quality}
                                </Badge>
                              </div>
                            )}
                            {analysisData.quality_indicators.attention_to_detail && (
                              <div>
                                <p className="text-[10px] text-gray-500 mb-1">Attention to Detail</p>
                                <Badge variant="default" className="text-[10px] capitalize">
                                  {analysisData.quality_indicators.attention_to_detail}
                                </Badge>
                              </div>
                            )}
                          </div>
                          {analysisData.quality_indicators.visible_defects && analysisData.quality_indicators.visible_defects.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <p className="text-[10px] text-gray-500 mb-2">Visible Defects</p>
                              <div className="flex flex-wrap gap-1">
                                {analysisData.quality_indicators.visible_defects.map((defect, idx) => (
                                  <Badge key={idx} variant="destructive" className="text-[10px]">
                                    {defect}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </Card>
                      </div>
                    )}

                    {/* Cost Estimation */}
                    {analysisData?.cost_estimation && (
                      (analysisData.cost_estimation.material_cost_range && analysisData.cost_estimation.material_cost_range !== 'Not estimated') ||
                      analysisData.cost_estimation.complexity ||
                      analysisData.cost_estimation.production_difficulty ||
                      (analysisData.cost_estimation.estimated_production_time && analysisData.cost_estimation.estimated_production_time !== 'Not estimated')
                    ) && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                          Cost Estimation
                        </h5>
                        <Card className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {analysisData.cost_estimation.material_cost_range && analysisData.cost_estimation.material_cost_range !== 'Not estimated' && (
                              <div>
                                <p className="text-[10px] text-gray-500 mb-1">Material Cost Range</p>
                                <p className="text-xs font-medium text-gray-900 dark:text-white">
                                  {analysisData.cost_estimation.material_cost_range}
                                </p>
                              </div>
                            )}
                            {analysisData.cost_estimation.complexity && (
                              <div>
                                <p className="text-[10px] text-gray-500 mb-1">Complexity</p>
                                <Badge variant="secondary" className="text-[10px] capitalize">
                                  {analysisData.cost_estimation.complexity}
                                </Badge>
                              </div>
                            )}
                            {analysisData.cost_estimation.production_difficulty && (
                              <div>
                                <p className="text-[10px] text-gray-500 mb-1">Production Difficulty</p>
                                <Badge variant="secondary" className="text-[10px] capitalize">
                                  {analysisData.cost_estimation.production_difficulty}
                                </Badge>
                              </div>
                            )}
                            {analysisData.cost_estimation.estimated_production_time && analysisData.cost_estimation.estimated_production_time !== 'Not estimated' && (
                              <div>
                                <p className="text-[10px] text-gray-500 mb-1">Estimated Production Time</p>
                                <p className="text-xs font-medium text-gray-900 dark:text-white">
                                  {analysisData.cost_estimation.estimated_production_time}
                                </p>
                              </div>
                            )}
                          </div>
                        </Card>
                      </div>
                    )}

                    {/* Key Features */}
                    {analysisData?.key_features && analysisData.key_features.length > 0 && (
                      <div>
                        <h5 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
                          Key Features
                        </h5>
                        <div className="flex flex-wrap gap-1">
                          {analysisData.key_features.map((feature, idx) => (
                            <Badge key={idx} variant="secondary" className="text-[10px]">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Measurements */}
                    {analysisData?.measurements && Object.keys(analysisData.measurements).length > 0 && (
                      <div>
                        <h5 className="text-xs font-semibold text-gray-900 dark:text-white mb-3">
                          Measurements
                        </h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {Object.entries(analysisData.measurements).map(([key, measurement]) => (
                            <Card key={key} className="p-2">
                              <p className="text-[10px] text-gray-600 dark:text-gray-400 mb-1">
                                {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                              </p>
                              <p className="text-xs font-semibold text-gray-900 dark:text-white">
                                {measurement.value} {measurement.unit}
                              </p>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

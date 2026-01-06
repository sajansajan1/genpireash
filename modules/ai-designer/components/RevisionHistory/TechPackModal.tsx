/**
 * TechPackModal component for displaying comprehensive tech pack details
 */

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Package, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MultiViewRevision } from '../../types';
import { formatTextWithUrls } from '@/lib/utils/format-urls';
import { renderValue } from '@/app/product/shared/utils';

interface TechPackModalProps {
  revision: MultiViewRevision | null;
  techPack: any;
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
}

export function TechPackModal({
  revision,
  techPack,
  isOpen,
  onClose,
  isLoading,
}: TechPackModalProps) {
  if (!revision) return null;

  // Debug logging
  React.useEffect(() => {
    if (techPack && isOpen) {
      console.log('🎨 TechPack Data Structure:', {
        productName: techPack.productName,
        hasColors: !!techPack.colors,
        colorsType: techPack.colors ? typeof techPack.colors : 'none',
        colorsKeys: techPack.colors && typeof techPack.colors === 'object' ? Object.keys(techPack.colors) : [],
        hasDimensions: !!techPack.dimensions,
        dimensionsType: techPack.dimensions ? typeof techPack.dimensions : 'none',
        dimensionsKeys: techPack.dimensions && typeof techPack.dimensions === 'object' ? Object.keys(techPack.dimensions) : [],
        allKeys: Object.keys(techPack)
      });
      console.log('🎨 Full TechPack Object:', techPack);
    }
  }, [techPack, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Package className="h-5 w-5 text-green-700" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Tech Pack - Revision #{revision.revisionNumber}
                      </h3>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {formatTextWithUrls(revision.editPrompt || 'Original Design')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <ScrollArea className="flex-1 overflow-y-auto">
                <div className="px-6 py-4 space-y-6">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : techPack ? (
                    <>
                      {/* Product Overview */}
                      {techPack.productName && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Product Name</h4>
                          <p className="text-sm text-gray-700">{techPack.productName}</p>
                        </div>
                      )}

                      {techPack.productOverview && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Product Overview</h4>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {typeof techPack.productOverview === 'string'
                              ? techPack.productOverview
                              : renderValue(techPack.productOverview)}
                          </p>
                        </div>
                      )}

                      {/* Colors */}
                      {techPack.colors && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-3">Colors</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {(() => {
                              let colors: any[] = [];

                              // Handle different color structures
                              if (Array.isArray(techPack.colors)) {
                                colors = techPack.colors;
                              } else if (typeof techPack.colors === 'object') {
                                // Check for primaryColors and accentColors structure
                                if (techPack.colors.primaryColors || techPack.colors.accentColors) {
                                  colors = [
                                    ...(techPack.colors.primaryColors || []),
                                    ...(techPack.colors.accentColors || [])
                                  ];
                                } else if (techPack.colors.palette) {
                                  colors = techPack.colors.palette;
                                } else {
                                  // Extract any arrays from the colors object
                                  colors = Object.values(techPack.colors).filter((v: any) =>
                                    Array.isArray(v) || (typeof v === 'object' && v !== null && (v.hex || v.name))
                                  ).flat();
                                }
                              }

                              // Filter out non-color objects (like styleNotes, trendAlignment)
                              colors = colors.filter((c: any) =>
                                typeof c === 'string' || (typeof c === 'object' && c !== null && (c.hex || c.name || c.value))
                              );

                              return colors.map((color: any, idx: number) => {
                                const colorHex = typeof color === 'string' ? color : (color.hex || color.value || '#cccccc');
                                const colorName = typeof color === 'string' ? `Color ${idx + 1}` : (color.name || color.label || `Color ${idx + 1}`);

                                return (
                                  <div key={idx} className="flex items-center gap-2 p-2 rounded-lg border border-gray-200">
                                    <div
                                      className="w-8 h-8 rounded-md border border-gray-300 flex-shrink-0"
                                      style={{ backgroundColor: colorHex }}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="text-xs font-medium text-gray-900 truncate">
                                        {colorName}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {colorHex}
                                      </div>
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                          {/* Display style notes if available */}
                          {techPack.colors.styleNotes && (
                            <p className="text-xs text-gray-600 mt-3 italic">{techPack.colors.styleNotes}</p>
                          )}
                          {techPack.colors.trendAlignment && (
                            <p className="text-xs text-gray-600 mt-1 italic">{techPack.colors.trendAlignment}</p>
                          )}
                        </div>
                      )}

                      {/* Materials */}
                      {techPack.materials && techPack.materials.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-3">Materials</h4>
                          <div className="space-y-2">
                            {techPack.materials.map((material: any, idx: number) => {
                              // Handle both string and object materials
                              const materialName = typeof material === 'string'
                                ? material
                                : (material.name || material.material || material.component || 'Material');
                              const materialDetails = typeof material === 'object'
                                ? (material.details || material.specification || material.notes)
                                : null;
                              const percentage = typeof material === 'object' ? material.percentage : null;

                              return (
                                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900">
                                      {materialName}
                                    </div>
                                    {percentage && (
                                      <div className="text-xs text-gray-600 mt-1">
                                        {percentage}%
                                      </div>
                                    )}
                                    {materialDetails && (
                                      <div className="text-xs text-gray-600 mt-1">
                                        {String(materialDetails)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Dimensions */}
                      {techPack.dimensions && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-3">Dimensions</h4>
                          <div className="grid grid-cols-2 gap-3">
                            {(() => {
                              let dimensions: any[] = [];

                              // Handle different dimension structures
                              if (techPack.dimensions.details && Array.isArray(techPack.dimensions.details)) {
                                // Structure: { details: [{ width: {value, tolerance}, height: {...}, ... }] }
                                const detailsObj = techPack.dimensions.details[0];
                                if (detailsObj && typeof detailsObj === 'object') {
                                  dimensions = Object.entries(detailsObj).map(([key, value]: [string, any]) => ({
                                    type: key,
                                    value: value.value || value,
                                    tolerance: value.tolerance || null,
                                    unit: ''
                                  }));
                                }
                              } else if (techPack.dimensions.measurements) {
                                dimensions = techPack.dimensions.measurements;
                              } else if (Array.isArray(techPack.dimensions)) {
                                dimensions = techPack.dimensions;
                              } else if (typeof techPack.dimensions === 'object') {
                                // Convert object to array
                                dimensions = Object.entries(techPack.dimensions)
                                  .filter(([key]) => key !== 'details' && key !== 'measurements')
                                  .map(([key, value]: [string, any]) => ({
                                    type: key,
                                    value: typeof value === 'object' ? value.value : value,
                                    unit: typeof value === 'object' ? value.unit : '',
                                    tolerance: typeof value === 'object' ? value.tolerance : null
                                  }));
                              }

                              return dimensions.map((dim: any, idx: number) => (
                                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                                  <div className="text-xs font-medium text-gray-600 capitalize">
                                    {dim.type || dim.name || dim.label || 'Dimension'}
                                  </div>
                                  <div className="text-sm font-semibold text-gray-900 mt-1">
                                    {dim.value || dim.measurement || dim.size} {dim.unit || ''}
                                  </div>
                                  {dim.tolerance && (
                                    <div className="text-xs text-gray-500 mt-0.5">
                                      Tolerance: {dim.tolerance}
                                    </div>
                                  )}
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      )}

                      {/* Size Range */}
                      {techPack.sizeRange && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Size Range</h4>
                          {typeof techPack.sizeRange === 'string' ? (
                            <p className="text-sm text-gray-700">{techPack.sizeRange}</p>
                          ) : (
                            <>
                              <div className="flex flex-wrap gap-2">
                                {(Array.isArray(techPack.sizeRange) ? techPack.sizeRange : techPack.sizeRange.sizes || []).map((size: any, idx: number) => (
                                  <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                                    {typeof size === 'string' ? size : size.name}
                                  </span>
                                ))}
                              </div>
                              {techPack.sizeRange.description && (
                                <p className="text-xs text-gray-600 mt-2">{techPack.sizeRange.description}</p>
                              )}
                            </>
                          )}
                        </div>
                      )}

                      {/* Additional sections */}
                      {techPack.qualityStandards && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Quality Standards</h4>
                          {typeof techPack.qualityStandards === 'string' ? (
                            <p className="text-sm text-gray-700 leading-relaxed">{techPack.qualityStandards}</p>
                          ) : (
                            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                              {Array.isArray(techPack.qualityStandards) ? (
                                techPack.qualityStandards.map((standard: string, idx: number) => (
                                  <li key={idx}>{standard}</li>
                                ))
                              ) : (
                                <li>{String(techPack.qualityStandards)}</li>
                              )}
                            </ul>
                          )}
                        </div>
                      )}

                      {techPack.careInstructions && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Care Instructions</h4>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {typeof techPack.careInstructions === 'string'
                              ? techPack.careInstructions
                              : renderValue(techPack.careInstructions)}
                          </p>
                        </div>
                      )}

                      {techPack.productionNotes && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Production Notes</h4>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {typeof techPack.productionNotes === 'string'
                              ? techPack.productionNotes
                              : renderValue(techPack.productionNotes)}
                          </p>
                        </div>
                      )}

                      {/* Price */}
                      {techPack.price && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Price</h4>
                          <p className="text-lg font-bold text-green-600">{techPack.price}</p>
                        </div>
                      )}

                      {/* Estimated Lead Time */}
                      {techPack.estimatedLeadTime && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Estimated Lead Time</h4>
                          <p className="text-sm text-gray-700">{techPack.estimatedLeadTime}</p>
                        </div>
                      )}

                      {/* Category/Subcategory */}
                      {techPack.category_Subcategory && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Category</h4>
                          <p className="text-sm text-gray-700">{techPack.category_Subcategory}</p>
                        </div>
                      )}

                      {/* Hardware Components */}
                      {techPack.hardwareComponents && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-3">Hardware Components</h4>
                          {techPack.hardwareComponents.description && (
                            <p className="text-sm text-gray-700 mb-3">{techPack.hardwareComponents.description}</p>
                          )}
                          {techPack.hardwareComponents.hardware && (
                            <div className="flex flex-wrap gap-2">
                              {techPack.hardwareComponents.hardware.map((hw: string, idx: number) => (
                                <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                                  {hw}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Construction Details */}
                      {techPack.constructionDetails && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-3">Construction Details</h4>
                          {techPack.constructionDetails.description && (
                            <p className="text-sm text-gray-700 mb-3">{techPack.constructionDetails.description}</p>
                          )}
                          {techPack.constructionDetails.constructionFeatures && (
                            <div className="space-y-2">
                              {techPack.constructionDetails.constructionFeatures.map((feature: any, idx: number) => (
                                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                                  <div className="text-sm font-medium text-gray-900">{feature.featureName}</div>
                                  <div className="text-xs text-gray-600 mt-1">{feature.details}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Labels */}
                      {techPack.labels && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-3">Labels & Branding</h4>
                          <div className="space-y-2 text-sm">
                            {techPack.labels.labelType && (
                              <div className="flex gap-2">
                                <span className="font-medium text-gray-700 min-w-[120px]">Label Type:</span>
                                <span className="text-gray-600">{techPack.labels.labelType}</span>
                              </div>
                            )}
                            {techPack.labels.placement && (
                              <div className="flex gap-2">
                                <span className="font-medium text-gray-700 min-w-[120px]">Placement:</span>
                                <span className="text-gray-600">{techPack.labels.placement}</span>
                              </div>
                            )}
                            {techPack.labels.dimensions && (
                              <div className="flex gap-2">
                                <span className="font-medium text-gray-700 min-w-[120px]">Dimensions:</span>
                                <span className="text-gray-600">{techPack.labels.dimensions}</span>
                              </div>
                            )}
                            {techPack.labels.content && (
                              <div className="mt-2">
                                <span className="font-medium text-gray-700">Content:</span>
                                <p className="text-gray-600 mt-1">{techPack.labels.content}</p>
                              </div>
                            )}
                            {techPack.labels.logo && (
                              <div className="flex gap-2">
                                <span className="font-medium text-gray-700 min-w-[120px]">Logo:</span>
                                <span className="text-gray-600">{techPack.labels.logo}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Packaging */}
                      {techPack.packaging && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-3">Packaging</h4>
                          {techPack.packaging.description && (
                            <p className="text-sm text-gray-700 mb-3">{techPack.packaging.description}</p>
                          )}
                          {techPack.packaging.packagingDetails && (
                            <div className="space-y-2 text-sm">
                              {techPack.packaging.packagingDetails.packagingType && (
                                <div className="flex gap-2">
                                  <span className="font-medium text-gray-700 min-w-[150px]">Type:</span>
                                  <span className="text-gray-600">{techPack.packaging.packagingDetails.packagingType}</span>
                                </div>
                              )}
                              {techPack.packaging.packagingDetails.materialSpec && (
                                <div className="flex gap-2">
                                  <span className="font-medium text-gray-700 min-w-[150px]">Material:</span>
                                  <span className="text-gray-600">{techPack.packaging.packagingDetails.materialSpec}</span>
                                </div>
                              )}
                              {techPack.packaging.packagingDetails.innerPackaging && (
                                <div className="flex gap-2">
                                  <span className="font-medium text-gray-700 min-w-[150px]">Inner Packaging:</span>
                                  <span className="text-gray-600">{techPack.packaging.packagingDetails.innerPackaging}</span>
                                </div>
                              )}
                              {techPack.packaging.packagingDetails.closureType && (
                                <div className="flex gap-2">
                                  <span className="font-medium text-gray-700 min-w-[150px]">Closure Type:</span>
                                  <span className="text-gray-600">{techPack.packaging.packagingDetails.closureType}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Production Logistics */}
                      {techPack.productionLogistics && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-3">Production Logistics</h4>
                          <div className="space-y-2 text-sm">
                            {techPack.productionLogistics.MOQ && (
                              <div className="flex gap-2">
                                <span className="font-medium text-gray-700 min-w-[180px]">MOQ:</span>
                                <span className="text-gray-600">{techPack.productionLogistics.MOQ}</span>
                              </div>
                            )}
                            {techPack.productionLogistics.leadTime && (
                              <div className="flex gap-2">
                                <span className="font-medium text-gray-700 min-w-[180px]">Lead Time:</span>
                                <span className="text-gray-600">{techPack.productionLogistics.leadTime}</span>
                              </div>
                            )}
                            {techPack.productionLogistics.sampleRequirements && (
                              <div className="flex gap-2">
                                <span className="font-medium text-gray-700 min-w-[180px]">Sample Requirements:</span>
                                <span className="text-gray-600">{techPack.productionLogistics.sampleRequirements}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Cost & Income Estimation */}
                      {techPack.costIncomeEstimation && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-3">Cost & Income Estimation</h4>

                          {/* Sample Creation Cost */}
                          {techPack.costIncomeEstimation.sampleCreationCost && (
                            <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                              <div className="font-medium text-gray-900 mb-2">Sample Creation Cost</div>
                              <div className="text-lg font-bold text-yellow-700 mb-2">
                                {techPack.costIncomeEstimation.sampleCreationCost.range}
                              </div>
                              {techPack.costIncomeEstimation.sampleCreationCost.breakdown && (
                                <div className="space-y-1 text-xs text-gray-600">
                                  {Object.entries(techPack.costIncomeEstimation.sampleCreationCost.breakdown).map(([key, value]: [string, any]) => (
                                    <div key={key} className="flex justify-between">
                                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                      <span className="font-medium">{value}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {techPack.costIncomeEstimation.sampleCreationCost.notes && (
                                <p className="text-xs text-gray-600 mt-2 italic">{techPack.costIncomeEstimation.sampleCreationCost.notes}</p>
                              )}
                            </div>
                          )}

                          {/* Bulk Production Cost */}
                          {techPack.costIncomeEstimation.bulkProduction1000 && (
                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                              <div className="font-medium text-gray-900 mb-2">Bulk Production (1000 units)</div>
                              <div className="text-lg font-bold text-green-700 mb-1">
                                Total: {techPack.costIncomeEstimation.bulkProduction1000.totalCostRange}
                              </div>
                              <div className="text-sm text-green-600 mb-3">
                                Per Unit: {techPack.costIncomeEstimation.bulkProduction1000.perUnitCostRange}
                              </div>
                              {techPack.costIncomeEstimation.bulkProduction1000.breakdown && (
                                <div className="space-y-1 text-xs text-gray-600">
                                  {Object.entries(techPack.costIncomeEstimation.bulkProduction1000.breakdown).map(([key, value]: [string, any]) => (
                                    <div key={key} className="flex justify-between">
                                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                      <span className="font-medium">{value}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {techPack.costIncomeEstimation.bulkProduction1000.economiesOfScaleNote && (
                                <p className="text-xs text-gray-600 mt-2 italic">{techPack.costIncomeEstimation.bulkProduction1000.economiesOfScaleNote}</p>
                              )}
                            </div>
                          )}

                          {techPack.costIncomeEstimation.productionGuidance && (
                            <p className="text-xs text-gray-600 mt-3 italic">{techPack.costIncomeEstimation.productionGuidance}</p>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>No tech pack data available</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Tech Pack V2 Type Definitions
 * Comprehensive TypeScript types for the Tech Pack system
 */

// ============================================================================
// CATEGORY TYPES
// ============================================================================

export type ProductCategory = "APPAREL" | "FOOTWEAR" | "BAGS" | "FURNITURE" | "JEWELRY";

export type ViewType = "front" | "back" | "side" | "top" | "bottom" | "detail" | "other";

// ============================================================================
// CATEGORY DETECTION
// ============================================================================

export interface CategoryDetectionResult {
  category: ProductCategory;
  subcategory: string;
  confidence: number;
  reasoning: string;
}

// ============================================================================
// BASE VIEW ANALYSIS
// ============================================================================

export interface BaseViewAnalysis {
  view_type: ViewType;
  // Product identification (for legacy schema normalization)
  product_category?: string;
  product_subcategory?: string;
  product_type?: string;
  product_details?: ProductDetails;
  // Category-specific details
  garment_details?: ApparelDetails;
  footwear_details?: FootwearDetails;
  bag_details?: BagDetails;
  furniture_details?: FurnitureDetails;
  jewelry_details?: JewelryDetails;
  design_elements: DesignElements;
  materials_detected: MaterialInfo[];
  colors_and_patterns: ColorAnalysis;
  dimensions_estimated: DimensionInfo;
  construction_details: ConstructionDetails;
  hardware_and_trims?: HardwareInfo[];
  quality_indicators: QualityMetrics;
  manufacturing_notes: string[];
  cost_estimation?: CostEstimation;
  confidence_scores: ConfidenceScores;
  analysis_notes?: string;
}

export interface ProductDetails {
  style?: string;
  intended_use?: string;
  target_market?: string;
  [key: string]: any;
}

export interface CostEstimation {
  material_cost_range?: string;
  complexity?: string;
  production_difficulty?: string;
  estimated_production_time?: string;
}

// Category-specific details
export interface ApparelDetails {
  type: string;
  silhouette: string;
  fit_type: string;
  gender: string;
  season: string;
}

export interface FootwearDetails {
  type: string;
  style: string;
  gender: string;
  season: string;
  activity: string;
}

export interface BagDetails {
  type: string;
  style: string;
  gender: string;
  capacity_estimate: string;
  primary_use: string;
}

export interface FurnitureDetails {
  type: string;
  style: string;
  room: string;
  usage: string;
}

export interface JewelryDetails {
  type: string;
  style: string;
  gender: string;
  occasion: string;
}

export interface DesignElements {
  neckline?: string;
  sleeves?: string;
  closure_type?: string;
  hemline?: string;
  pockets?: PocketInfo[];
  [key: string]: any; // Allow category-specific fields
}

export interface PocketInfo {
  type: string;
  location: string;
  quantity: number;
}

export interface MaterialInfo {
  component: string;
  material_type: string;
  estimated_weight?: string;
  texture?: string;
  finish?: string;
  percentage?: string;
  spec?: string;
}

export interface ColorAnalysis {
  primary_color: ColorInfo;
  secondary_colors: ColorInfo[];
  pattern_type: string;
  print_details?: string;
  finish?: string;
}

export interface ColorInfo {
  name: string;
  hex: string;
  pantone?: string;
}

export interface DimensionInfo {
  [key: string]: MeasurementDetail;
}

export interface MeasurementDetail {
  value: string;
  tolerance?: string;
  measurement_point?: string;
}

export interface ConstructionDetails {
  seam_type: string;
  stitching_visible: boolean;
  stitch_count?: string;
  hem_finish?: string;
  special_features: string[];
}

export interface HardwareInfo {
  type: string;
  material: string;
  finish: string;
  color: string;
  quantity: number;
  size?: string;
}

export interface QualityMetrics {
  overall_quality: string;
  finish_quality: string;
  attention_to_detail: string;
}

export interface ConfidenceScores {
  overall: number;
  materials: number;
  dimensions: number;
  construction: number;
}

// ============================================================================
// COMPONENT/INGREDIENT ANALYSIS
// ============================================================================

export interface ComponentAnalysisPlan {
  component_categories: ComponentCategory[];
  bill_of_materials_summary: BOMSummary;
  manufacturing_requirements: ManufacturingRequirements;
  factory_sourcing_guide: FactorySourcingGuide;
}

export interface ComponentCategory {
  category_name: string;
  components: ComponentItem[];
  category_total_components: number;
  category_priority: "high" | "medium" | "low";
}

export interface ComponentItem {
  component_id: string;
  component_name: string;
  description: string;
  material_specification: string;
  quantity_per_unit: string;
  dimensions?: string;
  color_finish?: string;
  supplier_specs?: string;
  estimated_cost?: string;
  critical_for_quality: boolean;
  sourcing_difficulty: "easy" | "moderate" | "difficult";
  alternatives_available: boolean;
  manufacturing_notes?: string;
}

export interface BOMSummary {
  total_unique_components: number;
  total_material_types: number;
  estimated_total_material_cost: string;
  critical_components_count: number;
  sourcing_complexity: "simple" | "moderate" | "complex";
}

export interface ManufacturingRequirements {
  special_materials: string[];
  quality_control_checkpoints: string[];
  storage_requirements: string[];
  lead_time_considerations: string[];
}

export interface FactorySourcingGuide {
  recommended_suppliers: string[];
  bulk_ordering_notes: string;
  quality_testing: string;
  cost_optimization: string;
}

export interface ComponentSummary {
  executive_summary: ExecutiveSummary;
  bill_of_materials: BillOfMaterials;
  material_specifications: MaterialSpecifications;
  sourcing_guide: SourcingGuide;
  quality_control_checkpoints: QualityCheckpoint[];
  cost_breakdown: CostBreakdown;
  procurement_recommendations: ProcurementRecommendations;
  manufacturing_notes: ManufacturingNotes;
  alternative_components: AlternativeComponent[];
  sustainability_notes: SustainabilityNotes;
}

export interface ExecutiveSummary {
  total_components: number;
  component_categories: number;
  estimated_unit_cost: string;
  sourcing_complexity: "simple" | "moderate" | "complex";
  manufacturing_difficulty: "easy" | "moderate" | "difficult";
  quality_critical_components: number;
}

export interface BillOfMaterials {
  primary_materials: BOMItem[];
  hardware_fasteners: BOMItem[];
  trims_finishing: BOMItem[];
  packaging_materials: BOMItem[];
}

export interface BOMItem {
  item_number: string;
  description: string;
  specification: string;
  quantity: string;
  unit: string;
  unit_cost: string;
  total_cost: string;
  supplier_reference: string;
  lead_time: string;
}

export interface MaterialSpecifications {
  fabrics_textiles?: FabricSpec[];
  hardware_specs?: HardwareSpec[];
  special_materials?: SpecialMaterialSpec[];
}

export interface FabricSpec {
  material_name: string;
  composition: string;
  weight: string;
  width: string;
  finish: string;
  color: string;
  supplier_grade: string;
  testing_requirements: string[];
  usage_area: string;
}

export interface HardwareSpec {
  hardware_type: string;
  material: string;
  finish: string;
  size: string;
  standard: string;
  quantity: string;
  supplier_reference: string;
}

export interface SpecialMaterialSpec {
  material_name: string;
  specification: string;
  purpose: string;
  supplier_notes: string;
}

export interface SourcingGuide {
  easy_to_source: SourcingItem[];
  moderate_sourcing: SourcingItem[];
  difficult_to_source: SourcingItem[];
  custom_components: SourcingItem[];
}

export interface SourcingItem {
  component: string;
  availability: string;
  typical_suppliers: string[];
  cost_range: string;
}

export interface QualityCheckpoint {
  checkpoint_id: string;
  stage: string;
  component_checked: string;
  inspection_method: string;
  acceptance_criteria: string;
  critical_for_quality: boolean;
}

export interface CostBreakdown {
  materials_total: string;
  hardware_total: string;
  trims_total: string;
  packaging_total: string;
  estimated_labor: string;
  total_estimated_cost: string;
  cost_optimization_opportunities: string[];
}

export interface ProcurementRecommendations {
  bulk_ordering: BulkOrdering;
  inventory_management: InventoryManagement;
  supplier_management: SupplierManagement;
}

export interface BulkOrdering {
  recommended_quantities: Record<string, string>;
  bulk_pricing_notes: string;
}

export interface InventoryManagement {
  fast_moving_items: string[];
  lead_time_items: string[];
  just_in_time_items: string[];
}

export interface SupplierManagement {
  recommended_supplier_types: string[];
  quality_certifications_required: string[];
  payment_terms: string;
}

export interface ManufacturingNotes {
  material_preparation: string[];
  storage_requirements: string[];
  handling_precautions: string[];
  waste_reduction_tips: string[];
}

export interface AlternativeComponent {
  original_component: string;
  alternative_1: Alternative;
  alternative_2?: Alternative;
  recommendation: string;
}

export interface Alternative {
  description: string;
  cost_impact: string;
  quality_impact: string;
  availability: string;
}

export interface SustainabilityNotes {
  eco_friendly_options: string[];
  recyclable_components: string[];
  certifications: string[];
}

// ============================================================================
// CLOSE-UP ANALYSIS
// ============================================================================

export interface CloseUpPlan {
  closeup_shots: CloseUpShot[];
  shot_guidelines: ShotGuidelines;
  total_shots_recommended: number;
  estimated_coverage: string;
}

export interface CloseUpShot {
  shot_number: number;
  shot_name: string;
  target_area: string;
  purpose: string;
  image_generation_prompt: string;
  analysis_focus: string[];
  critical_for_manufacturing: boolean;
  priority: "high" | "medium" | "low";
}

export interface ShotGuidelines {
  lighting: string;
  angle: string;
  distance: string;
  background: string;
}

export interface CloseUpAnalysis {
  shot_name: string;
  detailed_observations: DetailedObservations;
  manufacturing_specifications: ManufacturingSpecs;
  quality_control_checkpoints: string[];
  comparison_to_standards: StandardsComparison;
  confidence_score: number;
}

export interface DetailedObservations {
  material_details: MaterialDetails;
  construction_details: ConstructionDetailAnalysis;
  hardware_specifications?: HardwareSpecs;
  measurements_visible: MeasurementObservation[];
  quality_observations: QualityObservations;
  color_analysis: ColorDetailAnalysis;
  functional_features: string[];
}

export interface MaterialDetails {
  texture: string;
  weave_pattern?: string;
  fiber_visibility: string;
  finish: string;
  quality_grade: string;
}

export interface ConstructionDetailAnalysis {
  seam_type: string;
  stitch_type: string;
  stitch_count_per_inch?: string;
  seam_allowance?: string;
  edge_finishing: string;
  reinforcement?: string;
}

export interface HardwareSpecs {
  type: string;
  material: string;
  finish: string;
  size?: string;
  brand?: string;
  installation_method: string;
  quality_indicators: string;
}

export interface MeasurementObservation {
  element: string;
  value: string;
  tolerance: string;
  measurement_method: string;
}

export interface QualityObservations {
  stitch_quality: string;
  alignment: string;
  finish_quality: string;
  defects_visible: string[];
  overall_workmanship: string;
}

export interface ColorDetailAnalysis {
  dominant_color: ColorInfo;
  color_consistency: string;
  finish: string;
}

export interface ManufacturingSpecs {
  recommended_thread: string;
  needle_size: string;
  special_equipment: string[];
  assembly_notes: string[];
}

export interface StandardsComparison {
  industry_standard_met: boolean;
  quality_level: string;
  notes: string;
}

// ============================================================================
// TECHNICAL SKETCHES
// ============================================================================

export interface TechnicalSketchPrompt {
  sketch_prompt: string;
  negative_prompt: string;
  technical_requirements: TechnicalRequirements;
  sketch_specifications: SketchSpecifications;
}

export interface TechnicalRequirements {
  style: string;
  line_weight: string;
  background: string;
  orientation: string;
  details_visible: string[];
}

export interface SketchSpecifications {
  view_angle: string;
  scale: string;
  detail_level: string;
  line_style: string;
}

export interface CallOutData {
  callouts: CallOut[];
  callout_layout: CallOutLayout;
  visual_guidelines: VisualGuidelines;
}

export interface CallOut {
  callout_number: number;
  feature_name: string;
  location: string;
  specification: string;
  measurement?: string;
  material?: string;
  construction_note?: string;
  critical: boolean;
  category: "dimension" | "material" | "construction" | "hardware" | "finishing";
}

export interface CallOutLayout {
  total_callouts: number;
  placement_recommendations: {
    top: number[];
    sides: number[];
    bottom: number[];
  };
}

export interface VisualGuidelines {
  leader_line_style: string;
  text_alignment: string;
  numbering_style: string;
  font_recommendation: string;
}

// ============================================================================
// AI EDIT
// ============================================================================

export interface AIEditRequest {
  revisionId: string;
  fieldPath: string;
  editPrompt: string;
  referenceImageUrl: string;
}

export interface AIEditResult {
  newRevisionId: string;
  updatedField: any;
  creditsUsed: number;
}

// ============================================================================
// GENERAL TYPES
// ============================================================================

export interface BatchProcessingStatus {
  total: number;
  completed: number;
  failed: number;
  inProgress: number;
}

export interface ProcessingMetrics {
  tokens_used: number;
  processing_time_ms: number;
  model_used: string;
  cache_hit: boolean;
}

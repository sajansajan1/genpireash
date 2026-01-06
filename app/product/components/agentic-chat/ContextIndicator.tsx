"use client";

/**
 * ContextIndicator component - shows what data the AI has access to
 */

import { cn } from "@/lib/utils";
import {
  ImageIcon,
  Eye,
  Component,
  Focus,
  PenTool,
  FileText,
  CheckCircle,
} from "lucide-react";
import type { TechFilesData, ProductImages } from "./types";

interface ContextIndicatorProps {
  techPackData: any | null;
  techFilesData: TechFilesData | null;
  productImages: ProductImages;
  activeSection: string;
  className?: string;
}

interface ContextItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count?: number;
  available: boolean;
}

export function ContextIndicator({
  techPackData,
  techFilesData,
  productImages,
  activeSection,
  className,
}: ContextIndicatorProps) {
  // Hidden per user request - return null to hide this section
  return null;

  // Calculate what data is available
  const imageCount = [
    productImages.front,
    productImages.back,
    productImages.side,
    productImages.top,
    productImages.bottom,
  ].filter((img) => img && !img.includes("placeholder")).length;

  const baseViewCount = techFilesData?.baseViews?.length || 0;
  const componentCount = techFilesData?.components?.length || 0;
  const closeupCount = techFilesData?.closeups?.length || 0;
  const sketchCount = techFilesData?.sketches?.length || 0;
  const hasTechPack = !!techPackData?.tech_pack_data;

  const contextItems: ContextItem[] = [
    {
      icon: ImageIcon,
      label: "Images",
      count: imageCount,
      available: imageCount > 0,
    },
    {
      icon: Eye,
      label: "Base Views",
      count: baseViewCount,
      available: baseViewCount > 0,
    },
    {
      icon: Component,
      label: "Components",
      count: componentCount,
      available: componentCount > 0,
    },
    {
      icon: Focus,
      label: "Close-ups",
      count: closeupCount,
      available: closeupCount > 0,
    },
    {
      icon: PenTool,
      label: "Sketches",
      count: sketchCount,
      available: sketchCount > 0,
    },
    {
      icon: FileText,
      label: "Tech Pack",
      available: hasTechPack,
    },
  ];

  const availableItems = contextItems.filter((item) => item.available);
  const totalDataPoints =
    imageCount + baseViewCount + componentCount + closeupCount + sketchCount + (hasTechPack ? 1 : 0);

  // Section label mapping - includes new consolidated sections
  const sectionLabels: Record<string, string> = {
    // New consolidated sections
    visual: "Visual",
    "factory-specs": "Factory Specs",
    specifications: "Specifications",
    construction: "Construction",
    production: "Production",
    // Legacy section labels (for backwards compatibility)
    visualization: "Images",
    colors: "Colors",
    materials: "Materials",
    measurements: "Measurements",
    sizes: "Sizes",
    hardware: "Hardware",
    packaging: "Packaging",
    care: "Care",
    quality: "Quality",
    overview: "Overview",
    "base-views": "Base Views",
    components: "Components",
    closeups: "Close-Ups",
    sketches: "Sketches",
  };

  return (
    <div
      className={cn(
        "border-b border-neutral-800 px-3 py-2.5 bg-neutral-900",
        className
      )}
    >
      {/* Current section indicator */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-neutral-400 uppercase tracking-wide font-medium">
          Viewing: {sectionLabels[activeSection] || activeSection}
        </span>
        {totalDataPoints > 0 && (
          <span className="text-xs text-neutral-500">
            {totalDataPoints} data points
          </span>
        )}
      </div>

      {/* Available context items */}
      <div className="flex flex-wrap gap-2">
        {availableItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs",
                "bg-neutral-800",
                "text-neutral-300"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
              {item.count !== undefined && item.count > 0 && (
                <span className="text-neutral-500">
                  ({item.count})
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* No data warning */}
      {availableItems.length === 0 && (
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <span>No product data available yet</span>
        </div>
      )}
    </div>
  );
}

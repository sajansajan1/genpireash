/**
 * Shared utilities for product pages (both public and private views)
 */

import {
  ImageIcon,
  FileText,
  Package,
  Wrench,
  Factory,
} from "lucide-react";

// ============================================
// TYPES
// ============================================

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface TechFileData {
  id: string;
  file_type: string;
  view_type: string | null;
  file_category: string | null;
  file_url: string;
  thumbnail_url: string | null;
  analysis_data: any;
  confidence_score: number | null;
  created_at: string;
  revision_id: string | null;
}

export interface TechFilesData {
  baseViews: TechFileData[];
  components: TechFileData[];
  closeups: TechFileData[];
  sketches: TechFileData[];
  flatSketches: TechFileData[];
  assemblyView: TechFileData | null;
}

// ============================================
// NAVIGATION
// ============================================

export const navItems: NavItem[] = [
  { id: "visual", label: "Visual", icon: ImageIcon },
  { id: "factory-specs", label: "Factory Specs", icon: Factory },
  { id: "specifications", label: "Specifications", icon: FileText },
  { id: "construction", label: "Construction", icon: Wrench },
  { id: "production", label: "Production", icon: Package },
];

// ============================================
// VALUE RENDERING
// ============================================

/**
 * Helper to safely render any value as string - handles deeply nested objects
 */
export const renderValue = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    return value.map(renderValue).filter(Boolean).join("\n");
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const parts: string[] = [];
    for (const [, val] of Object.entries(obj)) {
      if (val === null || val === undefined) continue;
      if (typeof val === "string" && val.trim()) {
        parts.push(val);
      } else if (Array.isArray(val)) {
        const arrContent = val.map(renderValue).filter(Boolean).join("\n");
        if (arrContent) parts.push(arrContent);
      } else if (typeof val === "object") {
        const nested = renderValue(val);
        if (nested) parts.push(nested);
      }
    }
    return parts.join("\n\n");
  }
  return "";
};

/**
 * Helper function to capitalize first letter of each word
 */
export const capitalizeTitle = (str: string | undefined | null): string => {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// ============================================
// DATE FORMATTING
// ============================================

/**
 * Format a date string for display
 */
export const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

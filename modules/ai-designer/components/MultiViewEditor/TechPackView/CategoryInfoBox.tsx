/**
 * CategoryInfoBox Component
 * Info box showing product categories that require tech packs
 * with generation buttons
 */

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Loader2,
  CloudDownload,
  Shirt,
  Footprints,
  ShoppingBag,
  Armchair,
  Baby,
  Gem,
  PawPrint,
  Home,
  Package,
  Palette,
} from "lucide-react";

interface CategoryInfoBoxProps {
  hasTechnicalImages: boolean;
  generatingTechnical: boolean;
  loadingPrintFiles: boolean;
  onGenerateTechnicalFiles: () => void;
  onGeneratePrintFiles: () => void;
}

export function CategoryInfoBox({
  hasTechnicalImages,
  generatingTechnical,
  loadingPrintFiles,
  onGenerateTechnicalFiles,
  onGeneratePrintFiles,
}: CategoryInfoBoxProps) {
  return (
    <div className="p-3 bg-[#FFF8DC] rounded-lg border border-[#D2B48C]">
      <div className="flex items-start gap-2">
        <div className="p-1.5 bg-[#D2B48C] rounded-full shrink-0">
          <FileText className="h-4 w-4 text-[#1C1917]" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-[#1C1917] mb-1.5">
            Generate Technical Specification Files
          </h3>
          <p className="text-xs text-[#1C1917]/80 mb-3">
            Not all products require technical specification files. Generate one if your product falls into the categories below.
          </p>

          <div className="grid gap-3 sm:grid-cols-2 mb-3">
            <div>
              <h4 className="text-xs font-medium text-[#1C1917] mb-1.5">Must-Have Tech Packs:</h4>
              <ul className="text-xs text-[#1C1917]/80 space-y-1.5">
                <li className="flex items-center gap-1.5">
                  <Shirt className="h-3.5 w-3.5 text-[#1C1917]/60" />
                  <span>Apparel</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Footprints className="h-3.5 w-3.5 text-[#1C1917]/60" />
                  <span>Footwear</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <ShoppingBag className="h-3.5 w-3.5 text-[#1C1917]/60" />
                  <span>Bags</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Armchair className="h-3.5 w-3.5 text-[#1C1917]/60" />
                  <span>Furniture/Upholstery</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Baby className="h-3.5 w-3.5 text-[#1C1917]/60" />
                  <span>Toys/Plush</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Gem className="h-3.5 w-3.5 text-[#1C1917]/60" />
                  <span>Jewelry (custom)</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-medium text-[#1C1917] mb-1.5">Recommended:</h4>
              <ul className="text-xs text-[#1C1917]/80 space-y-1.5">
                <li className="flex items-center gap-1.5">
                  <PawPrint className="h-3.5 w-3.5 text-[#1C1917]/60" />
                  <span>Pet products</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Home className="h-3.5 w-3.5 text-[#1C1917]/60" />
                  <span>Home textiles</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5 text-[#1C1917]/60" />
                  <span>High-end packaging</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5 text-[#1C1917]/60" />
                  <span>Custom accessories</span>
                </li>
              </ul>
            </div>
          </div>

          {!hasTechnicalImages && (
            <>
              <div className="flex flex-col gap-2">
                <Button
                  className="w-full h-8 text-xs"
                  onClick={onGenerateTechnicalFiles}
                  disabled={generatingTechnical}
                >
                  {generatingTechnical ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                      <span>Generate tech spec files (6 credits)</span>
                    </>
                  )}
                </Button>

                <Button
                  variant="default"
                  onClick={onGeneratePrintFiles}
                  disabled={loadingPrintFiles}
                  className="w-full h-8 text-xs"
                >
                  {loadingPrintFiles ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <CloudDownload className="h-3.5 w-3.5 mr-1.5" />
                      Generate Print File
                    </>
                  )}
                </Button>
              </div>

              <p className="text-[10px] text-[#1C1917]/70 mt-2">
                Tech pack generation includes technical sketches, measurements, callouts, and manufacturing specifications.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

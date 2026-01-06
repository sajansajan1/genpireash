/**
 * TechPackTechnicalTab Component
 * Technical tab with specification files, accordion sections, canvas areas, and manufacturing specs
 */

"use client";

import React from "react";
import {
  Ruler,
  Package,
  ShieldCheck,
  ClipboardList,
  Layers,
  FileStack,
  Eye,
  Loader2,
  BookImage,
  Images,
  DownloadCloud as DownloadCloudIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TechPackSection } from "@/components/tech-pack/tech-pack-section";
import { CategoryInfoBox } from "./CategoryInfoBox";
import type { TechPackData } from "../../../types/techPack";

interface TechPackTechnicalTabProps {
  techPackData: TechPackData;
  selectedSection: string;
  onSectionSelect: (section: string) => void;
  onUpdateSection: (section: string, content: any) => void;
  industryBenchmarks: Record<string, string>;
  generatingTechnical: boolean;
  loadingPrintFiles: boolean;
  onGenerateTechnicalFiles: () => void;
  onGeneratePrintFiles: () => void;
  onModalImageOpen: (url: string) => void;
  svgLoader: string | null;
  pngLoader: boolean;
  onDownloadSvg: (imageUrls: (string | undefined)[], loaderType: "technical" | "multiview" | "construction" | "callout") => void;
  onDownloadPng: (imageUrls: (string | undefined)[]) => void;
}

export function TechPackTechnicalTab({
  techPackData,
  selectedSection,
  onSectionSelect,
  onUpdateSection,
  industryBenchmarks,
  generatingTechnical,
  loadingPrintFiles,
  onGenerateTechnicalFiles,
  onGeneratePrintFiles,
  onModalImageOpen,
  svgLoader,
  pngLoader,
  onDownloadSvg,
  onDownloadPng,
}: TechPackTechnicalTabProps) {
  const techPackContent = techPackData.tech_pack_data;
  const hasTechnicalImages = !!techPackData?.technical_images;

  return (
    <div className="space-y-4">
      {/* Category Info Box */}
      <CategoryInfoBox
        hasTechnicalImages={hasTechnicalImages}
        generatingTechnical={generatingTechnical}
        loadingPrintFiles={loadingPrintFiles}
        onGenerateTechnicalFiles={onGenerateTechnicalFiles}
        onGeneratePrintFiles={onGeneratePrintFiles}
      />

      {/* Technical Specification Files Grid */}
      {hasTechnicalImages && (
        <div className="p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Technical Specification Files</h3>
          <p className="text-[10px] text-gray-600 mb-3">
            Professional technical files that communicate your design intent to manufacturers with precision and clarity.
          </p>

          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {/* Design Outline */}
            <div
              className="bg-white p-3 rounded border cursor-pointer hover:opacity-70 transition-opacity"
              onClick={() => onModalImageOpen(techPackData.technical_images?.technicalImage?.url || "/placeholder.svg")}
            >
              <div className="w-full h-24 mb-2 overflow-hidden rounded">
                <img
                  src={techPackData.technical_images?.technicalImage?.url || "/placeholder.svg"}
                  alt="Technical flat sketch"
                  className="object-cover w-full h-full"
                />
              </div>
              <h4 className="text-xs font-medium text-gray-700 mb-1">Design Outline</h4>
              <p className="text-[10px] text-gray-500 leading-relaxed">
                A clean line drawing that shows your product's full shape, seams, and proportions.
              </p>
            </div>

            {/* Final Product Front View */}
            <div
              className="bg-white p-3 rounded border cursor-pointer hover:opacity-70 transition-opacity"
              onClick={() => onModalImageOpen(techPackData.technical_images?.vectorImage?.url || "/placeholder.svg")}
            >
              <div className="w-full h-24 mb-2 overflow-hidden rounded">
                <img
                  src={techPackData.technical_images?.vectorImage?.url || "/placeholder.svg"}
                  alt="Vector illustration"
                  className="object-cover w-full h-full"
                />
              </div>
              <h4 className="text-xs font-medium text-gray-700 mb-1">Final Product Front View</h4>
              <p className="text-[10px] text-gray-500 leading-relaxed">
                A realistic, full-color image of your product with fabric, print, and color.
              </p>
            </div>

            {/* Close-Up Details */}
            <div
              className="bg-white p-3 rounded border cursor-pointer hover:opacity-70 transition-opacity"
              onClick={() => onModalImageOpen(techPackData.technical_images?.detailImage?.url || "/placeholder.svg")}
            >
              <div className="w-full h-24 mb-2 overflow-hidden rounded">
                <img
                  src={techPackData.technical_images?.detailImage?.url || "/placeholder.svg"}
                  alt="Construction details"
                  className="object-cover w-full h-full"
                />
              </div>
              <h4 className="text-xs font-medium text-gray-700 mb-1">Close-Up Details</h4>
              <p className="text-[10px] text-gray-500 leading-relaxed">
                Zoomed-in images highlighting key areas like stitching, straps, or fastenings.
              </p>
            </div>
          </div>

          <p className="text-[10px] text-gray-500 mt-3 italic">
            Generate these visuals automatically to complete your product's tech pack — clear, accurate, and ready for production.
          </p>

          {/* Download Dropdown */}
          <div className="mt-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <DownloadCloudIcon className="h-3.5 w-3.5 mr-1.5" />
                  Download
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  disabled={svgLoader === "technical"}
                  onClick={() =>
                    onDownloadSvg(
                      [
                        techPackData?.technical_images?.detailImage?.url,
                        techPackData?.technical_images?.vectorImage?.url,
                        techPackData?.technical_images?.technicalImage?.url,
                      ],
                      "technical"
                    )
                  }
                >
                  {svgLoader === "technical" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Generating SVGs...
                    </>
                  ) : (
                    <>
                      <BookImage className="h-4 w-4 mr-2" />
                      SVG
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={pngLoader}
                  onClick={() =>
                    onDownloadPng([
                      techPackData?.technical_images?.detailImage?.url,
                      techPackData?.technical_images?.vectorImage?.url,
                      techPackData?.technical_images?.technicalImage?.url,
                    ])
                  }
                >
                  {pngLoader ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Downloading PNGs...
                    </>
                  ) : (
                    <>
                      <Images className="h-4 w-4 mr-2" />
                      PNG
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* Accordion Sections */}
      {hasTechnicalImages && (
        <Accordion type="multiple" defaultValue={["item-1", "item-2", "item-3"]} className="w-full">
          {/* Multiple Views */}
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-xs">1. Multiple Views - Essential Product Perspectives</AccordionTrigger>
            <AccordionContent>
              <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-xs font-medium text-[#1C1917] mb-1">Why Multiple Views Matter</h4>
                <p className="text-[10px] text-[#1C1917]/70">
                  Multiple views eliminate guesswork for manufacturers by showing every angle of your design.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2 mb-3">
                {/* Front View */}
                <div
                  className="bg-gray-50 p-3 rounded border-2 border-dashed cursor-pointer"
                  onClick={() => onModalImageOpen(techPackData.technical_images?.frontViewImage?.url || "/placeholder.svg")}
                >
                  <img
                    src={techPackData.technical_images?.frontViewImage?.url || "/placeholder.svg"}
                    alt="Front view"
                    className="object-cover w-full mb-1.5"
                  />
                  <h5 className="text-[10px] font-medium text-gray-700 mb-0.5">Front View</h5>
                  <p className="text-[9px] text-gray-600">
                    Complete front-facing view showing all visible design elements.
                  </p>
                </div>

                {/* Back View */}
                <div
                  className="bg-gray-50 p-3 rounded border-2 border-dashed cursor-pointer"
                  onClick={() => onModalImageOpen(techPackData.technical_images?.backViewImage?.url || "/placeholder.svg")}
                >
                  <img
                    src={techPackData.technical_images?.backViewImage?.url || "/placeholder.svg"}
                    alt="Back view"
                    className="object-cover w-full mb-1.5"
                  />
                  <h5 className="text-[10px] font-medium text-gray-700 mb-0.5">Back View</h5>
                  <p className="text-[9px] text-gray-600">
                    Rear perspective revealing hidden construction details.
                  </p>
                </div>
              </div>

              {/* Download Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-7 text-xs">
                    <DownloadCloudIcon className="h-3 w-3 mr-1.5" />
                    Download
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    disabled={svgLoader === "multiview"}
                    onClick={() =>
                      onDownloadSvg(
                        [
                          techPackData.technical_images?.frontViewImage?.url,
                          techPackData.technical_images?.backViewImage?.url,
                        ],
                        "multiview"
                      )
                    }
                  >
                    {svgLoader === "multiview" ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                        <span className="text-xs">Generating SVGs...</span>
                      </>
                    ) : (
                      <>
                        <BookImage className="h-3 w-3 mr-1.5" />
                        <span className="text-xs">SVG</span>
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={pngLoader}
                    onClick={() =>
                      onDownloadPng([
                        techPackData.technical_images?.frontViewImage?.url,
                        techPackData.technical_images?.backViewImage?.url,
                      ])
                    }
                  >
                    {pngLoader ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                        <span className="text-xs">Downloading PNGs...</span>
                      </>
                    ) : (
                      <>
                        <Images className="h-3 w-3 mr-1.5" />
                        <span className="text-xs">PNG</span>
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </AccordionContent>
          </AccordionItem>

          {/* Construction Details */}
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-xs">2. Construction Details - Manufacturing Blueprint</AccordionTrigger>
            <AccordionContent>
              <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-xs font-medium text-[#1C1917] mb-1">Purpose of Construction Details</h4>
                <p className="text-[10px] text-[#1C1917]/70">
                  Construction details serve as the manufacturing roadmap, specifying exactly how each component should be assembled.
                </p>
              </div>

              <div
                className="bg-gray-50 p-3 rounded border-2 border-dashed mb-3 cursor-pointer"
                onClick={() => onModalImageOpen(techPackData.technical_images?.constructionImage?.url || "/placeholder.svg")}
              >
                <img
                  src={techPackData.technical_images?.constructionImage?.url || "/placeholder.svg"}
                  alt="Construction details"
                  className="object-cover w-full mb-1.5"
                />
                <h5 className="text-[10px] font-medium text-gray-700 mb-0.5">Construction Specifications</h5>
                <p className="text-[9px] text-gray-600">
                  Detailed view of seam construction, stitching patterns, and assembly methods.
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-7 text-xs">
                    <DownloadCloudIcon className="h-3 w-3 mr-1.5" />
                    Download
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    disabled={svgLoader === "construction"}
                    onClick={() =>
                      onDownloadSvg([techPackData.technical_images?.constructionImage?.url], "construction")
                    }
                  >
                    {svgLoader === "construction" ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                        <span className="text-xs">Generating SVGs...</span>
                      </>
                    ) : (
                      <>
                        <BookImage className="h-3 w-3 mr-1.5" />
                        <span className="text-xs">SVG</span>
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={pngLoader}
                    onClick={() => onDownloadPng([techPackData.technical_images?.constructionImage?.url])}
                  >
                    {pngLoader ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                        <span className="text-xs">Downloading PNGs...</span>
                      </>
                    ) : (
                      <>
                        <Images className="h-3 w-3 mr-1.5" />
                        <span className="text-xs">PNG</span>
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </AccordionContent>
          </AccordionItem>

          {/* Annotations & Callouts */}
          <AccordionItem value="item-3">
            <AccordionTrigger className="text-xs">3. Annotations & Callouts - Material Specifications</AccordionTrigger>
            <AccordionContent>
              <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-xs font-medium text-[#1C1917] mb-1">Importance of Callouts</h4>
                <p className="text-[10px] text-[#1C1917]/70">
                  Callouts provide specific material and construction instructions directly on the sketch.
                </p>
              </div>

              <div
                className="bg-gray-50 p-3 rounded border-2 border-dashed mb-3 cursor-pointer"
                onClick={() => onModalImageOpen(techPackData.technical_images?.calloutImage?.url || "/placeholder.svg")}
              >
                <img
                  src={techPackData.technical_images?.calloutImage?.url || "/placeholder.svg"}
                  alt="Callouts"
                  className="object-cover w-full mb-1.5"
                />
                <h5 className="text-[10px] font-medium text-gray-700 mb-0.5">Material Callouts</h5>
                <p className="text-[9px] text-gray-600">
                  Annotated specifications for materials, hardware, and construction methods.
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-7 text-xs">
                    <DownloadCloudIcon className="h-3 w-3 mr-1.5" />
                    Download
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    disabled={svgLoader === "callout"}
                    onClick={() => onDownloadSvg([techPackData.technical_images?.calloutImage?.url], "callout")}
                  >
                    {svgLoader === "callout" ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                        <span className="text-xs">Generating SVGs...</span>
                      </>
                    ) : (
                      <>
                        <BookImage className="h-3 w-3 mr-1.5" />
                        <span className="text-xs">SVG</span>
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={pngLoader}
                    onClick={() => onDownloadPng([techPackData.technical_images?.calloutImage?.url])}
                  >
                    {pngLoader ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                        <span className="text-xs">Downloading PNGs...</span>
                      </>
                    ) : (
                      <>
                        <Images className="h-3 w-3 mr-1.5" />
                        <span className="text-xs">PNG</span>
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {/* Canvas Area - Construction Details & Flat Sketches */}
      {hasTechnicalImages && (
        <div className="space-y-4 mt-6">
          {/* Construction Details Canvas */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="h-4 w-4 text-[#1C1917]" />
                <h3 className="text-base font-semibold">Construction Details - Close-ups</h3>
              </div>

              <div className="flex gap-4">
                {/* Canvas/Preview Area */}
                <div className="flex-1 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-4 min-h-[400px] flex items-center justify-center">
                  {techPackData.technical_images?.constructionImage?.url ? (
                    <img
                      src={techPackData.technical_images.constructionImage.url}
                      alt="Construction details"
                      className="max-w-full max-h-full object-contain cursor-pointer"
                      onClick={() => onModalImageOpen(techPackData.technical_images?.constructionImage?.url || "")}
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <Package className="h-12 w-12 mx-auto mb-2 opacity-30" />
                      <p className="text-xs">No construction image available</p>
                    </div>
                  )}
                </div>

                {/* Revision Side Panel - Close-ups */}
                <div className="w-80 space-y-2 overflow-y-auto max-h-[400px]">
                  <h4 className="text-xs font-medium text-gray-700 mb-2 sticky top-0 bg-white py-1">Close-up Details</h4>

                  {/* Mock close-up cards - These would be generated */}
                  {[
                    { id: 1, label: "Seam Detail", description: "French seam construction with reinforced stitching at stress points" },
                    { id: 2, label: "Button Attachment", description: "4-hole button with bar tack reinforcement" },
                    { id: 3, label: "Collar Construction", description: "Fused interlining with topstitch detail" },
                    { id: 4, label: "Pocket Detail", description: "Welt pocket with double-stitched edges" },
                  ].map((detail) => (
                    <Card key={detail.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-3">
                        <div className="flex gap-2">
                          <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
                            <Eye className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-semibold text-gray-900 mb-1">{detail.label}</h5>
                            <p className="text-[10px] text-gray-600 line-clamp-2">{detail.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Flat Sketches with Callouts Canvas */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileStack className="h-4 w-4 text-[#1C1917]" />
                <h3 className="text-base font-semibold">Flat Sketches - Technical Callouts</h3>
              </div>

              <div className="flex gap-4">
                {/* Canvas/Preview Area - 4 Sides */}
                <div className="flex-1 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-4 min-h-[400px]">
                  <div className="grid grid-cols-2 gap-4 h-full">
                    {/* Front View */}
                    <div className="flex flex-col items-center justify-center bg-white rounded border p-3 cursor-pointer hover:border-[#1C1917] transition-colors" onClick={() => onModalImageOpen(techPackData.technical_images?.frontViewImage?.url || "")}>
                      {techPackData.technical_images?.frontViewImage?.url ? (
                        <>
                          <img
                            src={techPackData.technical_images.frontViewImage.url}
                            alt="Front view with callouts"
                            className="max-w-full max-h-40 object-contain mb-2"
                          />
                          <p className="text-[10px] font-medium text-gray-700">Front View</p>
                        </>
                      ) : (
                        <div className="text-center text-gray-400">
                          <Package className="h-8 w-8 mx-auto mb-1 opacity-30" />
                          <p className="text-[10px]">Front View</p>
                        </div>
                      )}
                    </div>

                    {/* Back View */}
                    <div className="flex flex-col items-center justify-center bg-white rounded border p-3 cursor-pointer hover:border-[#1C1917] transition-colors" onClick={() => onModalImageOpen(techPackData.technical_images?.backViewImage?.url || "")}>
                      {techPackData.technical_images?.backViewImage?.url ? (
                        <>
                          <img
                            src={techPackData.technical_images.backViewImage.url}
                            alt="Back view with callouts"
                            className="max-w-full max-h-40 object-contain mb-2"
                          />
                          <p className="text-[10px] font-medium text-gray-700">Back View</p>
                        </>
                      ) : (
                        <div className="text-center text-gray-400">
                          <Package className="h-8 w-8 mx-auto mb-1 opacity-30" />
                          <p className="text-[10px]">Back View</p>
                        </div>
                      )}
                    </div>

                    {/* Left Side View */}
                    <div className="flex flex-col items-center justify-center bg-white rounded border p-3 cursor-pointer hover:border-[#1C1917] transition-colors">
                      {techPackData.technical_images?.calloutImage?.url ? (
                        <>
                          <img
                            src={techPackData.technical_images.calloutImage.url}
                            alt="Side view with callouts"
                            className="max-w-full max-h-40 object-contain mb-2"
                          />
                          <p className="text-[10px] font-medium text-gray-700">Side View</p>
                        </>
                      ) : (
                        <div className="text-center text-gray-400">
                          <Package className="h-8 w-8 mx-auto mb-1 opacity-30" />
                          <p className="text-[10px]">Side View</p>
                        </div>
                      )}
                    </div>

                    {/* Detail View */}
                    <div className="flex flex-col items-center justify-center bg-white rounded border p-3 cursor-pointer hover:border-[#1C1917] transition-colors" onClick={() => onModalImageOpen(techPackData.technical_images?.constructionImage?.url || "")}>
                      {techPackData.technical_images?.constructionImage?.url ? (
                        <>
                          <img
                            src={techPackData.technical_images.constructionImage.url}
                            alt="Detail view with callouts"
                            className="max-w-full max-h-40 object-contain mb-2"
                          />
                          <p className="text-[10px] font-medium text-gray-700">Detail View</p>
                        </>
                      ) : (
                        <div className="text-center text-gray-400">
                          <Package className="h-8 w-8 mx-auto mb-1 opacity-30" />
                          <p className="text-[10px]">Detail View</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Revision Side Panel - Callouts */}
                <div className="w-80 space-y-2 overflow-y-auto max-h-[400px]">
                  <h4 className="text-xs font-medium text-gray-700 mb-2 sticky top-0 bg-white py-1">Technical Callouts</h4>

                  {/* Mock callout cards with letters */}
                  {[
                    { id: "A", label: "Collar Stand", description: "2.5cm height, fused interlining, topstitch 0.3cm from edge" },
                    { id: "B", label: "Shoulder Seam", description: "Flat-fell seam, 1.2cm seam allowance" },
                    { id: "C", label: "Chest Pocket", description: "12cm x 14cm welt pocket with flap, buttonhole closure" },
                    { id: "D", label: "Side Seam", description: "French seam construction, 1.5cm seam allowance" },
                    { id: "E", label: "Hem", description: "Double-fold hem, 3cm width, blind stitch finish" },
                    { id: "F", label: "Sleeve Cuff", description: "7cm band with single button closure" },
                  ].map((callout) => (
                    <Card key={callout.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-3">
                        <div className="flex gap-2">
                          <div className="w-8 h-8 bg-[#1C1917] rounded-full flex-shrink-0 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{callout.id}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-semibold text-gray-900 mb-1">{callout.label}</h5>
                            <p className="text-[10px] text-gray-600 line-clamp-2">{callout.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dimensions Section */}
      {techPackContent?.dimensions && (
        <TechPackSection
          title="Dimensions"
          icon={<Ruler className="h-4 w-4" />}
          content={{ measurements: techPackContent.dimensions || {} }}
          onUpdate={(content) => {
            const { measurements } = content;
            onUpdateSection("dimensions", measurements);
          }}
          industryBenchmark={industryBenchmarks["Dimensions"]}
          isSelected={selectedSection === "Dimensions"}
          onSelect={() => onSectionSelect("Dimensions")}
          renderContent={(content) => {
            const measurements = content.measurements || {};

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(
                  Object.entries(measurements) as [
                    string,
                    { value: string; tolerance?: string; description?: string }
                  ][]
                ).map(([key, { value, tolerance }]) => (
                  <div
                    key={key}
                    className="border rounded-md p-2.5 space-y-0.5"
                  >
                    <p className="text-xs font-semibold text-gray-900 capitalize">
                      {key === "width" ? "Breadth" : key}
                    </p>
                    <p className="text-xs text-gray-700">
                      {value} {tolerance && `(${tolerance})`}
                    </p>
                  </div>
                ))}
              </div>
            );
          }}
          isAiPromptOpen={false}
          setAiPromptOpen={() => {}}
        />
      )}

      {/* Size Range Section */}
      <TechPackSection
        title="Size Range"
        icon={<Ruler className="h-4 w-4" />}
        content={{
          description: techPackContent?.sizeRange?.gradingLogic || "",
          sizes: techPackContent?.sizeRange?.sizes || [],
        }}
        onUpdate={(content) =>
          onUpdateSection("sizeRange", {
            sizes: content.sizes,
            gradingLogic: content.description,
          })
        }
        industryBenchmark={industryBenchmarks["Size Range"]}
        isSelected={selectedSection === "Size Range"}
        onSelect={() => onSectionSelect("Size Range")}
        renderContent={(content) => (
          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-medium mb-1">Sizing Notes</h4>
              <p className="text-xs text-gray-700">{content.description}</p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {content.sizes?.map((size: string, i: number) => (
                <Badge key={i} variant="outline" className="text-[10px] h-5 px-2">
                  {size}
                </Badge>
              ))}
            </div>
          </div>
        )}
        isAiPromptOpen={false}
        setAiPromptOpen={() => {}}
      />

      {/* Packaging Section */}
      <TechPackSection
        title="Packaging"
        icon={<Package className="h-4 w-4" />}
        content={{
          description: techPackContent?.packaging?.description || "",
          packagingDetails: techPackContent?.packaging?.packagingDetails || {},
        }}
        onUpdate={(content) => onUpdateSection("packaging", content)}
        industryBenchmark={industryBenchmarks["Packaging"]}
        isSelected={selectedSection === "Packaging"}
        onSelect={() => onSectionSelect("Packaging")}
        renderContent={(content) => (
          <div className="space-y-3">
            {content.description && (
              <div>
                <h4 className="text-xs font-medium mb-1">Description</h4>
                <p className="text-xs text-gray-700">
                  {content.description}
                </p>
              </div>
            )}

            {content.packagingDetails && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(content.packagingDetails).map(
                  ([key, value]: [string, unknown]) => (
                    <div key={key} className="space-y-0.5">
                      <h4 className="text-xs font-medium capitalize">
                        {key.replace(/([A-Z])/g, " $1")}
                      </h4>
                      <p className="text-xs text-gray-700">
                        {String(value)}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}
        isAiPromptOpen={false}
        setAiPromptOpen={() => {}}
      />

      {/* Quality Standards Section */}
      <TechPackSection
        title="Quality Standards"
        icon={<ShieldCheck className="h-4 w-4" />}
        content={techPackContent?.qualityStandards || ""}
        onUpdate={(content) =>
          onUpdateSection("qualityStandards", content)
        }
        industryBenchmark={industryBenchmarks["Quality Standards"]}
        isSelected={selectedSection === "Quality Standards"}
        onSelect={() => onSectionSelect("Quality Standards")}
        renderContent={(content) => (
          <p className="text-xs text-gray-700">{content}</p>
        )}
        isAiPromptOpen={false}
        setAiPromptOpen={() => {}}
      />

      {/* Production Notes Section */}
      <TechPackSection
        title="Production Notes"
        icon={<ClipboardList className="h-4 w-4" />}
        content={techPackContent?.productionNotes || ""}
        onUpdate={(content) =>
          onUpdateSection("productionNotes", content)
        }
        industryBenchmark={industryBenchmarks["Production Notes"]}
        isSelected={selectedSection === "Production Notes"}
        onSelect={() => onSectionSelect("Production Notes")}
        renderContent={(content) => (
          <p className="text-xs text-gray-700">{content}</p>
        )}
        isAiPromptOpen={false}
        setAiPromptOpen={() => {}}
      />
    </div>
  );
}

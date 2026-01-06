/**
 * TechPackHeader Component
 * Header section with title, actions (PDF, Excel, Share buttons)
 */

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Share2, CheckCircle2 } from "lucide-react";

interface TechPackHeaderProps {
  productName?: string;
  onDownloadPDF?: () => Promise<void>;
  onDownloadExcel?: () => Promise<void>;
}

export function TechPackHeader({
  productName = "Factory Specs",
  onDownloadPDF,
  onDownloadExcel,
}: TechPackHeaderProps) {
  return (
    <div className="border-b border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-[#1C1917] rounded-lg">
          <CheckCircle2 className="h-4 w-4 text-white" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            {productName}
          </h2>
          <p className="text-xs text-gray-600">
            Manufacturing-ready documentation
          </p>
        </div>
      </div>
    </div>
  );
}

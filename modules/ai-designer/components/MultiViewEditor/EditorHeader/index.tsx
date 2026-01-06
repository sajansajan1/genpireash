/**
 * EditorHeader Component
 * Top header bar with product switcher, workflow mode, credits, and actions
 */

import React from "react";
import { Box, LucideMessageCircleQuestion, Lightbulb, X, ExternalLink } from "lucide-react";
import Link from "next/link";
import { ProductSwitcher } from "../ProductSwitcher";
import { WorkflowModeSwitcher } from "../WorkflowModeSwitcher";
import { CreditsDisplay } from "../CreditsDisplay";
import { MobileMenu } from "../MobileMenu";
import type { UserProduct } from "@/app/actions/get-user-products";
import type { GenerationState, WorkflowMode } from "../../../store/editorStore";

export interface EditorHeaderProps {
  // Product info
  productId: string | null;
  productName: string;
  extractedProductName: string | null;
  userProducts: UserProduct[];
  isProductDropdownOpen: boolean;
  setIsProductDropdownOpen: (open: boolean) => void;

  // 3D Model
  has3DModel: boolean;
  model3DUrl: string | null;
  onShow3DViewer: () => void;

  // Workflow
  workflowMode: WorkflowMode;
  setWorkflowMode: (mode: WorkflowMode) => void;
  generationState: GenerationState;
  isInitialGeneration: boolean;
  hasTechPack?: boolean; // Whether tech pack has been generated

  // Credits
  credits: number;

  // Mobile menu
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;

  // Actions
  onShowTutorial: () => void;
  onShowIdeas: () => void;
  onClose: () => void;
  setIsCleaningSession: (cleaning: boolean) => void;
  onCreditsClick?: () => void;

  // Product link - shows "View Product" button when product was created
  productLinkedRevisionId?: string | null;

  // Demo mode
  isDemo?: boolean;
}

export function EditorHeader({
  productId,
  productName,
  extractedProductName,
  userProducts,
  isProductDropdownOpen,
  setIsProductDropdownOpen,
  has3DModel,
  model3DUrl,
  onShow3DViewer,
  workflowMode,
  setWorkflowMode,
  generationState,
  isInitialGeneration,
  hasTechPack = false,
  credits,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  onShowTutorial,
  onShowIdeas,
  onClose,
  setIsCleaningSession,
  onCreditsClick,
  productLinkedRevisionId,
  isDemo = false,
}: EditorHeaderProps) {
  const handleCloseDesktop = async () => {
    setIsCleaningSession(true);
    // Give a brief moment for UI to show cleaning message
    await new Promise((resolve) => setTimeout(resolve, 300));
    onClose();
  };

  return (
    <div className="px-3 sm:px-6 py-2 sm:py-3 bg-white border-b">
      <div className="flex items-center justify-between gap-2">
        {/* Left: Product Switcher + 3D Button */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <ProductSwitcher
            currentProductId={productId}
            currentProductName={productName}
            extractedProductName={extractedProductName}
            products={userProducts}
            isOpen={isProductDropdownOpen}
            onToggle={() => setIsProductDropdownOpen(!isProductDropdownOpen)}
            onSelectProduct={(id) => {
              setIsProductDropdownOpen(false);
              window.location.href = `/ai-designer?projectId=${id}&version=modular`;
            }}
          />

          {/* 3D Model Viewer Button */}
          {has3DModel && model3DUrl && (
            <button
              onClick={onShow3DViewer}
              className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex-shrink-0"
              title="View 3D Model"
            >
              <Box className="h-4 w-4 text-emerald-700" />
            </button>
          )}

          {/* View Product Button - Shows when product was created from a revision */}
          {productLinkedRevisionId && productId && (
            <Link
              href={`/product/${productId}`}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors flex-shrink-0"
              title="View created product"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>View Product</span>
            </Link>
          )}

        </div>

        {/* Right: Workflow Mode + Credits + Menu/Actions */}
        <div className="flex items-center gap-2">
          {/* Workflow Mode Switcher - Show when completed (Desktop only) */}
          {(generationState === "completed" ||
            (generationState === "idle" && !isInitialGeneration)) && (
              <WorkflowModeSwitcher
                workflowMode={workflowMode}
                onModeChange={setWorkflowMode}
                hasTechPack={hasTechPack}
                className="hidden sm:flex"
                isDemo={isDemo}
              />
            )}

          {/* Credits Display - Always visible */}
          <CreditsDisplay credits={credits} onClick={onCreditsClick} />

          {/* Mobile: More Menu Button */}
          <MobileMenu
            isOpen={isMobileMenuOpen}
            onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            onShowTutorial={onShowTutorial}
            onShowIdeas={onShowIdeas}
            onClose={onClose}
            onSetCleaningSession={setIsCleaningSession}
            productId={productId}
            productLinkedRevisionId={productLinkedRevisionId}
          />

          {/* Desktop: All Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={onShowTutorial}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              aria-label="Tutorial"
            >
              <LucideMessageCircleQuestion className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={onShowIdeas}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              aria-label="Ideas"
            >
              <Lightbulb className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={handleCloseDesktop}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-gray-700" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

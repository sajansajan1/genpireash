/**
 * RevisionHistory component for managing design revisions
 */

import React, { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { devLog } from "../../utils/devLogger";
import {
  History,
  Clock,
  ChevronDown,
  ChevronRight,
  Trash2,
  ArrowRight,
  Loader2,
  Package,
  Info,
  FileText,
  FileOutput,
  Layers,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { MultiViewRevision } from "../../types";
import type { WorkflowMode } from "../../store/editorStore";
import { TechPackModal } from "./TechPackModal";
import { RevisionDetailModal } from "./RevisionDetailModal";
import { getTechPacksForProduct } from "@/app/actions/tech-pack-management";
import { useGetTechPackStore } from "@/lib/zustand/techpacks/getTechPack";
import { useRouter } from "next/navigation";
import { useGetCreditsStore } from "@/lib/zustand/credits/getCredits";
import { toast } from "@/hooks/use-toast";
import { ProductSpecsModal, type DimensionsData, type MaterialsData } from "../ProductSpecsModal";

// Helper function to format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? "month" : "months"} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} ${diffInYears === 1 ? "year" : "years"} ago`;
}

interface RevisionHistoryProps {
  revisions: MultiViewRevision[];
  onRollback: (revision: MultiViewRevision) => void;
  onDelete: (revisionId: string) => Promise<boolean>;
  onToggle?: () => void;
  isLoading?: boolean;
  onGenerateTechPack?: () => Promise<void> | void;
  isGeneratingTechPack?: boolean;
  selectedRevision?: MultiViewRevision | null;
  techPackGeneratedFor?: string | null;
  revisionTechPacks?: Record<string, boolean>;
  productId?: string;
  /** The revision ID that was used to create the current product (from product_ideas.selected_revision_id) */
  productLinkedRevisionId?: string | null;
  /** Whether the product is in demo mode (read-only) */
  isDemo?: boolean;
  /** Current workflow mode */
  workflowMode?: WorkflowMode;
  /** Callback to change workflow mode */
  setWorkflowMode?: (mode: WorkflowMode) => void;
  /** Callback to switch to Canvas tab on mobile */
  onSwitchToCanvas?: () => void;
  /** Existing dimensions data for the product */
  existingDimensions?: DimensionsData | null;
  /** Existing materials data for the product */
  existingMaterials?: MaterialsData | null;
  /** Front image URL for AI dimension generation */
  frontImageUrl?: string;
  /** Callback when dimensions are updated/saved */
  onDimensionsUpdated?: (dimensions: DimensionsData) => void;
}

// Component for individual revision item
function RevisionItem({
  revision,
  onRollback,
  onDelete,
  formatContent,
  onShowDetails,
  hasTechPack = false,
  productId,
  onShowTechPack,
  isDemo = false,
}: {
  revision: MultiViewRevision;
  onRollback: (revision: MultiViewRevision) => void;
  onDelete: (revisionId: string) => Promise<boolean>;
  formatContent: (content: string) => string;
  onShowDetails: (revision: MultiViewRevision) => void;
  hasTechPack?: boolean;
  productId?: string;
  onShowTechPack?: (revision: MultiViewRevision) => void;
  isDemo?: boolean;
}) {
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);

  const hasEditPrompt =
    revision.editPrompt && revision.editPrompt !== "Original design";
  const shouldTruncate =
    hasEditPrompt && revision.editPrompt && revision.editPrompt.length > 100;

  // Safe throttled logging - prevents console spam and crashes
  devLog(`revision-${revision.id}`, revision.views, "revision views");

  return (
    <div
      className={cn(
        "relative bg-white rounded-xl border-2 transition-all duration-200",
        revision.isActive
          ? "border-gray-400 shadow-md cursor-default"
          : isDemo
            ? "border-gray-200 cursor-not-allowed opacity-60"
            : "border-gray-200 hover:border-gray-300 cursor-pointer hover:bg-gray-50/30 hover:shadow-lg"
      )}
      onClick={(e) => {
        // Don't trigger rollback if clicking on interactive elements
        if (
          (e.target as HTMLElement).closest(".prompt-toggle") ||
          (e.target as HTMLElement).closest(".details-toggle") ||
          (e.target as HTMLElement).closest(".delete-button")
        )
          return;
        if (!revision.isActive && !isDemo) onRollback(revision);
      }}
    >
      <div className="p-4">
        {/* Thumbnail Images */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {revision.views ? (
            <>
              <div className="relative group">
                <div className="relative w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 overflow-hidden">
                  {revision.views.front?.thumbnailUrl ||
                    revision.views.front?.imageUrl ? (
                    <img
                      src={
                        revision.views.front.thumbnailUrl ||
                        revision.views.front.imageUrl
                      }
                      alt="Front view"
                      className="absolute inset-0 w-full h-full object-contain p-1"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <span className="text-[10px] font-medium">FRONT</span>
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 rounded-lg transition-colors" />
              </div>

              <div className="relative group">
                <div className="relative w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 overflow-hidden">
                  {revision.views.back?.thumbnailUrl ||
                    revision.views.back?.imageUrl ? (
                    <img
                      src={
                        revision.views.back.thumbnailUrl ||
                        revision.views.back.imageUrl
                      }
                      alt="Back view"
                      className="absolute inset-0 w-full h-full object-contain p-1"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <span className="text-[10px] font-medium">BACK</span>
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 rounded-lg transition-colors" />
              </div>

              <div className="relative group">
                <div className="relative w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 overflow-hidden">
                  {revision.views.side?.thumbnailUrl ||
                    revision.views.side?.imageUrl ? (
                    <img
                      src={
                        revision.views.side.thumbnailUrl ||
                        revision.views.side.imageUrl
                      }
                      alt="Side view"
                      className="absolute inset-0 w-full h-full object-contain p-1"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <span className="text-[10px] font-medium">SIDE</span>
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 rounded-lg transition-colors" />
              </div>
            </>
          ) : (
            <div className="col-span-3 aspect-[3/1] bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-xs text-gray-400">
                No preview available
              </span>
            </div>
          )}
        </div>

        {/* Revision Info */}
        <div className="space-y-2">
          {/* Status and Timestamp */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {revision.isActive && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
              )}
            </div>
            {/* Timestamp */}
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <Clock className="h-3 w-3" />
              <span>{formatRelativeTime(new Date(revision.createdAt))}</span>
            </div>
          </div>

          {/* Edit Prompt with expand/collapse */}
          {hasEditPrompt && (
            <div className="bg-gray-50 rounded-md px-2 py-1.5">
              {shouldTruncate ? (
                <div className="flex items-start gap-1.5">
                  <button
                    className="prompt-toggle flex-shrink-0 p-0.5 hover:bg-gray-200/70 rounded transition-all duration-150"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPromptExpanded(!isPromptExpanded);
                    }}
                    aria-label={isPromptExpanded ? "Collapse" : "Expand"}
                  >
                    {isPromptExpanded ? (
                      <ChevronDown className="h-3 w-3 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-3 w-3 text-gray-500" />
                    )}
                  </button>
                  <span
                    className={cn(
                      "text-xs text-gray-600 flex-1 leading-relaxed",
                      !isPromptExpanded && "line-clamp-2"
                    )}
                  >
                    {formatContent(revision.editPrompt || "")}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-gray-600 leading-relaxed">
                  {revision.editPrompt
                    ? formatContent(revision.editPrompt)
                    : ""}
                </span>
              )}
            </div>
          )}

          {/* Actions - Bottom of card */}
          <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-100">
            {hasTechPack && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShowTechPack?.(revision);
                }}
                className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-200 hover:from-emerald-100 hover:to-teal-100 hover:border-emerald-300 rounded-md transition-colors cursor-pointer"
                title="View Tech Pack"
              >
                <Package className="h-3 w-3" />
                <span>Tech Pack</span>
              </button>
            )}
            <button
              className="details-toggle flex items-center gap-1 px-2 py-1 text-[10px] text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-all duration-150"
              onClick={(e) => {
                e.stopPropagation();
                onShowDetails(revision);
              }}
              aria-label="Show details"
            >
              <Info className="h-3 w-3" />
              <span>Details</span>
            </button>
            {!revision.isActive && !isDemo && (
              <button
                className="delete-button flex items-center gap-1 px-2 py-1 text-[10px] text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-all duration-150"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (
                    confirm(
                      `Are you sure you want to delete Revision #${revision.revisionNumber}?`
                    )
                  ) {
                    await onDelete(revision.id);
                  }
                }}
                aria-label="Delete revision"
              >
                <Trash2 className="h-3 w-3" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function RevisionHistory({
  revisions,
  onRollback,
  onDelete,
  onToggle,
  isLoading = false,
  onGenerateTechPack,
  isGeneratingTechPack = false,
  selectedRevision,
  techPackGeneratedFor,
  revisionTechPacks = {},
  productId,
  productLinkedRevisionId,
  isDemo = false,
  workflowMode,
  setWorkflowMode,
  onSwitchToCanvas,
  existingDimensions,
  existingMaterials,
  frontImageUrl,
  onDimensionsUpdated,
}: RevisionHistoryProps) {
  const [modalRevision, setModalRevision] = useState<MultiViewRevision | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  // Tech pack modal state
  const [techPackModalRevision, setTechPackModalRevision] =
    useState<MultiViewRevision | null>(null);
  const [showTechPackModal, setShowTechPackModal] = useState(false);
  const [techPackData, setTechPackData] = useState<any>(null);
  const [techPackLoading, setTechPackLoading] = useState(false);
  const [techpackDetails, setTechpackDetails] = useState<any>(null);

  // Product specs modal state
  const [showProductSpecsModal, setShowProductSpecsModal] = useState(false);
  // Create product confirmation dialog state
  const [showCreateConfirmDialog, setShowCreateConfirmDialog] = useState(false);
  const {
    getTechPack,
    loadingGetTechPack,
    errorGetTechPack,
    refreshGetTechPack,
    setGetTechPack,
  } = useGetTechPackStore();

  const { getCreatorCredits, refresCreatorCredits } = useGetCreditsStore();
  const credits = getCreatorCredits;
  // Debug: Log revisions prop changes
  devLog(
    "revision-history-props",
    {
      revisionsCount: revisions.length,
      isLoading,
      productId,
    },
    "RevisionHistory props"
  );

  useEffect(() => {
    const fetchtechpack = async () => {
      if (!productId) {
        console.error("No product ID available");
        return;
      }
      await refreshGetTechPack({ id: productId });
    };
    fetchtechpack();
  }, [productId]);

  // Safe throttled logging
  devLog("tech-pack-data", getTechPack, "tech pack fetched");
  // Sort revisions by date, newest first
  const sortedRevisions = [...revisions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleShowDetails = (revision: MultiViewRevision) => {
    setModalRevision(revision);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTimeout(() => setModalRevision(null), 200);
  };

  // Handler to show tech pack modal
  const handleShowTechPack = async (revision: MultiViewRevision) => {
    setTechPackModalRevision(revision);
    setShowTechPackModal(true);
    setTechPackLoading(true);
    setTechPackData(null);

    try {
      // Import the function to get tech packs
      const { getTechPacksForProduct } = await import(
        "@/app/actions/tech-pack-management"
      );
      if (!productId) {
        console.error("No product ID available");
        return;
      }

      const result = await getTechPacksForProduct(productId);
      if (result.success && result.techPacks) {
        // Find the tech pack for this revision by revision_number
        const techPack = result.techPacks.find(
          (tp: any) => tp.revision_number === revision.revisionNumber
        );

        if (techPack) {
          console.log(
            "✅ Tech pack found for revision:",
            revision.revisionNumber
          );
          setTechPackData(techPack.tech_pack_data);
        } else {
          console.log(
            "⚠️ No tech pack found for revision:",
            revision.revisionNumber
          );
        }
      }
    } catch (error) {
      console.error("Error fetching tech pack:", error);
    } finally {
      setTechPackLoading(false);
    }
  };

  const handleCloseTechPackModal = () => {
    setShowTechPackModal(false);
    setTimeout(() => {
      setTechPackModalRevision(null);
      setTechPackData(null);
    }, 200);
  };

  // Get the revision that will be used for tech pack generation (always active revision)
  const getTargetRevision = () => {
    return revisions.find((r) => r.isActive) || revisions[0];
  };

  // Format content to shorten URLs
  const formatContent = (content: string) => {
    // Regular expression to match URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    return content.replace(urlRegex, (url) => {
      // If URL is short enough, don't modify it
      if (url.length <= 20) {
        return url;
      }

      // Extract the first 10 chars and last 7 chars
      const firstPart = url.substring(0, 10);
      const lastPart = url.substring(url.length - 7);

      return `${firstPart}...${lastPart}`;
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/50 overflow-hidden">
      <div className="p-4 border-b bg-white flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Revision History</h3>
          </div>
          {onToggle && (
            <button
              onClick={onToggle}
              className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all group"
              aria-label="Hide revision history"
            >
              <ArrowRight className="h-4 w-4 text-gray-600 group-hover:text-gray-800 transition-colors" />
            </button>
          )}
        </div>
        <span className="text-xs text-gray-500">
          {revisions.length} revision{revisions.length !== 1 ? "s" : ""} (all
          views)
        </span>
      </div>

      <ScrollArea className="flex-1 overflow-hidden">
        <div className="h-full">
          {isLoading ? (
            // Loading skeleton - elegant shimmer effect
            <div className="p-4 space-y-3">
              {[1].map((i) => (
                <div
                  key={i}
                  className="relative bg-white rounded-xl border-2 border-gray-200/80 p-4 overflow-hidden"
                >
                  {/* Shimmer overlay */}
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />

                  {/* Thumbnail skeleton */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[1, 2, 3].map((j) => (
                      <div
                        key={j}
                        className="relative w-full aspect-square bg-gradient-to-br from-stone-100 to-stone-200/50 rounded-lg animate-pulse"
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-stone-300/40" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Content skeleton */}
                  <div className="space-y-2">
                    {/* Status and timestamp bar */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="h-5 bg-gradient-to-r from-stone-200 to-stone-100 rounded-full w-16 animate-pulse" />
                      <div className="h-3 bg-stone-200/60 rounded w-20 animate-pulse" />
                    </div>

                    {/* Prompt skeleton */}
                    <div className="bg-stone-50 rounded-md p-2 space-y-1.5">
                      <div className="h-3 bg-stone-300/50 rounded w-full animate-pulse" />
                      <div className="h-3 bg-stone-300/50 rounded w-4/5 animate-pulse" />
                      <div className="h-3 bg-stone-300/50 rounded w-3/5 animate-pulse" />
                    </div>

                    {/* Actions bar skeleton */}
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-100">
                      <div className="h-6 bg-stone-200/60 rounded-md w-16 animate-pulse" />
                      <div className="h-6 bg-stone-200/60 rounded-md w-14 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : sortedRevisions.length === 0 ? (
            <div className="p-8 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 rounded-full bg-cream">
                  <Layers className="h-8 w-8 text-taupe" />
                </div>
              </div>
              <div className="text-sm font-medium text-navy">
                No revisions yet
              </div>
              <div className="text-xs mt-1 text-gray-500">
                Your design history will appear here
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {sortedRevisions.map((revision) => (
                <RevisionItem
                  key={revision.id}
                  revision={revision}
                  onRollback={onRollback}
                  onDelete={onDelete}
                  formatContent={formatContent}
                  onShowDetails={handleShowDetails}
                  hasTechPack={revisionTechPacks[revision.id] || false}
                  productId={productId}
                  onShowTechPack={handleShowTechPack}
                  isDemo={isDemo}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Generate Tech Pack Button */}
      {onGenerateTechPack && !isDemo && (
        <div className="p-4 border-t bg-white flex-shrink-0">
          {/* Revision and Tech Pack status */}
          {revisions.length > 0 && (
            <div className="text-xs mb-3 text-center">
              {(() => {
                const targetRevision = getTargetRevision();
                if (!targetRevision)
                  return (
                    <span className="text-gray-500">
                      No revisions available
                    </span>
                  );

                // Check if this revision is already linked to a product
                // Note: productLinkedRevisionId is the front view's individual row ID from product_multiview_revisions
                // We need to check if it matches the front view's revisionId within this batch/group
                const frontViewRevisionId = targetRevision.views?.front?.revisionId;
                const isLinkedToProduct = !!(productLinkedRevisionId && frontViewRevisionId && productLinkedRevisionId === frontViewRevisionId);
                const hasTechPack = techPackGeneratedFor === targetRevision.id;

                devLog(
                  "tech-pack-generated",
                  { techPackGeneratedFor, targetRevisionId: targetRevision.id, frontViewRevisionId, productLinkedRevisionId, isLinkedToProduct },
                  "tech pack generation status"
                );

                return (
                  <div className="space-y-1">
                    <div className="text-gray-500">
                      {targetRevision.isActive
                        ? `Product will be created based on selected revision #${targetRevision.revisionNumber}`
                        : `Product will be created based on revision #${targetRevision.revisionNumber}`}
                    </div>

                    {isLinkedToProduct && productId && (
                      <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="text-gray-600 font-medium flex items-center justify-center gap-1 mb-2">
                          <span>Product already created from this revision</span>
                        </div>
                        <Link
                          href={`/product/${productId}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View Current Product
                        </Link>
                      </div>
                    )}

                    {hasTechPack && !isLinkedToProduct && (
                      <div className="text-gray-600 font-medium flex items-center justify-center gap-1">
                        <span>Product created</span>
                      </div>
                    )}

                    {!targetRevision.isActive && (
                      <div className="text-amber-600 text-xs">
                        💡 Click on a revision to select it for product creation
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Buttons section */}
          <div className="flex flex-col items-center justify-center gap-2 w-full">
            {(() => {
              const targetRevision = getTargetRevision();
              // Check if front view's revisionId matches the productLinkedRevisionId
              const frontViewRevisionId = targetRevision?.views?.front?.revisionId;
              const isLinkedToProduct = !!(productLinkedRevisionId && frontViewRevisionId && productLinkedRevisionId === frontViewRevisionId);
              const hasTechPack = revisionTechPacks[targetRevision?.id || ""] || false;

              // If revision is already linked, show "Recreate Product" button
              if (isLinkedToProduct) {
                return (
                  <Button
                    onClick={async () => {
                      // Check credits
                      if ((getCreatorCredits?.credits ?? 0) <= 0) {
                        toast({
                          variant: "destructive",
                          title: "Insufficient Credits",
                          description:
                            "You need at least 1 credit to regenerate the product.",
                        });
                        return;
                      }

                      // Proceed with regenerating
                      if (onGenerateTechPack) {
                        await onGenerateTechPack();
                      }

                      // Redirect to product page
                      if (productId) {
                        router.push(`/product/${productId}`);
                      }
                    }}
                    variant="outline"
                    disabled={isGeneratingTechPack || !revisions.length}
                    className="w-full shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isGeneratingTechPack ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Recreating Product...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        Recreate Product
                      </>
                    )}
                  </Button>
                );
              }

              // Check if we're on the Factory Specs tab
              const isOnFactorySpecs = workflowMode === "tech-pack";

              // Check if dimensions are already approved (have approvedAt timestamp)
              const dimensionsAlreadyApproved = !!(existingDimensions?.approvedAt);

              // If NOT on Factory Specs, show "Next" button that navigates to Factory Specs
              if (!isOnFactorySpecs && setWorkflowMode) {
                return (
                  <Button
                    onClick={() => {
                      // Check credits
                      if ((getCreatorCredits?.credits ?? 0) <= 0) {
                        toast({
                          variant: "destructive",
                          title: "Insufficient Credits",
                          description:
                            "You need at least 1 credit to generate the tech pack.",
                        });
                        return;
                      }

                      // Navigate to Factory Specs tab
                      // Specs modal is only triggered by the "Set Specifications" button in Factory Specs
                      setWorkflowMode("tech-pack");
                      // Switch to Canvas tab on mobile
                      onSwitchToCanvas?.();
                    }}
                    variant="default"
                    disabled={isGeneratingTechPack || !revisions.length}
                    className="w-full shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <ArrowRight className="h-4 w-4" />
                    Next
                  </Button>
                );
              }

              // On Factory Specs - show "Create Product" button
              return (
                <Button
                  onClick={() => {
                    // Check credits first
                    if ((getCreatorCredits?.credits ?? 0) <= 0) {
                      toast({
                        variant: "destructive",
                        title: "Insufficient Credits",
                        description:
                          "You need at least 1 credit to generate the tech pack.",
                      });
                      return;
                    }

                    // Go directly to confirmation dialog
                    // Specs modal is only triggered by the "Set Specifications" button in Factory Specs
                    setShowCreateConfirmDialog(true);
                  }}
                  variant="default"
                  disabled={isGeneratingTechPack || !revisions.length}
                  className="w-full shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isGeneratingTechPack ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating Product...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      Create Product
                    </>
                  )}
                </Button>
              );
            })()}
          </div>
        </div>
      )}

      {/* View Tech Pack Button (Demo Mode) */}
      {isDemo && productId && (
        <div className="p-4 border-t bg-white flex-shrink-0">
          <Button
            onClick={() => router.push(`/p/${productId}`)}
            variant="default"
            className="w-full"
          >
            <Package className="mr-2 h-4 w-4" />
            View Tech Pack
          </Button>
        </div>
      )}

      {/* Revision Detail Modal */}
      <RevisionDetailModal
        revision={modalRevision}
        isOpen={showModal}
        onClose={handleCloseModal}
        onRollback={onRollback}
        formatContent={formatContent}
      />

      {/* Tech Pack Modal */}
      <TechPackModal
        revision={techPackModalRevision}
        techPack={techPackData}
        isOpen={showTechPackModal}
        onClose={handleCloseTechPackModal}
        isLoading={techPackLoading}
      />

      {/* Product Specs Modal */}
      {productId && (
        <ProductSpecsModal
          isOpen={showProductSpecsModal}
          onClose={() => setShowProductSpecsModal(false)}
          onApprove={async (dimensions: DimensionsData, materials?: MaterialsData) => {
            // Update dimensions state so the modal won't show again on Next click
            onDimensionsUpdated?.(dimensions);
            // Only close the specs modal - user will click Create Product separately when ready
            setShowProductSpecsModal(false);
          }}
          productId={productId}
          existingDimensions={existingDimensions}
          existingMaterials={existingMaterials}
          frontImageUrl={frontImageUrl || getTargetRevision()?.views?.front?.imageUrl}
        />
      )}

      {/* Create Product Confirmation Dialog */}
      <Dialog open={showCreateConfirmDialog} onOpenChange={setShowCreateConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirm Product Creation
            </DialogTitle>
            <DialogDescription className="text-left pt-2">
              Are you sure? Creating the product will make the product ready for the factory review - editing materials, dimensions or core parts will not be possible, and it will require editing a new revision of the product.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowCreateConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                setShowCreateConfirmDialog(false);

                // Create product
                if (onGenerateTechPack) {
                  await onGenerateTechPack();
                }

                // Redirect to product page
                if (productId) {
                  router.push(`/product/${productId}`);
                }
              }}
            >
              Yes, Create Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RevisionHistory;

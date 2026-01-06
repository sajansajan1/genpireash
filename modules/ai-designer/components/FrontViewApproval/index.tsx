/**
 * FrontViewApproval Component
 *
 * Displays the generated front view with prominent approval controls.
 * Part of the faster interactive workflow - allows users to approve or edit
 * the front view before generating remaining views.
 *
 * Features:
 * - Hero image display of front view
 * - Primary CTA: Approve button
 * - Secondary: Request Changes with textarea
 * - Quick edit suggestion chips
 * - Iteration counter
 * - Credit cost indicator
 * - Loading states
 * - Mobile responsive
 * - Framer Motion animations
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Edit3,
  Loader2,
  Sparkles,
  AlertCircle,
  Clock,
  Coins,
  ChevronUp,
  LucideIcon,
  ImageIcon,
  Layers,
  Wand2,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetCreditsStore } from "@/lib/zustand/credits/getCredits";

/**
 * Reusable Step Card Component
 */
interface StepCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  completed?: boolean;
  delay?: number;
}

const StepCard: React.FC<StepCardProps> = ({
  title,
  description,
  icon,
  completed = false,
  delay = 0.1,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: completed ? -10 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="relative pl-12"
    >
      {/* Content */}
      <div
        className={cn(
          "relative rounded-lg p-3 shadow-sm pr-12",
          completed
            ? "bg-[hsl(35,25%,96%)] border-2 border-[hsl(30,20%,85%)]"
            : "bg-transparent border-2 border-[hsl(30,20%,85%)]"
        )}
      >
        {/* Icon Badge - Positioned at far right, vertically centered */}
        <div
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full shadow-lg z-10",
            completed
              ? "bg-black text-white"
              : "border-2 border-[hsl(30,20%,85%)] bg-transparent text-[hsl(30,20%,85%)]"
          )}
        >
          {icon}
        </div>

        <h3 className="text-sm font-bold text-[hsl(25,20%,25%)] mb-0.5">
          {title}
        </h3>
        <p className="text-xs text-[hsl(25,15%,40%)]">{description}</p>
      </div>
    </motion.div>
  );
};

/**
 * Workflow Progress Bar Component
 * Shows the 4-step workflow: Front View → Views → AI Product Editor → Factory Specs
 */
interface WorkflowStep {
  label: string;
  icon: React.ReactNode;
  completed: boolean;
  active: boolean;
}

interface WorkflowProgressBarProps {
  currentStep: number; // 1-based index (1 = Front View, 2 = Views, etc.)
}

const WorkflowProgressBar: React.FC<WorkflowProgressBarProps> = ({
  currentStep,
}) => {
  const steps: WorkflowStep[] = [
    {
      label: "Front",
      icon: <ImageIcon className="h-4 w-4" />,
      completed: currentStep > 1,
      active: currentStep === 1,
    },
    {
      label: "Views",
      icon: <Layers className="h-4 w-4" />,
      completed: currentStep > 2,
      active: currentStep === 2,
    },
    {
      label: "Editor",
      icon: <Wand2 className="h-4 w-4" />,
      completed: currentStep > 3,
      active: currentStep === 3,
    },
    {
      label: "Files",
      icon: <FileText className="h-4 w-4" />,
      completed: currentStep > 4,
      active: currentStep === 4,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full mb-3"
    >
      <div className="flex flex-col">
        {/* Row with circles and lines */}
        <div className="flex items-center px-4">
          {steps.map((step, index) => (
            <React.Fragment key={step.label}>
              {/* Step circle */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.2 }}
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-white flex-shrink-0",
                  step.completed
                    ? "!bg-black border-black text-white"
                    : step.active
                      ? "border-black text-black"
                      : "border-gray-300 text-gray-400"
                )}
              >
                {step.completed ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  step.icon
                )}
              </motion.div>

              {/* Connector line between steps */}
              {index < steps.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: "2px",
                    backgroundColor: "#d1d5db",
                    marginLeft: "4px",
                    marginRight: "4px",
                    position: "relative",
                    minWidth: "20px",
                  }}
                >
                  <motion.div
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: 0,
                      backgroundColor: "#000",
                    }}
                    initial={{ width: "0%" }}
                    animate={{ width: step.completed ? "100%" : "0%" }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.1,
                      ease: "easeOut",
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Row with labels */}
        <div className="flex items-start px-4 mt-1">
          {steps.map((step, index) => (
            <React.Fragment key={`label-${step.label}`}>
              {/* Label container - same width as circle */}
              <div className="w-7 flex-shrink-0 flex justify-center">
                <span
                  className={cn(
                    "text-[10px] sm:text-xs text-center font-medium leading-tight whitespace-nowrap",
                    step.completed || step.active
                      ? "text-gray-900"
                      : "text-gray-400"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Spacer to match connector line width */}
              {index < steps.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    marginLeft: "4px",
                    marginRight: "4px",
                    minWidth: "20px",
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

interface FrontViewVersion {
  id: string;
  frontViewUrl: string;
  iterationNumber: number;
  createdAt: string;
}

interface FrontViewApprovalProps {
  frontViewUrl: string;
  approvalId: string;
  iterationCount: number;
  onApprove: () => Promise<void>;
  onRequestEdit: (feedback: string) => Promise<void>;
  productName: string;
  isProcessing?: boolean;
  creditsForRemaining?: number;
  allVersions?: FrontViewVersion[];
  onVersionChange?: (versionId: string) => void;
  onSkip?: () => void; // Callback to skip and return to editor
  hasExistingRevisions?: boolean; // Whether product has existing revisions
  setShowPaymentModal?: any;
  isDemo?: boolean; // Whether in demo mode (read-only)
}

export function FrontViewApproval({
  frontViewUrl,
  approvalId,
  iterationCount,
  onApprove,
  onRequestEdit,
  productName,
  isProcessing = false,
  creditsForRemaining = 3, // 4 remaining views (back, side, top, bottom) = 3 credits total
  allVersions = [],
  onVersionChange,
  onSkip,
  hasExistingRevisions = false,
  setShowPaymentModal,
  isDemo = false,
}: FrontViewApprovalProps) {
  // Debug: Log versions
  console.log("🎨 FrontViewApproval - allVersions:", allVersions);
  console.log("🎨 FrontViewApproval - approvalId:", approvalId);
  console.log("🎨 FrontViewApproval - iterationCount:", iterationCount);
  console.log(
    "🎨 FrontViewApproval - hasExistingRevisions:",
    hasExistingRevisions
  );
  console.log(
    "🎨 FrontViewApproval - Should show placeholders?",
    !hasExistingRevisions
  );

  // Local state
  const [showEditForm, setShowEditForm] = useState(true); // Open by default
  const [editFeedback, setEditFeedback] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isRequestingEdit, setIsRequestingEdit] = useState(false);
  const { getCreatorCredits } = useGetCreditsStore();
  // Quick edit suggestions
  const quickEditSuggestions = [
    "Try a new color direction",
    "Tweak shape & dimensions",
    "Explore new styles",
    "Add complexity",
    "Make it cleaner",
    "Sharper, more realistic finish",
  ];

  // Handle approve action
  const handleApprove = async () => {
    setIsApproving(true);

    try {
      // Defensive check to prevent null/undefined issues
      const credits = getCreatorCredits?.credits ?? 0;

      // Check if user has enough credits for generating 4 remaining views (requires 2 credits)
      if (credits < creditsForRemaining) {
        setShowPaymentModal(true);
        setIsApproving(false);
        return; // ensure execution stops here
      }

      await onApprove();
    } catch (err) {
      console.error("Approval failed:", err);
    } finally {
      setIsApproving(false);
    }
  };

  // Handle request edit action
  const handleRequestEdit = async () => {
    if (!editFeedback.trim()) {
      return;
    }

    setIsRequestingEdit(true);
    try {
      const credits = getCreatorCredits?.credits ?? 0;
      if (credits <= 0) {
        setShowPaymentModal(true);
        return;
      }

      await onRequestEdit(editFeedback);
      setEditFeedback("");
      setShowEditForm(false);
    } finally {
      setIsRequestingEdit(false);
    }
  };

  // Handle quick suggestion click
  const handleQuickSuggestion = (suggestion: string) => {
    setEditFeedback(suggestion);
    setShowEditForm(true);
  };

  const isLoading = isApproving || isRequestingEdit || isProcessing;
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const [imageKey, setImageKey] = React.useState(0);

  console.log("🖼️ FrontViewApproval received props:", {
    frontViewUrl,
    approvalId,
    iterationCount,
    productName,
  });

  // Force image reload when URL changes
  React.useEffect(() => {
    console.log("🔄 Front view URL changed, forcing reload:", frontViewUrl);
    setImageLoaded(false);
    setImageError(false);
    setImageKey((prev) => prev + 1);
  }, [frontViewUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-lg mx-auto px-4 py-6 space-y-6"
    >
      {/* Workflow Progress Bar */}
      <WorkflowProgressBar currentStep={1} />

      {/* Timeline Container */}
      <div className="relative">
        {/* Continuous Vertical Timeline Line */}
        <div className="absolute left-[17px] top-[18px] bottom-[18px] w-0.5 bg-gradient-to-b from-[hsl(28,80%,55%)] via-gray-300 to-[hsl(28,80%,55%)] z-0"></div>

        {/* Step 1 - Completed */}
        <div className="mb-6">
          <StepCard
            title="Step 1/4: Front View Generated"
            description="Your product's front view is ready for review"
            icon={<CheckCircle2 className="h-5 w-5" />}
            completed={true}
            delay={0.1}
          />
        </div>

        {/* Header */}
        <div className="text-center space-y-2 relative z-50 pl-12 mb-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <h2 className="text-lg font-bold text-gray-900">
              Build Your Factory-Ready Product
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="text-xs text-gray-600"
          >
            We'll generate 4 additional views (back, left, right, top) to complete your product.
          </motion.p>
        </div>

        {/* Primary CTA - Generate All Views (moved to top) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3 }}
          className="pl-12 mb-4"
        >
          <Card className="bg-gray-50 border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              {/* What you'll get section - compact inline */}
              <div className="mb-3 flex items-center justify-center gap-1.5 text-[10px] text-gray-500">
                <Layers className="h-3 w-3 text-gray-400" />
                <span>Generate 4 remaining views: Back, Left, Right, Top</span>
              </div>

              <Button
                onClick={handleApprove}
                disabled={isLoading || isDemo}
                size="lg"
                style={{
                  backgroundColor: "#1a1a1a",
                  color: "white",
                }}
                className={cn(
                  "w-full h-10 text-xs font-semibold rounded-lg mt-4",
                  "shadow-md hover:shadow-lg",
                  "transition-all duration-200"
                )}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = "#404040";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = "#1a1a1a";
                  }
                }}
              >
                {isApproving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Views...
                  </>
                ) : (
                  <>
                    <Layers className="mr-2 h-4 w-4" />
                    Generate All Views
                  </>
                )}
              </Button>

              {/* Credit & Time Info */}
              <div className="mt-2 flex items-center justify-center gap-3 text-[11px] text-gray-500">
                <div className="flex items-center gap-1">
                  <Coins className="h-3 w-3" />
                  <span>{creditsForRemaining} credits</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-gray-400" />
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>~2 minutes</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Hero Image Display */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="pl-12 mb-6"
        >
          <Card className="overflow-hidden shadow-xl border-2 border-gray-200">
            <CardContent className="p-0">
              <div className="relative w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100">
                {/* Loading state - show generation progress */}
                {!imageLoaded && !imageError && (
                  <div className="absolute inset-0 bg-cream/80 backdrop-blur-xl flex flex-col items-center justify-center z-10">
                    <div className="text-center">
                      <div className="relative mb-4">
                        {/* Animated rings */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-20 w-20 rounded-full border-2 border-navy/20 animate-pulse"></div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-16 w-16 rounded-full border-t-2 border-navy animate-spin"></div>
                        </div>
                        {/* Center dot */}
                        <div className="relative flex items-center justify-center h-20 w-20">
                          <div className="h-2.5 w-2.5 rounded-full bg-navy animate-pulse"></div>
                        </div>
                      </div>
                      <div className="text-base font-semibold text-navy mb-2">
                        Generating Your Front View
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm text-navy/70 mb-3">
                        <Clock className="h-4 w-4" />
                        <span>~30 seconds</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-taupe animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="h-1.5 w-1.5 rounded-full bg-taupe animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="h-1.5 w-1.5 rounded-full bg-taupe animate-bounce"></span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error state */}
                {imageError && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-3 p-6">
                      <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Failed to load image
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Click below to open in new tab
                        </p>
                        <a
                          href={frontViewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 mt-2 font-mono break-all underline block"
                        >
                          {frontViewUrl}
                        </a>
                        <button
                          onClick={() => {
                            console.log("🔄 Retrying image load");
                            setImageKey((prev) => prev + 1);
                            setImageError(false);
                            setImageLoaded(false);
                          }}
                          className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                        >
                          Retry Loading Image
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Image - always visible with proper z-index */}
                <div className="absolute inset-0" style={{ zIndex: 100 }}>
                  <img
                    key={imageKey}
                    src={frontViewUrl}
                    alt="Front view"
                    className={cn(
                      "w-full h-full object-contain transition-all duration-300",
                      (isRequestingEdit || isApproving) && "blur-sm"
                    )}
                    style={{
                      display: "block",
                      opacity: 1,
                      visibility: "visible",
                      maxWidth: "100%",
                      maxHeight: "100%",
                      zIndex: 100,
                      position: "relative",
                    }}
                    draggable={false}
                    onLoad={(e) => {
                      console.log(
                        "✅ Image loaded successfully:",
                        frontViewUrl
                      );
                      console.log(
                        "🎨 Image dimensions:",
                        e.currentTarget.naturalWidth,
                        "x",
                        e.currentTarget.naturalHeight
                      );
                      console.log(
                        "🎨 Image complete:",
                        e.currentTarget.complete
                      );
                      setImageLoaded(true);
                      setImageError(false);
                    }}
                    onError={(e) => {
                      console.error(
                        "❌ Image failed to load:",
                        frontViewUrl,
                        e
                      );
                      setImageError(true);
                      setImageLoaded(false);
                    }}
                  />
                </div>

                {/* Regenerating overlay - same as canvas views */}
                {isRequestingEdit && (
                  <div className="absolute inset-0 bg-cream/80 backdrop-blur-xl flex flex-col items-center justify-center z-[150]">
                    <div className="text-center">
                      <div className="relative">
                        {/* Animated rings */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-16 w-16 rounded-full border-2 border-navy/20 animate-pulse"></div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-12 w-12 rounded-full border-t-2 border-navy animate-spin"></div>
                        </div>
                        {/* Center dot */}
                        <div className="relative flex items-center justify-center h-16 w-16">
                          <div className="h-2 w-2 rounded-full bg-navy animate-pulse"></div>
                        </div>
                      </div>
                      <div className="text-navy/80 text-sm font-medium mt-4 tracking-wide">
                        Regenerating
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <span className="h-1 w-1 rounded-full bg-taupe animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="h-1 w-1 rounded-full bg-taupe animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="h-1 w-1 rounded-full bg-taupe animate-bounce"></span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Generating views overlay */}
                {isApproving && (
                  <div className="absolute inset-0 bg-cream/80 backdrop-blur-xl flex flex-col items-center justify-center z-[150]">
                    <div className="text-center">
                      <div className="relative mb-4">
                        {/* Animated rings */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-20 w-20 rounded-full border-2 border-navy/20 animate-pulse"></div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-16 w-16 rounded-full border-t-2 border-navy animate-spin"></div>
                        </div>
                        {/* Center icon */}
                        <div className="relative flex items-center justify-center h-20 w-20">
                          <Layers className="h-6 w-6 text-navy animate-pulse" />
                        </div>
                      </div>
                      <div className="text-base font-semibold text-navy mb-1">
                        Generating Views
                      </div>
                      <div className="text-xs text-navy/60 mb-3">
                        Creating back, left, right, top views
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm text-navy/70 mb-3">
                        <Clock className="h-4 w-4" />
                        <span>~2 minutes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-taupe animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="h-1.5 w-1.5 rounded-full bg-taupe animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="h-1.5 w-1.5 rounded-full bg-taupe animate-bounce"></span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Overlay gradient for better text visibility */}
                {imageLoaded && !isRequestingEdit && !isApproving && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none z-20" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Version Selector - Below Image */}
          {allVersions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.3 }}
              className="flex items-center justify-center gap-2 flex-wrap mt-3"
            >
              {[...allVersions].reverse().map((version) => (
                <motion.button
                  key={version.id}
                  onClick={() => {
                    if (
                      onVersionChange &&
                      version.id !== approvalId &&
                      !isDemo
                    ) {
                      onVersionChange(version.id);
                    }
                  }}
                  disabled={isDemo}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-[11px] font-medium transition-all duration-200",
                    version.id === approvalId
                      ? "bg-black text-white shadow-sm"
                      : isDemo
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                  whileHover={version.id !== approvalId ? { scale: 1.05 } : {}}
                  whileTap={version.id !== approvalId ? { scale: 0.95 } : {}}
                >
                  V{version.iterationNumber}
                </motion.button>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Step 2 - Next Action */}
        <StepCard
          title="Step 2/4: Generate 4 More Views"
          description="Back • Left • Right • Top (~2 minutes)"
          icon={<Clock className="h-5 w-5" />}
          completed={false}
          delay={0.35}
        />
      </div>

      {/* Secondary Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="space-y-3"
      >
        {/* Request Changes - Secondary Action */}
        <div className="space-y-3">
          <Button
            onClick={() => setShowEditForm(!showEditForm)}
            disabled={isLoading}
            size="lg"
            className={cn(
              "w-full h-9 text-xs rounded-lg",
              "bg-transparent border-2 border-[hsl(30,20%,85%)]",
              "text-black",
              "hover:bg-[hsl(35,25%,96%)]",
              "shadow-md hover:shadow-lg",
              "transition-all duration-200"
            )}
          >
            {showEditForm ? (
              <>
                <ChevronUp className="mr-2 h-3.5 w-3.5" />
                Hide Edit Options
              </>
            ) : (
              <>
                <Edit3 className="mr-2 h-3.5 w-3.5" />
                Request Changes
              </>
            )}
          </Button>

          {/* Edit Form - Expandable */}
          <AnimatePresence>
            {showEditForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <Card className="border-2 border-gray-300">
                  <CardContent className="p-3 space-y-2">
                    <Textarea
                      value={editFeedback}
                      onChange={(e) => setEditFeedback(e.target.value)}
                      placeholder="Describe what you'd like to change... (e.g., 'Make it blue with rounded corners')"
                      className="min-h-[80px] resize-none !text-[10px] placeholder:!text-[10px] placeholder:text-gray-400"
                      style={{ fontSize: "12px" }}
                      disabled={isLoading}
                    />

                    <div className="flex gap-2">
                      <Button
                        onClick={handleRequestEdit}
                        disabled={!editFeedback.trim() || isLoading || isDemo}
                        style={{
                          backgroundColor: "#1a1a1a",
                          color: "white",
                        }}
                        className={cn(
                          "flex-1 rounded-lg shadow-md disabled:opacity-50 text-xs h-8",
                          "hover:bg-[#404040]",
                          "transition-all duration-200"
                        )}
                        onMouseEnter={(e) => {
                          if (!(!editFeedback.trim() || isLoading)) {
                            e.currentTarget.style.backgroundColor = "#404040";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!(!editFeedback.trim() || isLoading)) {
                            e.currentTarget.style.backgroundColor = "#1a1a1a";
                          }
                        }}
                      >
                        {isRequestingEdit ? (
                          <>
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            Regenerating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                            Regenerate Front View
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => {
                          setShowEditForm(false);
                          setEditFeedback("");
                        }}
                        disabled={isLoading}
                        style={{
                          backgroundColor: "#1a1a1a",
                          color: "white",
                          borderColor: "#1a1a1a",
                        }}
                        className={cn(
                          "rounded-lg shadow-md text-xs h-8",
                          "transition-all duration-200"
                        )}
                        onMouseEnter={(e) => {
                          if (!isLoading) {
                            e.currentTarget.style.backgroundColor = "#404040";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isLoading) {
                            e.currentTarget.style.backgroundColor = "#1a1a1a";
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    </div>

                    <p className="text-[10px] text-gray-500 text-center">
                      <Coins className="inline h-2.5 w-2.5 mr-1" />2 credits
                      will be used to regenerate the front view
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Skip Button - Return to Editor (only show if product has existing revisions) */}
        {onSkip && hasExistingRevisions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <Button
              onClick={onSkip}
              disabled={isLoading}
              variant="ghost"
              size="sm"
              className="w-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              Skip & Return to Editor
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Quick Edit Suggestions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="space-y-2"
      >
        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
          Quick Actions
        </p>
        <div className="flex flex-wrap gap-2">
          {quickEditSuggestions.map((suggestion, index) => (
            <motion.button
              key={suggestion}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.05, duration: 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickSuggestion(suggestion)}
              disabled={isLoading || isDemo}
              className={cn(
                "px-2.5 py-1 rounded-md text-[10px] font-medium",
                "bg-gray-100 hover:bg-gray-200 text-gray-700",
                "border border-gray-300 hover:border-gray-400",
                "transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {suggestion}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Help Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.3 }}
        className="text-center"
      >
        <p className="text-[10px] text-gray-500">
          Approve to generate the remaining 4 views, or request changes to
          refine the front view first.
        </p>
      </motion.div>
    </motion.div>
  );
}

export default FrontViewApproval;

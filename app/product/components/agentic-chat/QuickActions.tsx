"use client";

/**
 * QuickActions component - context-aware quick action buttons
 */

import { cn } from "@/lib/utils";
import {
  FileText,
  Lightbulb,
  Palette,
  Layers,
  RefreshCw,
  Leaf,
  Settings,
  DollarSign,
  CheckCircle,
  Ruler,
  Scale,
  Wrench,
  Package,
  HelpCircle,
  Edit,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QuickAction } from "./types";
import { getQuickActionsForSection } from "./types";

interface QuickActionsProps {
  activeSection: string;
  onAction: (prompt: string, actionId: string) => void;
  disabled?: boolean;
}

/**
 * Map icon names to Lucide components
 */
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText,
  Lightbulb,
  Palette,
  Layers,
  RefreshCw,
  Leaf,
  Settings,
  DollarSign,
  CheckCircle,
  Ruler,
  Scale,
  Wrench,
  Package,
  HelpCircle,
  Edit,
  Sparkles,
};

/**
 * Single quick action button
 */
function QuickActionButton({
  action,
  onClick,
  disabled,
}: {
  action: QuickAction;
  onClick: () => void;
  disabled?: boolean;
}) {
  const IconComponent = iconMap[action.icon] || HelpCircle;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-auto py-1.5 px-2.5 text-xs",
        "border-neutral-700",
        "hover:bg-neutral-800 hover:text-white",
        "text-neutral-300",
        "whitespace-nowrap",
        "bg-transparent",
        "focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
      )}
    >
      <IconComponent className="h-3.5 w-3.5 mr-1.5" />
      {action.label}
    </Button>
  );
}

export function QuickActions({
  activeSection,
  onAction,
  disabled = false,
}: QuickActionsProps) {
  const actions = getQuickActionsForSection(activeSection);

  if (actions.length === 0) return null;

  return (
    <div className="border-t border-neutral-800 px-3 py-2.5 bg-neutral-900">
      <p className="text-xs text-neutral-400 mb-2 uppercase tracking-wide font-medium">
        Quick Actions
      </p>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <QuickActionButton
            key={action.id}
            action={action}
            onClick={() => onAction(action.prompt, action.id)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}

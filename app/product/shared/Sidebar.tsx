"use client";

/**
 * Shared Sidebar Component
 * Works in both authenticated (Zustand store) and public (props) modes
 */

import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  ExternalLink,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems, type NavItem } from "./utils";

interface SharedSidebarProps {
  /** Current active tab */
  activeTab: string;
  /** Callback when tab changes */
  onTabChange: (tab: string) => void;
  /** Whether sidebar is collapsed */
  isCollapsed: boolean;
  /** Callback to toggle collapse state */
  onToggleCollapse: () => void;
  /** Product name for display */
  productName: string;
  /** Product thumbnail URL */
  productThumbnail?: string;
  /** Subtitle text (e.g., "Public preview" or link) */
  subtitle?: React.ReactNode;
  /** Whether this is public/read-only mode */
  readOnly?: boolean;
}

export function SharedSidebar({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  productName,
  productThumbnail,
  subtitle,
  readOnly = false,
}: SharedSidebarProps) {
  // Get the currently active item for display
  const activeItem = navItems.find((item) => item.id === activeTab) || navItems[0];

  // Collapsed state - show icons only with tooltips
  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <aside className="hidden md:flex flex-col items-center py-3 px-2 border-r bg-muted/30 w-[60px] flex-shrink-0">
          {/* Expand button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleCollapse}
                className="h-9 w-9 mb-3 text-muted-foreground hover:text-foreground"
              >
                <PanelLeftOpen className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Expand sidebar</p>
            </TooltipContent>
          </Tooltip>

          {/* Product thumbnail */}
          {productThumbnail && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="mb-4 cursor-pointer">
                  <img
                    src={productThumbnail}
                    alt=""
                    className="h-10 w-10 rounded-lg object-cover border-2 border-muted"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="font-medium">{productName || "Product"}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Divider */}
          <div className="w-8 h-px bg-border mb-3" />

          {/* Section icons - flat navigation */}
          <nav className="flex-1 flex flex-col items-center gap-1 w-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onTabChange(item.id)}
                      className={cn(
                        "w-full flex items-center justify-center p-2 rounded-lg transition-all",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>

          {/* Current active indicator at bottom */}
          {activeItem && (
            <div className="mt-3 pt-3 border-t w-full">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <activeItem.icon className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Viewing: {activeItem.label}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </aside>
      </TooltipProvider>
    );
  }

  // Expanded state - full sidebar with sections
  return (
    <aside className="hidden md:flex md:w-56 lg:w-64 flex-col border-r bg-muted/30 overflow-y-auto flex-shrink-0">
      {/* Header with collapse button */}
      <div className="p-3 border-b">
        <div className="flex items-center gap-2">
          {productThumbnail && (
            <img
              src={productThumbnail}
              alt=""
              className="h-8 w-8 rounded object-cover flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{productName || "Product"}</p>
            {subtitle ? (
              typeof subtitle === "string" ? (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              ) : (
                subtitle
              )
            ) : !readOnly ? (
              <Link
                href="/creator-dashboard"
                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
              >
                View all products
                <ExternalLink className="h-3 w-3" />
              </Link>
            ) : (
              <p className="text-xs text-muted-foreground">Public preview</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-8 w-8 text-muted-foreground hover:text-foreground flex-shrink-0"
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Flat Navigation - no nested items */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-md transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
              {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default SharedSidebar;

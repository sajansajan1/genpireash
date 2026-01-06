"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Settings2, Pencil, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GenerationMode } from "@/app/actions/create-product-entry";

interface GenerationToolOption {
  id: GenerationMode;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const GENERATION_TOOLS: GenerationToolOption[] = [
  {
    id: "regular",
    label: "Regular Mode",
    description: "Standard full-color product generation",
    icon: Sparkles,
  },
  {
    id: "black_and_white",
    label: "B&W Sketch",
    description: "Generate as black & white sketch style",
    icon: Pencil,
  },
];

interface GenerationToolsMenuProps {
  selectedMode: GenerationMode;
  onModeChange: (mode: GenerationMode) => void;
  className?: string;
}

export function GenerationToolsMenu({
  selectedMode,
  onModeChange,
  className,
}: GenerationToolsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Update menu position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // Using fixed positioning, so use viewport-relative coordinates directly
      setMenuPosition({
        top: rect.bottom + 8, // 8px gap below the button
        left: rect.right - 256, // Align right edge of menu with right edge of button (256 = menu width)
      });
    }
  }, [isOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        menuRef.current && !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const selectedTool = GENERATION_TOOLS.find((t) => t.id === selectedMode) || GENERATION_TOOLS[0];
  const isNonRegular = selectedMode !== "regular";

  // Dropdown menu content - rendered via Portal
  const dropdownMenu = isOpen && typeof document !== "undefined" ? createPortal(
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, y: -8, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        style={{
          position: "fixed",
          top: menuPosition.top,
          left: Math.max(16, menuPosition.left), // Ensure minimum 16px from left edge
          zIndex: 99999,
        }}
        className="w-64 bg-white rounded-xl border border-zinc-200 shadow-xl overflow-hidden"
      >
        <div className="p-2">
          <div className="px-2 py-1.5 mb-1">
            <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
              Generation Style
            </p>
          </div>

          {GENERATION_TOOLS.map((tool) => {
            const isSelected = selectedMode === tool.id;
            const IconComponent = tool.icon;

            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => {
                  onModeChange(tool.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-start gap-3 p-2.5 rounded-lg transition-all duration-150",
                  isSelected
                    ? "bg-zinc-100"
                    : "hover:bg-zinc-50"
                )}
              >
                <div
                  className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                    isSelected
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-100 text-zinc-600"
                  )}
                >
                  <IconComponent className="h-4 w-4" />
                </div>

                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isSelected ? "text-zinc-900" : "text-zinc-700"
                      )}
                    >
                      {tool.label}
                    </span>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-zinc-900" />
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {tool.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 bg-zinc-50 border-t border-zinc-100">
          <p className="text-[10px] text-zinc-500">
            Selected mode affects how AI generates your product visuals
          </p>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  ) : null;

  return (
    <div className={cn("relative", className)}>
      {/* Tools Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all duration-200",
          "text-xs font-medium",
          isOpen
            ? "bg-zinc-900 text-white border-zinc-900"
            : isNonRegular
            ? "bg-zinc-100 text-zinc-900 border-zinc-300 hover:bg-zinc-200"
            : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300"
        )}
      >
        <Settings2 className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Tools</span>
        {isNonRegular && (
          <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-zinc-900 text-white rounded">
            {selectedTool.label}
          </span>
        )}
      </button>

      {/* Dropdown Menu - rendered via Portal */}
      {dropdownMenu}
    </div>
  );
}

/**
 * ViewSelector - Dropdown for selecting which view(s) to regenerate
 * Allows users to target specific views or all views for their edits
 */

import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ViewType } from "../../types/editor.types";

export type ViewSelection = "all" | ViewType;

interface ViewSelectorProps {
  value: ViewSelection;
  onChange: (value: ViewSelection) => void;
  disabled?: boolean;
  className?: string;
}

const VIEW_OPTIONS: { value: ViewSelection; label: string; description: string }[] = [
  {
    value: "all",
    label: "All Views",
    description: "Apply changes to all product views",
  },
  {
    value: "front",
    label: "Front View",
    description: "Apply changes to front view only",
  },
  {
    value: "back",
    label: "Back View",
    description: "Apply changes to back view only",
  },
  {
    value: "side",
    label: "Side View",
    description: "Apply changes to side view only",
  },
  {
    value: "top",
    label: "Top View",
    description: "Apply changes to top view only",
  },
  {
    value: "bottom",
    label: "Bottom View",
    description: "Apply changes to bottom view only",
  },
];

export function ViewSelector({ value, onChange, disabled = false, className }: ViewSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const selectedOption = VIEW_OPTIONS.find((opt) => opt.value === value) || VIEW_OPTIONS[0];

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg",
          "border border-gray-200 bg-white hover:bg-gray-50",
          "transition-all duration-200",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white",
          "focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1",
          isOpen && "ring-2 ring-gray-900 ring-offset-1"
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {/* Icon */}
        <Sparkles className={cn("h-3.5 w-3.5 text-gray-600 transition-colors", isOpen && "text-gray-900")} />

        {/* Selected Label */}
        <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
          {selectedOption.label}
        </span>

        {/* Chevron */}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-gray-500 transition-transform duration-200",
            isOpen && "rotate-180 text-gray-900"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            "absolute bottom-full left-0 mb-2 w-56",
            "bg-white rounded-lg shadow-xl border border-gray-200",
            "py-1",
            "animate-in fade-in slide-in-from-bottom-2 duration-200",
            "z-50"
          )}
          role="listbox"
        >
          {VIEW_OPTIONS.map((option) => {
            const isSelected = option.value === value;
            const isAllViews = option.value === "all";

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-start gap-3 px-3 py-2.5",
                  "hover:bg-gray-50 active:bg-gray-100",
                  "transition-colors duration-150",
                  "text-left group/item",
                  isSelected && "bg-gray-50"
                )}
              >
                {/* Checkmark */}
                <div className="flex-shrink-0 mt-0.5">
                  {isSelected ? (
                    <Check className="h-4 w-4 text-gray-900" />
                  ) : (
                    <div className="h-4 w-4" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "text-xs font-medium",
                        isSelected ? "text-gray-900" : "text-gray-700"
                      )}
                    >
                      {option.label}
                    </span>
                    {isAllViews && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-700 border border-blue-200/50">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                    {option.description}
                  </p>
                </div>
              </button>
            );
          })}

          {/* Footer Hint */}
          <div className="px-3 py-2 mt-1 border-t border-gray-100">
            <p className="text-[10px] text-gray-500 leading-tight">
              💡 Tip: Select a specific view for targeted edits, or choose "All Views" for comprehensive changes
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

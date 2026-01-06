/**
 * MobileMenu Component
 * Dropdown menu for mobile with Tutorial, Ideas, and Close options
 */

import React from "react";
import { MoreVertical, LucideMessageCircleQuestion, Lightbulb, X, ExternalLink } from "lucide-react";
import Link from "next/link";

export interface MobileMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onShowTutorial: () => void;
  onShowIdeas: () => void;
  onClose: () => void;
  onSetCleaningSession: (cleaning: boolean) => void;
  productId?: string | null;
  productLinkedRevisionId?: string | null;
}

export function MobileMenu({
  isOpen,
  onToggle,
  onShowTutorial,
  onShowIdeas,
  onClose,
  onSetCleaningSession,
  productId,
  productLinkedRevisionId,
}: MobileMenuProps) {
  const handleClose = async () => {
    onSetCleaningSession(true);
    onToggle(); // Close menu
    // Give a brief moment for UI to show cleaning message
    await new Promise((resolve) => setTimeout(resolve, 300));
    onClose();
  };

  return (
    <div className="sm:hidden relative">
      <button
        onClick={onToggle}
        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        aria-label="More options"
      >
        <MoreVertical className="h-4 w-4 text-gray-700" />
      </button>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[1]"
            onClick={onToggle}
          />

          {/* Menu Content */}
          <div
            className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
            style={{ zIndex: 999999 }}
          >
            <div className="py-1">
              <button
                onClick={() => {
                  onShowTutorial();
                  onToggle();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
              >
                <LucideMessageCircleQuestion className="h-4 w-4 text-gray-700" />
                <span className="text-sm font-medium text-gray-900">
                  Tutorial
                </span>
              </button>
              <button
                onClick={() => {
                  onShowIdeas();
                  onToggle();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
              >
                <Lightbulb className="h-4 w-4 text-gray-700" />
                <span className="text-sm font-medium text-gray-900">
                  Ideas
                </span>
              </button>
              {productLinkedRevisionId && productId && (
                <Link
                  href={`/product/${productId}`}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                  onClick={onToggle}
                >
                  <ExternalLink className="h-4 w-4 text-gray-700" />
                  <span className="text-sm font-medium text-gray-900">
                    View Product
                  </span>
                </Link>
              )}
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={handleClose}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-left"
              >
                <X className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-600">
                  Close Editor
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Image from "next/image";

interface HomepagePopupModalProps {
  onStartForFree: () => void;
}

export function HomepagePopupModal({ onStartForFree }: HomepagePopupModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if modal has been shown in this session
    const hasShownModal = sessionStorage.getItem("homepage-popup-shown");

    if (!hasShownModal) {
      // Show modal after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Mark as shown for this session
    sessionStorage.setItem("homepage-popup-shown", "true");
  };

  const handleStartForFree = () => {
    handleClose();
    onStartForFree();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-20 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 left-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-colors shadow-lg"
        >
          <X className="h-5 w-5 text-zinc-900" />
        </button>

        <div className="flex flex-col">
          {/* Image section - always on top */}
          <div className="relative">
            <Image
              src="/images/female-maker-warehouse.jpg"
              alt="Female maker in warehouse setting"
              width={600}
              height={300}
              // Changed from object-contain to object-cover with object-top to show full width while keeping logo visible
              className="w-full h-56 md:h-72 object-cover object-top"
              priority
            />
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>

          {/* Content section - always below image */}
          <div className="p-6 md:p-8 flex flex-col justify-center">
            <div className="space-y-4 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-zinc-900">Got a Product Idea?</h2>

              <div className="bg-gradient-to-r from-taupe/20 to-cyan/20 p-4 rounded-lg border border-taupe/30">
                <p className="text-lg font-bold text-zinc-900 mb-2">🎉 Limited Launch Promo</p>
                <p className="text-zinc-900 font-semibold">
                  Get <span className="text-cyan font-bold">5 professional product generations</span> for just{" "}
                  <span className="text-2xl font-bold text-zinc-900">$9.99</span>
                </p>
                <p className="text-sm text-zinc-900/70 mt-2">One-time payment • No commitments • Never expires!</p>
              </div>

              {/* Ensured CTA button is always visible with proper styling */}
              <div className="sticky bottom-0 bg-white pt-4">
                <Button
                  onClick={handleStartForFree}
                  size="lg"
                  // Replaced gradient with Genpire brand colors - navy background with cyan hover
                  className="w-full bg-black text-white hover:bg-cyan font-bold text-lg px-8 py-4 shadow-lg transition-colors"
                >
                  {/* Updated button text to reflect product generation */}
                  Create Your Product Today
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

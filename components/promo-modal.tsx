"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogClose, DialogTitle, VisuallyHidden } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
interface PromoModalProps {
  onOpenAuthModal: () => void;
  showAgain?: boolean;
}

export function PromoModal({ onOpenAuthModal, showAgain }: PromoModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  // useEffect(() => {
  //   const modalShown = sessionStorage.getItem("promoModalShown");

  //   if (!modalShown && !hasShown) {
  //     const timer = setTimeout(() => {
  //       setIsOpen(true);
  //       setHasShown(true);
  //       sessionStorage.setItem("promoModalShown", "true");
  //     }, 10000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [hasShown]);

  // 🔥 NEW — show promo again after auth modal closes
  useEffect(() => {
    if (showAgain) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500); // small delay for smoother transition
      return () => clearTimeout(timer);
    }
  }, [showAgain]);

  const handleClose = () => setIsOpen(false);

  const handleStartCreating = () => {
    setIsOpen(false);
    onOpenAuthModal();
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="
      w-[95vw]
      max-w-md sm:max-w-lg lg:max-w-6xl
      p-0
      overflow-hidden
      bg-white
      max-h-[95vh]
      overflow-y-auto
      scrollbar-hide
      border
      rounded-2xl sm:rounded-3xl
      shadow-2xl
      transition-all
      duration-300
    "
      >
        <VisuallyHidden>
          <DialogTitle>Genpire AI Platform - Start Creating</DialogTitle>
        </VisuallyHidden>
        {/* Close Button */}
        <DialogClose
          className="
        absolute right-4 top-4 z-50 
        rounded-full 
        bg-white/90 
        hover:bg-white 
        p-2 
        shadow-md 
        transition-all 
        duration-200 
        hover:scale-110
      "
        >
          <X className="h-4 w-4 text-stone-900" />
          <span className="sr-only">Close</span>
        </DialogClose>

        <div className="flex flex-col lg:flex-row">
          {/* Image Section */}
          <div className="relative w-full lg:w-1/2 h-64 sm:h-80 lg:h-auto">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Group%20338%20%281%29-4bWOuSu9sVCMo0tu1qcVnrqxaHeeER.png"
              alt="Genpire AI Design Platform"
              className="w-full h-full object-cover rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-black/10" />
          </div>

          {/* Content Section */}
          <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="space-y-3">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 leading-tight">
                  Manufacture Your Ideas — with AI
                </h2>
              </div>

              {/* Body */}
              <div className="space-y-4">
                <p className="text-base sm:text-lg text-stone-700 leading-relaxed">
                  Genpire is the all-in-one platform that turns your ideas into real-world products.
                </p>
                <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                  Generate product visuals with our AI, refine designs in seconds, and connect with trusted
                  manufacturers across categories like fashion, furniture, gadgets, and more.
                </p>
              </div>

              {/* CTA Line */}
              <div className="pt-2">
                <p className="text-lg sm:text-xl font-semibold text-stone-900">
                  Starting from only <span className="text-black">$14.90/month</span>
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={handleStartCreating}
                  size="lg"
                  variant="default"
                  className="w-full h-12 text-base font-medium rounded-xl border-2 transition-all duration-300"
                >
                  Start Creating
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <Link href="/pricing" className="flex-1" onClick={handleClose}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full h-12 text-base font-medium rounded-xl border-2 border-stone-300 hover:bg-stone-50 transition-all duration-300 bg-transparent"
                  >
                    View Plans
                  </Button>
                </Link>
              </div>

              {/* Subtext */}
              <p className="text-xs sm:text-sm text-stone-500 text-center pt-2">
                Join thousands of creators using Genpire to design, prototype, and manufacture smarter.
              </p>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface CollectionModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  iconSrc?: string;
}

export function CollectionModalLoader({
  isOpen,
  title = "Creating your collection...",
  description = "Please wait while we set things up. This should only take a moment.",
  iconSrc = "/g-black.png",
}: CollectionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-sm sm:max-w-md w-full"
      >
        <div className="flex flex-col items-center text-center space-y-4 sm:space-y-6">
          {/* Logo / Spinner */}
          <div className="relative h-12 w-12 sm:h-16 sm:w-16">
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }} // Faster rotation
            >
              <div className="h-full w-full rounded-full border-2 border-gray-300 border-t-[#1C1917]" />
            </motion.div>

            {/* Center Icon (Smaller "G") */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Image src={iconSrc} alt="Loading Icon" width={20} height={20} className="object-contain" />
            </div>
          </div>

          {/* Title */}
          <AnimatePresence mode="wait">
            <motion.p
              key={title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="text-base sm:text-lg font-semibold text-[#1C1917]"
            >
              {title}
            </motion.p>
          </AnimatePresence>

          {/* Description */}
          <p className="text-sm text-[#1C1917]/70">{description}</p>
        </div>
      </motion.div>
    </div>
  );
}

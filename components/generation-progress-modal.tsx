"use client";
import { motion } from "framer-motion";
import Image from "next/image";

interface GenerationProgressModalProps {
  isLoading: boolean;
  currentStep?: number;
  stepProgress?: number;
  elapsedTime?: number;
  currentFunFact?: string;
  generatedImages?: any;
  title?: string;
  description?: string;
}

export function GenerationProgressModal({
  isLoading,
  stepProgress = 0,
  currentFunFact,
  title,
  description,
}: GenerationProgressModalProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-xs w-full"
      >
        <div className="flex flex-col items-center text-center space-y-5">
          {/* Logo with Pulsing Ring */}
          <div className="relative flex items-center justify-center">
            {/* Pulsing outer ring */}
            <motion.div
              className="absolute w-16 h-16 rounded-full border-2 border-[#1C1917]/30"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.6, 0, 0.6],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            {/* Second pulsing ring */}
            <motion.div
              className="absolute w-16 h-16 rounded-full border border-[#1C1917]/20"
              animate={{
                scale: [1, 1.6, 1],
                opacity: [0.4, 0, 0.4],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3,
              }}
            />
            {/* Logo container */}
            <div className="w-14 h-14 rounded-full bg-[#1C1917] flex items-center justify-center shadow-lg">
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative w-7 h-7"
              >
                <Image src="/g-black.png" alt="Genpire" fill className="object-contain invert" />
              </motion.div>
            </div>
          </div>

          {/* Title Text */}
          <motion.h3
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg font-semibold text-[#1C1917]"
          >
            {title || "Creating Product..."}
          </motion.h3>

          {/* Progress Bar */}
          <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
            {stepProgress > 0 ? (
              <motion.div
                className="h-full bg-[#1C1917] rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${stepProgress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            ) : (
              <motion.div
                className="h-full bg-[#1C1917] rounded-full"
                animate={{
                  x: ["-50%", "150%"],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ width: "40%" }}
              />
            )}
          </div>

          {/* Description Text */}
          {currentFunFact ? (
            <p className="text-xs text-[#1C1917]/60">💡 {currentFunFact}</p>
          ) : (
            <p className="text-xs text-[#1C1917]/60">
              {description || "This takes less than a minute."}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

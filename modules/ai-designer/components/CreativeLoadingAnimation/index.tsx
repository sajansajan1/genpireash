import { motion } from "framer-motion";
import { GenpireLogo } from "@/components/ui/genpire-logo";
import { Paintbrush } from "lucide-react";

interface CreativeLoadingAnimationProps {
  title?: string;
  subtitle?: string;
}

export function CreativeLoadingAnimation({
  title = "Crafting Your Vision",
  subtitle = "Our AI is sketching your design with precision... ~30 seconds",
}: CreativeLoadingAnimationProps) {
  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[hsl(35,20%,96%)] via-[hsl(30,15%,90%)] to-[hsl(28,12%,85%)] pt-16 sm:pt-0">
      <div className="text-center space-y-8 px-4 max-w-2xl">
        {/* Animated Design Canvas */}
        <div className="relative w-80 h-80 mx-auto">
          {/* Canvas frame/border */}
          <div className="absolute inset-0 border-2 border-[hsl(30,12%,85%)] rounded-lg bg-white/50 shadow-sm" />
          {/* Background grid - drawing surface */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-[linear-gradient(to_right,#A8958412_1px,transparent_1px),linear-gradient(to_bottom,#A8958412_1px,transparent_1px)] bg-[size:24px_24px]"
          />

          {/* Center loading spinner */}
          <div className="absolute inset-0 flex items-center justify-center">
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
          </div>

          {/* Animated drawing lines - top */}
          <motion.div
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 0.5,
            }}
            className="absolute top-0 left-0 right-0"
          >
            <svg className="w-full h-20" viewBox="0 0 320 80">
              <motion.path
                d="M 20,40 Q 80,20 160,40 T 300,40"
                stroke="url(#gradient1)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 0.5,
                }}
              />
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#A89584" stopOpacity="0" />
                  <stop offset="50%" stopColor="#A89584" stopOpacity="1" />
                  <stop offset="100%" stopColor="#D3C7B9" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>

          {/* Animated drawing lines - bottom */}
          <motion.div
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 0.5,
              delay: 0.3,
            }}
            className="absolute bottom-0 left-0 right-0"
          >
            <svg className="w-full h-20" viewBox="0 0 320 80">
              <motion.path
                d="M 20,40 Q 80,60 160,40 T 300,40"
                stroke="url(#gradient2)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 0.5,
                  delay: 0.3,
                }}
              />
              <defs>
                <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#D3C7B9" stopOpacity="0" />
                  <stop offset="50%" stopColor="#D3C7B9" stopOpacity="1" />
                  <stop offset="100%" stopColor="#A89584" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>

          {/* Animated drawing lines - left */}
          <motion.div
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 0.5,
              delay: 0.6,
            }}
            className="absolute left-0 top-0 bottom-0"
          >
            <svg className="w-20 h-full" viewBox="0 0 80 320">
              <motion.path
                d="M 40,20 Q 20,80 40,160 T 40,300"
                stroke="url(#gradient3)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 0.5,
                  delay: 0.6,
                }}
              />
              <defs>
                <linearGradient id="gradient3" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#A89584" stopOpacity="0" />
                  <stop offset="50%" stopColor="#A89584" stopOpacity="1" />
                  <stop offset="100%" stopColor="#D3C7B9" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>

          {/* Animated drawing lines - right */}
          <motion.div
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 0.5,
              delay: 0.9,
            }}
            className="absolute right-0 top-0 bottom-0"
          >
            <svg className="w-20 h-full" viewBox="0 0 80 320">
              <motion.path
                d="M 40,20 Q 60,80 40,160 T 40,300"
                stroke="url(#gradient4)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 0.5,
                  delay: 0.9,
                }}
              />
              <defs>
                <linearGradient id="gradient4" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#D3C7B9" stopOpacity="0" />
                  <stop offset="50%" stopColor="#D3C7B9" stopOpacity="1" />
                  <stop offset="100%" stopColor="#A89584" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>

          {/* Paint brush following the drawing path - top right corner */}
          <motion.div
            className="absolute pointer-events-none"
            animate={{
              x: [60, 280, 280, 60, 60],
              y: [20, 20, 260, 260, 20],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <motion.div
              animate={{
                rotate: [45, 0, -45, -90, -135, -180, 45],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Paintbrush className="w-6 h-6 text-[#A89584]" strokeWidth={2} />
            </motion.div>
            {/* Brush trail effect */}
            <motion.div
              className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-[#A89584]"
              animate={{
                opacity: [0.8, 0, 0.8],
                scale: [1, 0.5, 1],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
              }}
            />
          </motion.div>

          {/* Paint drops/splashes appearing as brush moves */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-[#A89584]/60"
              style={{
                left: `${40 + i * 50}px`,
                top: `${40 + (i % 3) * 80}px`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1, 1, 0],
                opacity: [0, 0.6, 0.6, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.6,
              }}
            />
          ))}
        </div>

        {/* Text content */}
        <div className="space-y-3">
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-semibold bg-gradient-to-r from-[#A89584] to-[#8B7869] bg-clip-text text-transparent"
          >
            {title}
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-[hsl(25,10%,45%)]"
          >
            {subtitle}
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ delay: 0.6, duration: 2, repeat: Infinity }}
            className="text-xs italic text-[hsl(25,10%,55%)]"
          >
            ✨ Bringing your idea to life...
          </motion.p>
        </div>
      </div>
    </div>
  );
}

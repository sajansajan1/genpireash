"use client"

import { motion } from "framer-motion"

type CTASectionProps = {
  setIsAuthModalOpen: (open: boolean) => void
  setIsDemoModalOpen: (open: boolean) => void
}
export function CTASection({ setIsAuthModalOpen, setIsDemoModalOpen }: CTASectionProps) {
  return (
    <section className="px-[16px] md:px-20 border-dashed border-[#DAD3C8] border-b">
      <div className="max-w-[1280px] mx-auto md:px-3 px-0 py-[42px] md:py-[52px] border-dashed border-[#DAD3C8] border-x">
        <div
          className="relative rounded-[10px] overflow-hidden py-[64px] md:py-20 px-2 md:px-2"
          style={{ backgroundColor: "#18181B" }}
        >
          <div className="absolute bottom-0 bg-[url('/images/fs-bg.svg')] w-full max-h-[214px] h-full left-0" />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative flex flex-col items-center gap-8 max-w-[634px] mx-auto z-10"
          >
            {/* Text */}
            <div className="flex flex-col gap-4 text-center">
              <h2 className="font-semibold text-[24px] lg:text-[28px] leading-[1.28] text-white">
                <span className="md:whitespace-nowrap">
                  Create your tech packs in minutes, instead of weeks.
                </span>
                <br />
                Prepare them for manufacturing
              </h2>
              <p className="text-lg leading-[1.48] text-[#98989A]">
                All in one agentic platform.
              </p>
            </div>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto px-2 md:px-0"
            >
              <button
                className="
                  w-full sm:w-auto
                  px-8 py-3
                  text-[15px] font-semibold
                  rounded-[12px]
                  hover:opacity-90 transition-opacity
                "
                style={{ backgroundColor: "#FFFFFF", color: "#000000" }}
                onClick={() => setIsAuthModalOpen(true)}
              >
                Start Creating
              </button>

              <button
                className="
                  w-full sm:w-auto
                  px-8 py-3
                  text-[15px] font-semibold
                  rounded-[12px] border
                  hover:opacity-90 transition-opacity
                "
                style={{
                  backgroundColor: "#18181B",
                  color: "#FFFFFF",
                  borderColor: "#FFFFFF",
                }}
                onClick={() => setIsDemoModalOpen(true)}
              >
                Explore Examples
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

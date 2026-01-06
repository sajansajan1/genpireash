"use client"
import { motion, useScroll, AnimatePresence, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";
import { useRef } from "react";
export function PlansSection() {
  const router = useRouter();
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const animatedColor = useTransform(
    scrollYProgress,
    [0, 0.8],
    ["#626264", "#FFFFFF"]
  );
  return (
    <section className="relative w-full bg-[#18181B] overflow-hidden px-[16px] md:px-20">
      {/* Dotted background */}

      <div className="relative max-w-7xl mx-auto p-0 md:pt-[72px] py-[64px]  md:pb-[80px] border-dashed border-[#514D48] border-x px-[12px] md:pe-[12px] pe-[0]">
        <div className="absolute bottom-0 bg-[url('/images/fs-bg.svg')] w-full max-h-[214px] h-full left-0" />
        <div className="max-w-[848px] flex flex-col gap-4">
          {/* Heading */}
          <h2
            ref={sectionRef}
            className="text-white font-bold text-[28px] lg:text-[44px] leading-[1.28]"
          >
            {/* Desktop text */}
            <span className="hidden md:inline">
              Simple value-oriented plans for{" "}
            </span>

            {/* Mobile text */}
            <span className="md:hidden">
              Simple plans for{" "}
            </span>

            <motion.span style={{ color: animatedColor }}>
              <span className="hidden md:inline">
                creators, makers, designers & brands
              </span>

              <span className="md:hidden">
                creators, teams, and brands
              </span>
            </motion.span>
          </h2>


          {/* Subtext */}
          <p className="text-[#98989A] text-[16px] lg:text-[16px] leading-[1.48]">
            Pick a one-time credit package or go PRO to unlock all AI features
          </p>

          {/* CTA */}
          <div className="mt-4">
            <button
              onClick={() => router.push('/pricing')}
              className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-white text-black text-[15px] font-semibold hover:scale-105 transition-transform md:w-auto w-full"
            >
              Explore our pricing plans
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

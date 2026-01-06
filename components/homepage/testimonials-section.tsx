"use client"

import { motion, useScroll, AnimatePresence, useTransform } from "framer-motion";
import { useRef, useState } from "react";

export function TestimonialsSections({ sansitaSwashed }: any) {
  const [activeIndex, setActiveIndex] = useState(0)
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const animatedColor = useTransform(
    scrollYProgress,
    [0, 0.8],
    ["#AEADAD", "#000000"]
  );
  const testimonials = [
    {
      role: "FOUNDER, DTC APPAREL BRAND",
      quote:
        "Genpire cut our development cycle from 6 weeks to 4 days. It's like having an entire design and production team built into one tool.",
      name: "Alex R.",
      title: "Co-Founder, Stride & Co.",
    },
    {
      role: "HEAD OF PRODUCT, GLOBAL RETAILER",
      quote:
        "We plugged in our brand data and Genpire instantly produced concepts that felt...us. This is not a generator, it's a creative partner.",
      name: "Marie V.",
      title: "Product Director, LUME Retail",
    },
    {
      role: "AGENCY OWNER",
      quote:
        "Genpire lets our agency deliver 10x more concepts with the same team. Our clients think we hired an entire new studio.",
      name: "Jamal K.",
      title: "Founder, Studio Eleven",
    },
    {
      role: "INDEPENDENT CREATOR",
      quote:
        "I built my first collection without needing a designer or factory background. Genpire made me feel like a real brand.",
      name: "Sofia M.",
      title: "Creator",
    },
  ]

  return (
    <section className="relative px-[16px] md:px-20" style={{ backgroundColor: "#EFEBE7" }}>
      <div className="max-w-[1280px] mx-auto pt-[51px] pb-[48px] border-dashed border-[#DAD3C8] border-x">


        <div className="relative">
          <div className="flex flex-col gap-6 md:gap-9 mb-10 md:mb-2">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5" style={{ backgroundColor: "#D2C8BC" }} />
              <span className="text-[14px] leading-[1.48]" style={{ color: "#57534E" }}>
                TESTIMONIALS
              </span>
            </div>

            <div className="pl-3 max-w-[848px]">
              <h2
                ref={sectionRef}
                className="font-bold text-[28px] lg:text-[44px] leading-[1.28] text-black"
              >
                {/* Desktop text */}
                <span className="hidden md:inline">
                  What our community say
                </span>

                {/* Mobile text */}
                <span className="md:hidden">
                  What creators say
                </span>

                <motion.span style={{ color: animatedColor }}>
                  <span className="hidden md:inline">
                    {" "}about creating on{" "}
                  </span>

                  <span className="md:hidden">
                    {" "}about{" "}
                  </span>
                </motion.span>

                <motion.span className={` ${sansitaSwashed.className}`} style={{ color: animatedColor }}>
                  genpire
                </motion.span>
              </h2>

            </div>
          </div>



          <div className=" md:flex gap-3 md:p-3 border-dashed border-[#D4CBBF] border-b border-t">
            {/* Left column */}
            <div className="flex-1 flex flex-col gap-3">
              <div
                className="h-[88px] rounded-t-[10px]"
                style={{
                  background: "linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 100%)",
                  transform: "matrix(1, 0, 0, -1, 0, 0)",
                }}
              />

              <div className="md:p-8 p-6 rounded-[10px] flex flex-col gap-6" style={{ backgroundColor: "#FAF9F8" }}>
                <div className="flex flex-col gap-4">
                  <div className="font-semibold md:text-[16px] text-[14px] leading-normal" style={{ color: "#000000" }}>
                    {testimonials[0].role}
                  </div>
                  <p className="text-[18px] lg:text-[20px] leading-[1.42]" style={{ color: "#57534E" }}>
                    "{testimonials[0].quote}"
                  </p>
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="font-semibold md:text-[16px] text-[14px]" style={{ color: "#000000" }}>
                    {testimonials[0].name}
                  </div>
                  <div className="text-[14px] leading-[1.42]" style={{ color: "#57534E" }}>
                    {testimonials[0].title}
                  </div>
                </div>
              </div>

              <div className="md:p-8 p-6 rounded-[10px] flex flex-col gap-6" style={{ backgroundColor: "#FAF9F8" }}>
                <div className="flex flex-col gap-4">
                  <div className="font-semibold md:text-[16px] text-[14px] leading-normal" style={{ color: "#000000" }}>
                    {testimonials[2].role}
                  </div>
                  <p className="text-[18px] lg:text-[20px] leading-[1.42]" style={{ color: "#57534E" }}>
                    "{testimonials[2].quote}"
                  </p>
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="font-semibold md:text-[16px] text-[14px]" style={{ color: "#000000" }}>
                    {testimonials[2].name}
                  </div>
                  <div className="text-[14px] lg:text-[14px] leading-[1.42]" style={{ color: "#57534E" }}>
                    {testimonials[2].title}
                  </div>
                </div>
              </div>

              <div
                className="h-[88px] rounded-t-[10px] md:block hidden"
                style={{
                  background: "linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 100%)",
                }}
              />
            </div>

            {/* Right column with offset */}
            <div className="flex-1 flex flex-col gap-3 pt-6">
              <div
                className="h-[88px] rounded-t-[10px] md:block hidden"
                style={{
                  background: "linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 100%)",
                  transform: "matrix(1, 0, 0, -1, 0, 0)",
                }}
              />

              <div className="md:p-8 p-6 rounded-[10px] flex flex-col gap-6" style={{ backgroundColor: "#FAF9F8" }}>
                <div className="flex flex-col gap-4">
                  <div className="font-semibold md:text-base text-[14px] leading-normal" style={{ color: "#000000" }}>
                    {testimonials[1].role}
                  </div>
                  <p className="md:text-xl text-[18px] leading-[1.42]" style={{ color: "#57534E" }}>
                    "{testimonials[1].quote}"
                  </p>
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="font-semibold md:text-base text-[14px]" style={{ color: "#000000" }}>
                    {testimonials[1].name}
                  </div>
                  <div className="text-sm" style={{ color: "#57534E" }}>
                    {testimonials[1].title}
                  </div>
                </div>
              </div>

              <div className="md:p-8 p-6 rounded-[10px] flex flex-col gap-6" style={{ backgroundColor: "#FAF9F8" }}>
                <div className="flex flex-col gap-4">
                  <div className="font-semibold md:text-base text-[14px] leading-normal" style={{ color: "#000000" }}>
                    {testimonials[3].role}
                  </div>
                  <p className="md:text-xl text-[18px] leading-[1.42]" style={{ color: "#57534E" }}>
                    "{testimonials[3].quote}"
                  </p>
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="font-semibold md:text-base text-[14px]" style={{ color: "#000000" }}>
                    {testimonials[3].name}
                  </div>
                  <div className="text-sm" style={{ color: "#57534E" }}>
                    {testimonials[3].title}
                  </div>
                </div>
              </div>

              <div
                className="h-[88px] rounded-t-[10px]"
                style={{
                  background: "linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 100%)",
                }}
              />
            </div>
          </div>


        </div>
      </div>
    </section>
  )
}

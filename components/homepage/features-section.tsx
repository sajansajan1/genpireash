"use client"

import { Sparkles, Eye, Target, Users, ImageIcon, Palette } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const features = [
  {
    icon: Sparkles,
    text: "Design products and collections with prompts",
  },
  {
    icon: Eye,
    text: "Generate multi-view visuals and tech-packs in minutes",
  },
  {
    icon: Target,
    text: "Auto-capture BOM, measurements, and specs",
  },
  {
    icon: Users,
    text: "Seamlessly collaborate with any manufacturer",
  },
  {
    icon: ImageIcon,
    text: "Generate creative assets for marketing and sales",
  },
  {
    icon: Palette,
    text: "Integrate your brand assets for on-brand creations",
  },
]

export function FeaturesSection() {
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
  return (
    <section className="px-[15px] md:px-[15px] lg:px-20  border border-y border-dashed border-[#DAD3C8] pt-0 pb-0" style={{ backgroundColor: "#F7F5F3" }}>
      <div className="max-w-[1280px] mx-auto pb-[44px] md:pb-[44px]  lg:pb-[29px] border-dashed border-[#DAD3C8] border-s border-e">
        <div className="flex flex-col gap-8 md:gap-10 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col max-w-[1000px]"
          >
            <div className="flex items-center gap-2 mt-[48px] md:mt-[48px] ">
              <div className="w-1 h-5" style={{ backgroundColor: "#D2C8BC" }} />
              <span className="text-[14px] font-medium uppercase tracking-wide leading-[1.48]" style={{ color: "#57534E" }}>
                WHAT GENPIRE DOES
              </span>
            </div>
            <h2
              ref={sectionRef}
              className="pt-[28px] md:pt-[28px] lg:mt-[16px] ps-[12px] font-bold text-[32px] md:text-[38px] lg:text-[44px] leading-[1.2]"
            >
              <span className="text-black hidden md:inline">
                Go agentic all the way from{" "}
              </span>

              <span className="text-black md:hidden">
                Your entire design-to
              </span>

              <motion.span style={{ color: animatedColor }}>
                <span className="hidden md:inline">
                  design to manufacturing
                </span>
                <span className="md:hidden">
                  -manufacturing workflow, unified
                </span>
              </motion.span>
            </h2>
            <p className="pt-[16px] md max-w-xl ps-[12px] text-[16px] lg:text-[18px] text-[#57534E] leading-[1.48]" style={{ color: "#57534E" }}>
              Genpire replaces traditional and skills-based design tools, manual specification processes and fragmented
              production prep with a seamless agentic workflow
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-12 w-full items-center border-t border-b border-dashed border-[#D2C8BC66] ">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center col-span-12 lg:col-span-7 px-4 sm:px-6 lg:px-[56px] py-6 sm:py-10 lg:py-[70px]">
              <div
                className="w-full max-w-[342px] sm:max-w-[420px] md:max-w-[520px] lg:max-w-full rounded-3xl p-1"
                style={{
                  boxShadow: "0px 0px 0px 8px #D2C8BC66",
                }}
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl">
                  <video
                    src="https://auth.genpire.com/storage/v1/object/public/genpire-uploads/Video%20for%20new%20homepage%20(1).mp4"
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                </div>
              </div>
            </motion.div>
            <div className="col-span-12 lg:col-span-5 ">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    className="flex items-start gap-[12px] border border-dashed p-[24px] md:p-[32px]"
                  >
                    <div className="mt-0.5 flex-shrink-0 ">
                      <Icon className="w-5" style={{ color: "#18181B" }} strokeWidth={1.5} />
                    </div>
                    <span
                      className="text-[16px] md:text-base lg:text-[18px] leading-normal"
                      style={{ color: "#18181B" }}
                    >
                      {feature.text}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section >
  )
}

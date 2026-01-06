"use client"

import { Zap, Eye, Palette, Users, ThumbsUp, Handshake } from "lucide-react"
import { motion, useScroll, AnimatePresence, useTransform } from "framer-motion";
import { useRef } from "react";

export function TeamChooseSection({ sansitaSwashed }: any) {

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
    <section className="p-5 px-4 md:px-10 lg:px-20 py-0" style={{ backgroundColor: "#F7F5F3" }}>
      <div className="max-w-[1280px] mx-auto border-dashed border-[#DAD3C8] border-s border-e">
        <div className="flex flex-col gap-10 items-start md:pb-0 pb-[48px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col max-w-[848px]"
          >
            <div className="flex items-center mt-[43px] md:mt-[56px]">
              <div className="w-1 h-5" style={{ backgroundColor: "#D2C8BC" }} />
              <span className="text-[14px] text-[#57534E] ms-[12px] leading-[1.48]">
                TEAMS CHOOSE
              </span>
            </div>
            <h2
              ref={sectionRef}
              className="font-bold text-[28px] lg:text-[44px] leading-[1.28] max-w-[748px] mt-[26px] md:mt-[36px] ms-3 text-black"
            >
              {/* Desktop text */}
              <span className="hidden md:inline">
                Why individuals & teams alike{" "}
              </span>

              {/* Mobile text */}
              <span className="md:hidden">
                Why teams{" "}
              </span>

              <motion.span style={{ color: animatedColor }}>
                choose <span
                  className={` ${sansitaSwashed.className}`}
                // style={{ fontFamily: "Sansita Swashed", fontWeight: 700 }}
                >
                  genpire
                </span>
              </motion.span>
            </h2>

          </motion.div>

          <div className="w-full relative">
            {/* Top border */}
            <div className="absolute top-0 left-0 right-0 h-px" style={{ borderTop: "1px dashed #DAD3C8" }} />

            <div className="grid grid-cols-12 lg:grid-cols-12 gap-0">
              {/* Left column - Benefits list */}
              <div className="flex flex-col col-span-12 md:col-span-5">
                {[
                  { icon: Zap, text: "10X faster design-to-production workflow" },
                  { icon: Eye, text: "Visual + technical creation in one place" },
                  { icon: Palette, text: "Consistent styling across full collections" },
                  { icon: Users, text: "Less reliance on freelancers or technical designers" },
                  { icon: ThumbsUp, text: "Higher first-sample success" },
                  { icon: Handshake, text: "Smooth collaboration with manufacturers" },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start gap-3 px-6  md:px-8 py-6 md:py-8"
                    style={{
                      borderRight: "1px dashed #DAD3C8",
                      borderBottom: "1px dashed #DAD3C8",
                    }}
                  >
                    <item.icon className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" style={{ color: "#000000" }} />
                    <span className="lg:text-[18px] text-[16px] text-[#57534E] leading-normal" >
                      {item.text}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Right column - Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="relative flex items-center justify-center p-0 border-dashed border-[#DAD3C8] border-b md:border-0 md:p-14 col-span-12 md:col-span-7"
              >
                <div
                  className="w-full h-full rounded-[20px] overflow-hidden"
                >
                  <img
                    src="/images/content-2.png"
                    alt="Team collaborating on product designs"
                    className="w-full h-full object-contain"
                  />
                </div>
              </motion.div>
            </div>

            {/* Bottom border - only show on desktop */}
            <div
              className="hidden lg:block absolute bottom-0 left-[524px] right-0 h-px"
              style={{ borderBottom: "1px dashed #DAD3C8" }}
            />
          </div>

        </div>
      </div>
    </section>
  )
}

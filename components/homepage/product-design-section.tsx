"use client"

// Import Framer Motion and Next.js Image
import { useState } from "react"
import { motion, useScroll, AnimatePresence, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

export function ProductDesignSection() {
  const [activeTab, setActiveTab] = useState<"Create" | "Edit" | "Specify" | "Produce">("Create")

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

  const tabContent = {
    Create: {
      title: "From idea to multi-view product concept",
      image: "/images/img-1.png",
      steps: [
        "Prompt-based product creation",
        "Upload a sketch or reference",
        "Multi-view product generation",
        "Style guided by your Brand DNA",
        "Instant variations & quick ideation",
      ],
      tagline: "Your idea becomes a real product — instantly",
    },
    Edit: {
      title: "Refine, modify, and craft every detail",
      image: "/jj2.png",
      steps: [
        "Edit every angle of your product",
        "Adjust shapes, components, silhouettes",
        "Modify materials, trims, stitching, finishes",
        "Create variations & improvements with ease",
      ],
      tagline: "Shape your product into its final form",
    },
    Specify: {
      title: "Turn creativity into technical clarity",
      image: "/jj3.png",
      steps: [
        "Auto annotations and measurements",
        "Material & trim definitions",
        "Construction details",
        "Early BOM suggestions",
        "Consistency across all views",
        "Brand DNA alignment",
      ],
      tagline: "Add the technical depth your manufacturer needs",
    },
    Produce: {
      title: "Factory-ready documentation in minutes",
      image: "/jj4.png",
      steps: [
        "Complete tech pack generation",
        "Multi-view technical drawings",
        "Measurements and construction notes",
        "Materials, trims, BOM",
        "Export-ready PDF",
        "Manufacturing review",
      ],
      tagline: "Your product — ready to move into sampling",
    },
  }

  const currentContent = tabContent[activeTab]

  return (
    <section className="px-5 md:px-[16px] lg:px-20 py-0" style={{ backgroundColor: "#EFEBE7" }}>
      <div className="max-w-[1280px] mx-auto border border-y border-dashed border-[#DAD3C8]">
        <div className="flex flex-col items-start py-[48px] md:py-[48px] lg:pt-[46px] lg:pb-[53px]">
          {/* Animation added to heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:gap-[36px] gap-[28px] mb-[40px]"
          >
            <div className="flex items-center gap-2">
              <div className="w-1 h-5" style={{ backgroundColor: "#D2C8BC" }} />
              <span className="text-[14px] text-[#57534E] leading-[1.48]">
                REINVENTING THE JOURNEY TO THE FACTORY-FLOOR ONE PRODUCT AT A TIME
              </span>
            </div>
            <h2
              ref={sectionRef}
              className="text-[28px] lg:text-[44px] font-bold leading-[1.28] ps-[12px]"
            >
              {/* Desktop text */}
              <span className="hidden md:inline">
                Design products{" "}
              </span>

              {/* Mobile text */}
              <span className="md:hidden">
                The four pillars{" "}
              </span>

              <motion.span
                className="text-[#AEADAD]"
                style={{ color: animatedColor }}
              >
                <span className="hidden md:inline">
                  in the speed of AI
                </span>

                <span className="md:hidden">
                  of the product journey
                </span>
              </motion.span>
            </h2>

          </motion.div>

          {/* Animation added to tabs */}
          <div className="w-full flex border-y border-dashed border-[#DAD3C8] justify-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 max-w-[848px] w-full"
            >
              {(["Create", "Edit", "Specify", "Produce"] as const).map((tab) => (
                <div
                  key={tab}
                  className="p-[8px] border-[#DAD3C8] border-b md:border-b border-dashed border-s border-e w-full md:w-full lg:w-auto"
                >
                  <button
                    onClick={() => setActiveTab(tab)}
                    className="w-full px-6 py-3 rounded-0 font-medium text-sm"
                    style={{
                      backgroundColor: activeTab === tab ? "#FFFFFF" : "transparent",
                      border: activeTab === tab ? "1px solid #E7E5E4" : "none",
                      color: activeTab === tab ? "#000000" : "#78716C",
                    }}
                  >
                    {tab}
                  </button>
                </div>
              ))}
            </motion.div>
          </div>
          {/* Animation added to main card */}
          <div className="md:px-[44px] border-dashed border-[#DAD3C8] border-b">
            <div className="border-dashed border-[#DAD3C8] md:border-s md:border-e p-[12px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.5 }}
                  className="rounded-2xl md:py-[40px] px-[24px] py-[24px]  w-full flex flex-col "
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px dashed #DAD3C8",
                    backgroundImage: "url(/images/fs-bg.svg)",
                  }}
                >
                  <h3
                    className="text-center text-[24px] lg:text-[28px] font-semibold leading-[1.28] md:mb-0 mb-[20px]"
                    style={{ color: "#000000" }}
                  >
                    {currentContent.title}
                  </h3>

                  <div className="max-w-[848px] mx-auto max-h-[495px] mb-[24px] relative">
                    <Image
                      src={currentContent.image || "/placeholder.svg"}
                      alt="Product design interface"
                      width={848}
                      height={495}
                      className="w-full object-contain rounded-lg"
                      priority={activeTab === "Create"}
                      loading={activeTab === "Create" ? "eager" : "lazy"}
                    />
                  </div>

                  {/* Process steps */}
                  <div
                    className="grid grid-cols-1 md:grid-cols-3 text-[#57534E] text-[15px] rounded-[10px] overflow-hidden lg:flex lg:flex-wrap"
                  >
                    {currentContent.steps.map((text, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex flex-col items-start gap-[12px] py-[20px] border-y md:border-x border-dashed border-[#DAD3C8] bg-[#F3F0ED] px-[20px] lg:flex-1"
                      >
                        <Image
                          src={`/images/card-${(index % 5) + 1}.png`}
                          alt={`Feature ${index + 1}`}
                          width={18}
                          height={18}
                          className="w-[18px] h-[18px] object-contain"
                          loading="lazy"
                        />
                        <p className="leading-normal text-[#57534E]">{text}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Tagline */}
                  <p
                    className="text-center text-[16px] md:text-base font-medium pt-[20px] lg:text-[20px]"
                    style={{ color: "#000000" }}
                  >
                    {currentContent.tagline}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

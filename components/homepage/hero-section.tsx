"use client"

import { Sparkles, Plus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

type HeroSectionProps = {
  setIsAuthModalOpen: (open: boolean) => void
  setIsDemoModalOpen: (open: boolean) => void
  userPrompt: string;
  setUserPrompt: (prompt: string) => void;
  displayedText: string;
}
const rotatingTexts = [
  "Summer 2026 Resort-wear Collection with AI",
  "New Sneakers Concept with AI",
  "Evening Gala Jewellery line with AI",
  "Boho Home Goods collection with AI",
  "next Outdoor Gear with AI",
  "Montessori Toys & Games line with AI",
  "Next Consumer Gadget with AI",
]

export function HeroSection({ setIsAuthModalOpen, setIsDemoModalOpen, userPrompt, setUserPrompt, displayedText }: HeroSectionProps) {
  const TOTAL_STEPS = 5
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % TOTAL_STEPS)
    }, 4000)

    return () => clearInterval(timer)
  }, [])

  return (
    <section className="px-4 md:px-4 lg:px-[80px] py-12 pt-0 pb-0">
      <div className="relative max-w-[1280px] mx-auto pt-[40px] lg:pt-[120px] border-dashed border-[#DAD3C8] border-s border-e">
        <div className="flex flex-col items-center text-center mx-auto w-full lg:w-[1038px]">
          <div className="flex flex-col">
            <h1
              className="font-bold lg:font-normal text-[32px] md:text-[40px] lg:text-[48px] leading-[1.28] break-words whitespace-normal"
              style={{ color: "#000000" }}
            >
              Create Factory-Ready
              <br />
              <span
                className="font-bold"
              >
                Tech Packs & Products with AI
              </span>
            </h1>
            <p
              className="text-[16px] lg:text-[18px] font-normal leading-[1.48] mx-auto max-w-[632px] px-[25px] pt-[20px]"
              style={{ color: "#57534E" }}
            >
              Genpire is the first agentic platform that brings design, tech packs, and manufacturing into a single
              workflow, so makers, brands, and enterprise teams can go from concept to factory-floor 10x faster.
            </p>
          </div>

          <div className="hidden md:flex flex-col items-center mt-[32px] lg:mt-[40px] w-full md:w-[440px] px-4">
            <div className="flex flex-col sm:flex-row gap-[12px] w-full">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full sm:w-auto px-[32px] py-[12px] text-[15px] font-semibold leading-5 rounded-xl whitespace-nowrap transition-transform hover:scale-105 cursor-pointer"
                style={{
                  backgroundColor: "#18181B",
                  color: "#FFFFFF",
                }}
              >
                Start Creating
              </button>

              <button
                className="w-full sm:w-auto px-[32px] py-[12px] text-[15px] font-semibold leading-5 rounded-xl transition-transform hover:scale-105 cursor-pointer whitespace-nowrap"
                onClick={() => setIsDemoModalOpen(true)}
                style={{
                  backgroundColor: "#F7F5F3",
                  border: "1px solid #D1D5DB",
                  color: "#1C1917",
                }}
              >
                Watch a 60-seconds Demo
              </button>
            </div>
          </div>
        </div>
        <div
          className="w-full md:pb-[25px]"
          style={{
            backgroundImage: "url('/images/fs-bg.svg')",
          }}
        >
          <p
            className="text-[14px] font-normal leading-5 px-4 md:w-[500px] mx-auto text-center mt-[32px] mb-[50px]"
            style={{ color: "#57534E" }}
          >
            Loved by Creators, Brands, Studios, and Product teams worldwide
          </p>
          <div
            className="w-full max-w-[680px] rounded-xl border p-4 md:p-6 relative overflow-hidden mx-auto"
            style={{
              borderColor: "#E3E1E0",
              backgroundColor: "#F5F5F5",
              boxShadow: "0px 14px 48px 0px #72675A29",
            }}
          >
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="input"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col h-[284px]"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#BEBBB8" }} />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#D1C6BB" }} />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#AC9D8F" }} />
                    </div>
                    <span className="text-[14px] font-medium ml-[4px] leading-5" style={{ color: "#44403C" }}>
                      Describe Your Product
                    </span>
                  </div>

                  <div className="relative flex-1">
                    <textarea
                      className="w-full h-full text-[15px] p-[14px] rounded-lg border text-base resize-none"
                      style={{
                        borderColor: "#D0CDCB",
                        backgroundColor: "#FFFFFF",
                        color: "#606775",
                      }}
                      value={userPrompt}
                      onChange={(e) => setUserPrompt(e.target.value)}
                      placeholder={userPrompt ? "" : displayedText}
                    />
                    <button
                      className="absolute left-3 bottom-5 w-8 h-8 flex items-center justify-center rounded-full border"
                      style={{
                        borderColor: "#F0F0EF",
                        backgroundColor: "#F0F0EF",
                      }}
                    >
                      <Plus className="w-4 h-4" style={{ color: "#57534E" }} />
                    </button>
                    <button
                      className="absolute right-3 bottom-5 flex items-center gap-2 ps-4 pe-0 py-2 text-sm font-medium rounded-lg"
                      style={{
                        backgroundColor: "transparent",
                        color: "#232325",
                        border: "unset",
                      }}
                    >
                      <Sparkles className="w-4 h-4" />
                      Improve with AI
                    </button>
                  </div>

                  <p className="text-xs mt-3 leading-4" style={{ color: "#817B74" }}>
                    Create from prompts or upload your own designs, sketches, and reference images (PNG, JPG, JPEG, PDF)
                  </p>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="analyzing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center justify-center h-[284px]"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#BEBBB8" }} />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#D1C6BB" }} />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#AC9D8F" }} />
                    </div>
                    <span className="text-sm font-medium ml-2" style={{ color: "#000000" }}>
                      Your Product Creation
                    </span>
                  </div>

                  <div className="text-6xl font-bold">
                    <img src="/G.svg" alt="" className="md:w-[64px] md:h-[64px] w-[48px] h-[48px]" />
                  </div>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl font-medium mt-4"
                    style={{ color: "#000000" }}
                  >
                    Analyzing your idea...
                  </motion.p>

                  <div className="w-full max-w-[284px] mt-6">
                    <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: "#E5E5E5" }}>
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3.5, ease: "easeInOut" }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: "#000000" }}
                      />
                    </div>
                  </div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-sm text-center mt-3"
                    style={{ color: "#817B74" }}
                  >
                    Our AI is crafting something special. Please wait a few minutes.
                  </motion.p>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="views"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col h-[284px]"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#BEBBB8]" />
                      <div className="w-3 h-3 rounded-full bg-[#D1C6BB]" />
                      <div className="w-3 h-3 rounded-full bg-[#AC9D8F]" />
                    </div>
                    <span className="text-sm font-medium ml-2 text-black">
                      Your Product Views
                    </span>
                  </div>

                  <motion.h3
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-xl font-semibold text-center text-black"
                  >
                    Eco-friendly ergonomic backpack
                  </motion.h3>

                  {/* MOBILE: 2 images */}
                  <div className="grid grid-cols-2 gap-4 mt-4 flex-1 md:hidden">
                    {["/dd1.png", "/dd2.png"].map((img, index) => (
                      <motion.div
                        key={img}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.15, duration: 0.4 }}
                        className="rounded-lg border bg-[#FAFAFA] overflow-hidden"
                      >
                        <img
                          src={img}
                          alt={`Mobile view ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* DESKTOP: 4 images */}
                  <div className="hidden md:grid grid-cols-4 gap-4 mt-4 flex-1">
                    {["/dd1.png", "/dd2.png", "/dd3.png", "/dd4.png"].map((img, index) => (
                      <motion.div
                        key={img}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.15, duration: 0.4 }}
                        className="rounded-lg border bg-[#FAFAFA] overflow-hidden h-full"
                      >
                        <img
                          src={img}
                          alt="backpack image"
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="components"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col h-[284px]"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#BEBBB8" }} />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#D1C6BB" }} />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#AC9D8F" }} />
                    </div>
                    <span className="text-sm font-medium ml-2" style={{ color: "#000000" }}>
                      Factory Specs
                    </span>
                  </div>

                  <motion.h3
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-lg font-semibold text-center"
                    style={{ color: "#000000" }}
                  >
                    Component Images
                  </motion.h3>

                  {/* MOBILE: 2 images */}
                  <div className="grid grid-cols-2 gap-4 mt-4 flex-1 md:hidden">
                    {["/kj1.jpg", "/kj3.jpg"].map((img, index) => (
                      <motion.div
                        key={img}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.15, duration: 0.4 }}
                        className="rounded-lg border bg-[#FAFAFA] overflow-hidden h-full"
                      >
                        <img
                          src={img}
                          alt={`Mobile view ${index + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* DESKTOP: 3 images */}
                  <div className="hidden md:grid grid-cols-3 gap-4 mt-4 flex-1">
                    {["/kj1.jpg", "/kj2.jpg", "/kj3.jpg"].map((img, index) => (
                      <motion.div
                        key={img}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.15, duration: 0.4 }}
                        className="rounded-lg border bg-[#FAFAFA] h-[200px] "
                      >
                        <img
                          src={img}
                          alt="component image"
                          className="h-full w-full object-fill"
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="technical"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col h-[284px]"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#BEBBB8" }} />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#D1C6BB" }} />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#AC9D8F" }} />
                    </div>
                    <span className="text-sm font-medium ml-2" style={{ color: "#000000" }}>
                      Factory Specs
                    </span>
                  </div>

                  <motion.h3
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-xl font-semibold text-center"
                    style={{ color: "#000000" }}
                  >
                    Technical Sketches
                  </motion.h3>

                  {/* MOBILE: 2 images */}
                  <div className="grid grid-cols-2 gap-4 mt-4 flex-1 md:hidden">
                    {["/bv1.jpg", "/bv3.jpg"].map((img, index) => (
                      <motion.div
                        key={img}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.15, duration: 0.4 }}
                        className="rounded-lg border bg-[#FAFAFA] overflow-hidden h-full"
                      >
                        <img
                          src={img}
                          alt={`Mobile view ${index + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* DESKTOP: 3 images */}
                  <div className="hidden md:grid grid-cols-3 gap-4 mt-4 flex-1">
                    {["/bv1.jpg", "/bv2.jpg", "/bv3.jpg"].map((img, index) => (
                      <motion.div
                        key={img}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.15, duration: 0.4 }}
                        className="rounded-lg border bg-[#FAFAFA] h-[200px] "
                      >
                        <img
                          src={img}
                          alt="technical sketch"
                          className="h-full w-full object-fill"
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          <div className="md:hidden flex flex-col items-center mt-8 w-full px-4 pb-4">
            <div className="flex flex-col gap-[12px] w-full max-w-[284px]">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full px-[32px] py-[12px] text-[15px] font-semibold leading-5 rounded-xl whitespace-nowrap transition-transform hover:scale-105 cursor-pointer"
                style={{
                  backgroundColor: "#18181B",
                  color: "#FFFFFF",
                }}
              >
                Start Creating
              </button>

              <button
                className="w-full px-[32px] py-[12px] text-[15px] font-semibold leading-5 rounded-xl transition-transform hover:scale-105 cursor-pointer whitespace-nowrap"
                onClick={() => setIsDemoModalOpen(true)}
                style={{
                  backgroundColor: "#F7F5F3",
                  border: "1px solid #D1D5DB",
                  color: "#1C1917",
                }}
              >
                Watch a 60-seconds Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

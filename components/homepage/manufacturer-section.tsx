"use client"

import { Sparkles } from "lucide-react"
import { motion, useScroll, AnimatePresence, useTransform } from "framer-motion";
import { useRef } from "react";
type ManufacturerSectionProps = {
  userPrompt: string;
  setUserPrompt: (prompt: string) => void;
  displayedText: string;
  setIsAuthModalOpen: (open: boolean) => void;
}
export function ManufacturerSection({ userPrompt, setUserPrompt, displayedText, setIsAuthModalOpen }: ManufacturerSectionProps) {

  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const animatedColor = useTransform(
    scrollYProgress,
    [0, 0.8],
    ["#626264", "#FFFFFF"]  // change black to white
  );

  return (
    <section className="relative overflow-hidden px-4 md:px-4 lg:px-20 py-0  ">
      <div className="absolute inset-0" style={{ backgroundColor: "#18181B" }}>

      </div>

      <div className="relative max-w-[1280px] mx-auto border-dashed border-[#514D48] border-s border-e">
        <div className="flex flex-col gap-10 md:gap-10" style={{ isolation: "isolate" }}>
          {/* Heading wrapper */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col  max-w-[966px]"
          >
            {/* Eyebrow label */}
            <div className="flex items-center gap-2 mt-[44px] md:mt-[44px] lg:mt-[56px]">
              <div className="w-1 h-4 md:h-5 " style={{ backgroundColor: "#6C6760" }} />
              <p className="text-[14px] leading-[1.48] uppercase tracking-widest text-[#B2AEA9]">
                Factory-ready files in minutes
              </p>
            </div>

            {/* Heading and description */}

            <h2
              ref={sectionRef}
              className="text-[28px] md:text-[44px] font-bold leading-[1.28] mt-[28px] md:mt-[44px] lg:mt-[36px] ms-[12px]"
            >
              {/* Desktop first line */}
              <span className="text-white hidden md:inline">
                Everything a{" "}
              </span>

              {/* Mobile first line */}
              <span className="text-white md:hidden">
                Everything your{" "}
              </span>

              <motion.span
                className="text-[#626264]"
                style={{ color: animatedColor }}
              >
                manufacturer{" "}
              </motion.span>

              {/* Desktop second line */}
              <motion.span
                className="text-[#626264] hidden md:block"
                style={{ color: animatedColor }}
              >
                needs to get to work — instantly generated
              </motion.span>

              {/* Mobile second line */}
              <motion.span
                className="text-[#626264] md:hidden block"
                style={{ color: animatedColor }}
              >
                needs — instantly generated
              </motion.span>
            </h2>


            <p className="text-[#98989A] lg:text-[18px] text-[16px] mt-[16px] ms-[12px]">
              Every product can be turned into a full “Gen-Pack”
            </p>
          </motion.div>

          {/* Main container */}
          <div className="flex flex-col items-center w-full">
            {/* Cards wrapper - 6 manufacturing document types */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex flex-col gap-1 w-full border-y border-[#514D48] border-dashed"
            >
              {/* Top row */}
              <div className=" flex-col md:flex-row gap-[4px] w-full grid md:grid-cols-12">
                <div
                  className="flex justify-center items-center py-5 md:py-7 px-2  col-span-12 md:col-span-4 lg:col-span-5"
                  style={{ backgroundColor: "#2F2F32" }}
                >
                  <span className="text-[18px] leading-normal font-medium text-center" style={{ color: "#FFFFFF" }}>
                    Multi-view technical drawings
                  </span>
                </div>

                <div
                  className="flex justify-center items-center py-5 md:py-7 px-2 w-full col-span-12 md:col-span-4 lg:col-span-4"
                  style={{ backgroundColor: "#2F2F32" }}
                >
                  <span className="text-[18px] leading-normal font-medium text-center" style={{ color: "#FFFFFF" }}>
                    Construction notes
                  </span>
                </div>

                <div
                  className="flex justify-center items-center py-5 md:py-7 px-2  col-span-12 md:col-span-4 lg:col-span-3"
                  style={{ backgroundColor: "#2F2F32" }}
                >
                  <span className="text-[18px] leading-normal font-medium text-center" style={{ color: "#FFFFFF" }}>
                    Measurement charts
                  </span>
                </div>

              </div>

              {/* Bottom row */}
              <div className="flex flex-col md:flex-row gap-[4px] w-full">
                <div
                  className="flex justify-center items-center py-5 md:py-7 px-2 flex-1"
                  style={{ backgroundColor: "#2F2F32" }}
                >
                  <span className="text-[18px] leading-normal font-medium text-center" style={{ color: "#FFFFFF" }}>
                    Materials & trims
                  </span>
                </div>
                <div
                  className="flex justify-center items-center py-5 md:py-7 px-2 w-full md:w-[432px]"
                  style={{ backgroundColor: "#2F2F32" }}
                >
                  <span className="text-[18px] leading-normal font-medium text-center" style={{ color: "#FFFFFF" }}>
                    Bill of Materials (BOM)
                  </span>
                </div>
                <div
                  className="flex justify-center items-center py-6 md:py-7 px-2 flex-1"
                  style={{ backgroundColor: "#2F2F32" }}
                >
                  <span className="text-[18px] leading-normal font-medium text-center" style={{ color: "#FFFFFF" }}>
                    Packaging and Go-to Plans
                  </span>
                </div>
              </div>
            </motion.div>

            {/* CTA section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex flex-col items-center gap-6 md:gap-7 w-full md:w-[664px]"
            >
              <h3
                className="lg:text-[28px] text-[24px] font-semibold leading-[1.28] text-center md:mt-[88px] mt-[56px] lg:block hidden"
                style={{ color: "#FFFFFF" }}
              >
                Say goodbye to PLM's, PDF's and Excel Sheets
              </h3>

              <h3
                className="lg:text-[28px] text-[24px] font-semibold leading-[1.28] text-center md:mt-[88px] mt-[56px] lg:hidden"
                style={{ color: "#FFFFFF" }}
              >
                Create your first factory ready product
              </h3>

            </motion.div>
            <div
              className="
    w-full
    bg-[url('/images/fs-bg.svg')]
    bg-cover bg-center 
  "
            >
              <div className="flex flex-col items-center max-w-[664px] w-full mx-auto mt-[28px]">
                {/* Chat interface mockup */}
                <div
                  className="relative flex flex-col gap-3 md:gap-4 p-5 md:p-6 w-full"
                  style={{
                    backgroundColor: "#F5F5F5",
                    border: "1px solid #E3E1E0",
                    borderRadius: "20px",
                    boxShadow: "0px 12px 28px rgba(114, 103, 90, 0.04), 0px 14px 48px rgba(114, 103, 90, 0.16)",
                    isolation: "isolate",
                  }}
                >
                  {/* macOS-style dots and title */}
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-full" style={{ backgroundColor: "#BEBBB8" }} />
                      <div className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-full" style={{ backgroundColor: "#D1C6BB" }} />
                      <div className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-full" style={{ backgroundColor: "#AC9D8F" }} />
                    </div>
                    <span className="text-xs md:text-sm font-medium leading-5" style={{ color: "#44403C" }}>
                      Let AI describe and guide you through RFQs
                    </span>
                  </div>

                  {/* Input and bottom section */}
                  <div className="flex flex-col gap-2 md:gap-3">
                    <div
                      className="flex justify-between items-center md:pe-2.5 px-4 md:px-4 py-2.5 md:py-2.5 gap-2"
                      style={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #D0CDCB",
                        borderRadius: "12px",
                      }}
                    >
                      <input
                        type="text"
                        value={userPrompt}
                        onChange={(e) => setUserPrompt(e.target.value)}
                        className="flex-1 rounded-lg border-none bg-white/70 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300/30 text-gray-700"
                        placeholder={displayedText}
                      />

                      <button
                        className="md:max-w-[148px] md:w-full w-[28px] h-[28px] flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 text-xs font-medium rounded-[10px] whitespace-nowrap leading-4"
                        style={{ backgroundColor: "#F0F0EF", color: "#57534E" }}
                      >
                        <Sparkles className="w-3 md:w-4 h-3 md:h-4" />
                        <span className="hidden md:block max-w-[103px] text-center w-full">Ask now</span>
                      </button>
                    </div>


                    <p className="text-[11px] md:text-xs " style={{ color: "#78716C" }}>
                      Instead of never ending back and forth - simply "chat" with any product sent to you through
                      Genpire
                    </p>
                  </div>

                  {/* AI-powered RFQ badge */}
                  <div
                    className="absolute hidden md:block right-4 md:right-8 top-2 justify-center items-center px-2 md:px-3 py-1.5 md:py-2 rounded-[10px]"
                    style={{
                      backgroundColor: "#E8E3DD",
                      boxShadow: "0px 0px 4px rgba(122, 104, 82, 0.2), 0px 0px 0px 4px #D2C8BC",
                    }}
                  >
                    <span className="text-xs md:text-sm font-medium whitespace-nowrap" style={{ color: "#000000" }}>
                      AI-powered RFQ
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  className="hidden md:flex justify-center items-center md:w-auto w-1/2 px-6 md:px-8 py-2.5 md:py-3 md:mt-[32px] mt-[25px] md:mb-[56px] mb-[45px] rounded-[12px] font-semibold text-sm md:text-[15px] hover:opacity-90 transition-opacity"
                  onClick={() => setIsAuthModalOpen(true)}
                  style={{ backgroundColor: "#FFFFFF", color: "#000000" }}
                >
                  Get More RFQs Today
                </button>

                <button
                  className="md:hidden flex justify-center items-center md:w-auto w-1/2 px-6 md:px-8 py-2.5 md:py-3 md:mt-[32px] mt-[25px] md:mb-[56px] mb-[45px] rounded-[12px] font-semibold text-sm md:text-[15px] hover:opacity-90 transition-opacity "
                  onClick={() => setIsAuthModalOpen(true)}
                  style={{ backgroundColor: "#FFFFFF", color: "#000000" }}
                >
                  Get More RFQs
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

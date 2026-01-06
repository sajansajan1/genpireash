"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { motion, useScroll, AnimatePresence, useTransform } from "framer-motion";
import { useRef } from "react";
const faqs = [
  {
    question: "What is Genpire?",
    answer:
      "Genpire is an AI-native platform that takes you from a product idea to a factory-ready product in one continuous workflow. Instead of juggling designers, files, revisions, and manufacturers, Genpire unifies design, development, and production into a single collaborative product interface.",
  },
  {
    question: "How does Genpire personalize designs to my brand?",
    answer:
      "Genpire learns your brand through Brand DNA. You can upload brand assets, reference products, collections, materials, or even a store URL. From that point on, every design, variation, and production detail is generated in your brand’s style — consistently and automatically.",
  },
  {
    question: "Can Genpire replace designers or studios?",
    answer:
      "Genpire doesn’t replace creativity — it removes friction. For many teams, it replaces repetitive design work, technical prep, and endless back-and-forth. Designers and studios use Genpire to move faster, focus on creative direction, and scale output without scaling headcount.",
  },
  {
    question: "Do I need my own manufacturer?",
    answer:
      "No. You can work with your existing manufacturers or connect products to manufacturers through Genpire. Products are shared as live, interactive product pages — not static files — making it easier for factories to review, ask questions, and move to sampling.",
  },
  {
    question: "What formats can I generate?",
    answer:
      "Genpire generates everything needed to take a product to production, including high-resolution product visuals and multi-view images, technical drawings and specifications, materials, measurements, and construction details, plus production-ready product pages shareable with factories. All outputs stay editable and connected in one place.",
  },
  {
    question: "Is Genpire suitable for agencies and enterprise teams?",
    answer:
      "Yes. Genpire is built for solo creators and large teams. Agencies use it to scale client work efficiently, while enterprise teams use it to align design, product, and manufacturing under a single system — with collaboration, permissions, and brand consistency built in.",
  },
  {
    question: "How much does Genpire cost?",
    answer:
      "Genpire offers flexible plans, including subscriptions and credit-based usage, so individuals, teams, and enterprises can choose what fits their workflow. Pricing scales with usage, not complexity — no long contracts required.",
  },
  {
    question: "What categories does Genpire support?",
    answer:
      "Genpire supports a wide range of physical product categories, including fashion and apparel, footwear, accessories and bags, jewelry, home and lifestyle products, and consumer goods and gadgets. New categories are added continuously.",
  },
];


export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

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
    <section id="faq" className="px-[16px] md:px-20 border-dashed border-[#DAD3C8] border-y">
      <div className="max-w-[1280px] mx-auto md:pt-[52px] md:pb-[48px] pt-[65px] pb-[40px] border-dashed border-[#DAD3C8] border-x">

        <div className="flex flex-col md:gap-9 gap-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:gap-9 gap-7"
          >
            <div className="flex items-center gap-3">
              <div className="w-1 h-5" style={{ backgroundColor: "#D2C8BC" }} />
              <span className="text-[14px] leading-[1.48] uppercase" style={{ color: "#57534E" }}>
                Questions & Answers
              </span>
            </div>
            <h2 className="font-bold text-[28px] lg:text-[44px] leading-[1.28] pl-3" style={{ color: "#000000" }} ref={sectionRef}>
              Frequently asked <motion.span style={{ color: animatedColor }}>questions</motion.span>
            </h2>
          </motion.div>

          <div className="flex flex-col  mx-auto w-full border-dashed border-[#DAD3C8] border-y">
            <div className="max-w-[848px] w-full mx-auto">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="box-border"
                  style={{
                    borderTop: "1px dashed #DAD3C8",
                    borderLeft: "1px dashed #DAD3C8",
                    borderRight: "1px dashed #DAD3C8",
                    borderBottom: index === faqs.length - 1 ? "1px dashed #DAD3C8" : "none",
                  }}
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full md:px-5 md:py-6 px-[16px] py-[20px] flex items-center justify-between text-left hover:opacity-70 transition-opacity"
                  >
                    <span className="font-medium text-[16px] lg:text-[18px] leading-normal" style={{ color: "#000000" }}>
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-6 h-6 transition-transform flex-shrink-0 ${openIndex === index ? "rotate-180" : ""}`}
                      style={{ color: "#000000", strokeWidth: 1.5 }}
                    />
                  </button>
                  {openIndex === index && (
                    <div className="px-5 pb-6" style={{ color: "#4B4844" }}>
                      {faq.answer}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

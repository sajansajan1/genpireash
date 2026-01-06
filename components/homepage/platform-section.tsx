"use client"

import { Shirt, ShoppingBag, Footprints, Replace as Necklace, Armchair, Lamp, Truck, Smartphone } from "lucide-react"
import { motion, useScroll, AnimatePresence, useTransform } from "framer-motion";
import { useRef } from "react";

const categories = [
  { name: "Fashion", icon: Shirt, link: "/industry/fashion-plm" },
  { name: "Accessories", icon: ShoppingBag, link: "/industry/accessories-plm", },
  { name: "Footwear", icon: Footprints, link: "/industry/footwear-plm", },
  { name: "Jewelry", icon: Necklace, link: "/industry/jewelry-plm", },
  { name: "Furniture", icon: Armchair, link: "/industry/furniture-plm", },
  { name: "Home Goods", icon: Lamp, link: "/industry/home-goods-plm", },
  { name: "Toys", icon: Truck, link: "/industry/toys-plm", },
  { name: "Gadgets", icon: Smartphone, link: "/industry/toys-plm", },
]

export function PlatformSection() {
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
    <section className="px-4 md:px-4 lg:px-20 py-0 border-dashed border-[#DAD3C8] border-y bg-[#ffffff]">
      <div className="max-w-[1280px] mx-auto  pb-[56px] border-dashed border-[#DAD3C8] border-x">
        <div className="flex flex-col items-start ">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-4"
          >
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-2 pt-[44px] md:mt-[44px] lg:mt-[52px]">
                <div className="w-1 h-5" style={{ backgroundColor: "#D2C8BC" }} />
                <span className="text-[14px] text-[#57534E] leading-[1.48] font-normal uppercase tracking-wide" style={{ color: "#57534E" }}>
                  What you can create
                </span>
              </div>

              <h2 className="pt-[28px] md:pt-[40px] text-[28px] md:text-[44px] font-bold leading-[1.28] ps-[12px]" ref={sectionRef}>
                One platform for every <motion.span className="text-[#AEADAD]" style={{ color: animatedColor }}>physical</motion.span>
                <br />
                <motion.span className="text-[#AEADAD]" style={{ color: animatedColor }}>product category, literally</motion.span>
              </h2>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full mt-[40px]">
            {categories.map((category, index) => {
              const Icon = category.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="flex flex-col items-center justify-center gap-[16px] md:gap-[24px] md:p-[30px] p-8 lg:p-[46px] border-dashed border-[#DAD3C8] border cursor-pointer"
                  style={{ backgroundColor: "#FFFFFF" }}
                  onClick={() => window.location.href = category.link}
                >
                  <Icon className="w-6 md:w-[44px] h-[44px] " style={{ color: "#000000", strokeWidth: 1.5 }} />
                  <span className="text-xs md:text-[18px] font-medium text-center leading-normal" style={{ color: "#000000" }}>
                    {category.name}
                  </span>
                </motion.div>
              )
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full text-center"          >
            <div className="bg-[#EFEBE7] py-7 px-6 md:p-[36px] mt-[0] md:mt-[44px] ">
              <p className="text-center text-black text-[18px] md:text-[20px] leading-[1.28]">
                If you can dream it, you can create it with{" "}
                <span className="italic font-semibold">genpire</span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

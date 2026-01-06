"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

export function TrustedLogo() {
    const logos = [
        "/logos/Logo-1.svg",
        "/logos/Logo-2.svg",
        "/logos/Logo-3.svg",
        "/logos/Logo-4.svg",
        "/logos/Logo-5.svg",
        "/logos/Logo-6.svg",
        "/logos/Logo-7.svg",
        "/logos/Logo-8.svg",
    ];
    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);

    useEffect(() => {
        if (containerRef.current) {
            // measure width of the first set of logos
            const firstSet = containerRef.current.children[0] as HTMLDivElement;
            setWidth(firstSet.scrollWidth / 2); // half because we duplicated logos
        }
    }, []);

    return (
        <section className="border-dashed border-[#DAD3C8] border-y px-5 md:px-10 lg:px-20 mt-[4px]">
            <div className="max-w-[1280px] mx-auto border-dashed border-[#DAD3C8] border-x">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="w-full flex flex-col items-center gap-10 py-6 md:py-8"
                >
                    <p
                        className="text-[14px] text-center md:px-0 px-[20px]"
                        style={{ color: "#817B74" }}
                    >
                        Trusted by <span className="font-bold">1500</span>+ creators and brands
                        around the world
                    </p>

                    {/* Logo marquee */}
                    <div className="relative w-full overflow-hidden">
                        <motion.div
                            className="overflow-hidden w-full"
                        >
                            <motion.div
                                ref={containerRef}
                                className="flex gap-12 items-center w-max"
                                animate={{ x: ["0%", "-50%"] }}
                                transition={{
                                    repeat: Infinity,
                                    repeatType: "loop",
                                    duration: 20,
                                    ease: "linear",
                                }}
                            >
                                {[...logos, ...logos].map((logoSrc, index) => (
                                    <div
                                        key={index}
                                        className="flex-shrink-0 flex items-center justify-center min-w-[120px]"
                                    >
                                        <img
                                            src={logoSrc || "/placeholder.svg"}
                                            alt={`Brand logo ${index + 1}`}
                                            className="h-8 md:h-10 w-auto object-contain hover:opacity-100 hover:grayscale-0 transition-all duration-300"
                                        />
                                    </div>
                                ))}
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

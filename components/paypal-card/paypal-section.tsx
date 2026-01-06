"use client";
import { motion } from "framer-motion";

export const Section = ({ id, eyebrow, title, subtitle, children }: any) => {
  return (
    <section id={id} className="relative w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12 bg-background">
      <div className="mx-auto max-w-7xl">
        {eyebrow && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-6 text-center"
          >
            <span
              className="inline-block px-4 py-2 text-sm font-medium text-black border border-stone-300 rounded-full backdrop-blur-sm"
              style={{ backgroundColor: "#D2C8BC" }}
            >
              {eyebrow}
            </span>
          </motion.div>
        )}
        {title && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl tracking-tight text-stone-900 sm:text-3xl lg:text-4xl mb-6 font-semibold">
              {title}
            </h2>
            {subtitle && <p className="text-lg text-stone-600 max-w-3xl mx-auto leading-relaxed">{subtitle}</p>}
          </motion.div>
        )}
        {children}
      </div>
    </section>
  );
};

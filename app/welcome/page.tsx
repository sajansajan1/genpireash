"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Shirt, Watch, Footprints, Gem, Sofa, Lamp, ToyBrick, Smartphone } from "lucide-react";
import { AuthModal } from "@/components/auth/auth-modal";

// Minimal Header for Ad Landing Page
function WelcomeHeader({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-5 md:px-20 lg:px-[88px] py-4 border-b"
      style={{
        backgroundColor: "#F7F5F3",
        borderBottom: "1px dashed #DAD3C8",
      }}
    >
      <div
        className="flex items-center cursor-pointer"
        onClick={() => (window.location.href = "/")}
      >
        <div
          className="font-bold text-xl md:text-2xl tracking-tight flex items-center gap-[7px]"
          style={{ color: "#000000" }}
        >
          <img
            src="/G.svg"
            alt="Genpire"
            className="md:w-[26px] md:h-[26px] w-[24px] h-[24px]"
          />
          <img
            src="/genpire.svg"
            alt="genpire"
            className="md:w-[72px] md:h-[18px] w-[67px] h-[16px]"
          />
        </div>
      </div>

      <button
        className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
        onClick={onGetStarted}
        style={{
          backgroundColor: "#18181B",
          color: "#FFFFFF",
        }}
      >
        Get Started
        <ArrowRight className="w-4 h-4" />
      </button>
    </header>
  );
}

// Hero Section
function HeroSection({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section className="px-4 md:px-8 lg:px-[80px] py-12 md:py-20">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex flex-col items-center text-center">
          <h1
            className="font-bold text-[32px] md:text-[48px] lg:text-[56px] leading-[1.15] tracking-tight"
            style={{ color: "#000000" }}
          >
            From Idea to Factory-Ready In Minutes.
          </h1>

          <p
            className="text-[16px] md:text-[18px] lg:text-[20px] font-normal leading-[1.6] max-w-[720px] mt-6"
            style={{ color: "#57534E" }}
          >
            Design real products with AI - and instantly generate factory-ready
            files your manufacturer understands. We're reinventing the
            design-to-factory workflow for the next generation of brands and
            product creators and you're welcome to join.
          </p>

          <button
            onClick={onGetStarted}
            className="mt-8 px-8 py-4 text-[16px] font-semibold rounded-xl transition-transform hover:scale-105"
            style={{
              backgroundColor: "#18181B",
              color: "#FFFFFF",
            }}
          >
            Create Your First Product
          </button>

          <p
            className="text-[14px] mt-4"
            style={{ color: "#817B74" }}
          >
            *No credit-card required
          </p>

          <p
            className="text-[14px] mt-8"
            style={{ color: "#57534E" }}
          >
            Loved by Creators, Brands, Studios, and Product teams worldwide
          </p>
        </div>
      </div>
    </section>
  );
}

// Factory Specs Carousel Section
function FactorySpecsCarousel() {
  const [step, setStep] = useState(0);
  const TOTAL_STEPS = 2;

  const carouselItems = [
    {
      title: "Component Images",
      mobileImages: ["/kj1.jpg", "/kj3.jpg"],
      desktopImages: ["/kj1.jpg", "/kj2.jpg", "/kj3.jpg"],
    },
    {
      title: "Technical Sketches",
      mobileImages: ["/bv1.jpg", "/bv3.jpg"],
      desktopImages: ["/bv1.jpg", "/bv2.jpg", "/bv3.jpg"],
    },
  ];

  // Auto-rotate carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % TOTAL_STEPS);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="px-4 md:px-8 lg:px-[80px] py-8 md:py-12">
      <div className="max-w-[680px] mx-auto">
        <div
          className="rounded-xl border p-4 md:p-6 relative overflow-hidden"
          style={{
            borderColor: "#E3E1E0",
            backgroundColor: "#F5F5F5",
            boxShadow: "0px 14px 48px 0px #72675A29",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col"
            >
              {/* Window dots and title */}
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
                {carouselItems[step].title}
              </motion.h3>

              {/* MOBILE: 2 images */}
              <div className="grid grid-cols-2 gap-4 mt-4 md:hidden">
                {carouselItems[step].mobileImages.map((img, index) => (
                  <motion.div
                    key={img}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.15, duration: 0.4 }}
                    className="rounded-lg border bg-[#FAFAFA] overflow-hidden h-full"
                  >
                    <img
                      src={img}
                      alt={`${carouselItems[step].title} ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </motion.div>
                ))}
              </div>

              {/* DESKTOP: 3 images */}
              <div className="hidden md:grid grid-cols-3 gap-4 mt-4">
                {carouselItems[step].desktopImages.map((img, index) => (
                  <motion.div
                    key={img}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.15, duration: 0.4 }}
                    className="rounded-lg border bg-[#FAFAFA] h-[200px]"
                  >
                    <img
                      src={img}
                      alt={`${carouselItems[step].title} ${index + 1}`}
                      className="h-full w-full object-fill"
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

// Product Categories Section
function ProductCategoriesSection() {
  const categories = [
    { name: "Fashion", icon: Shirt },
    { name: "Accessories", icon: Watch },
    { name: "Footwear", icon: Footprints },
    { name: "Jewelry", icon: Gem },
    { name: "Furniture", icon: Sofa },
    { name: "Home Goods", icon: Lamp },
    { name: "Toys", icon: ToyBrick },
    { name: "Gadgets", icon: Smartphone },
  ];

  return (
    <section className="px-4 md:px-8 lg:px-[80px] py-12 md:py-20">
      <div className="max-w-[1280px] mx-auto">
        {/* Section Header */}
        <div className="mb-8 md:mb-12">
          <div
            className="flex items-center gap-2 mb-4"
          >
            <div
              className="w-1 h-6 rounded"
              style={{ backgroundColor: "#D1C6BB" }}
            />
            <span
              className="text-sm font-medium tracking-wider uppercase"
              style={{ color: "#817B74" }}
            >
              What You Can Create
            </span>
          </div>

          <h2
            className="text-[28px] md:text-[36px] lg:text-[42px] font-bold leading-[1.2]"
            style={{ color: "#000000" }}
          >
            One platform for creating real, manufacturable products across{" "}
            <span style={{ color: "#817B74" }}>consumer categories</span>
          </h2>

          <p
            className="text-[18px] md:text-[24px] lg:text-[28px] mt-2 leading-[1.4]"
            style={{ color: "#57534E" }}
          >
            From fashion to furniture — Genpire adapts to how each product is
            actually made.
          </p>
        </div>

        {/* Categories Grid */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 border rounded-xl overflow-hidden"
          style={{ borderColor: "#E3E1E0", borderStyle: "dashed" }}
        >
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="flex flex-col items-center justify-center py-8 md:py-12 border-dashed hover:bg-stone-50 transition-colors cursor-pointer"
                style={{
                  borderColor: "#E3E1E0",
                  borderRightWidth: (index + 1) % 4 !== 0 ? "1px" : "0",
                  borderBottomWidth: index < 4 ? "1px" : "0",
                }}
              >
                <IconComponent
                  className="w-8 h-8 md:w-10 md:h-10 mb-3"
                  style={{ color: "#44403C" }}
                  strokeWidth={1.5}
                />
                <span
                  className="text-sm md:text-base font-medium"
                  style={{ color: "#000000" }}
                >
                  {category.name}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Tagline */}
        <div
          className="mt-8 py-4 text-center rounded-lg"
          style={{ backgroundColor: "#F5F3F0" }}
        >
          <p
            className="text-[14px] md:text-[16px]"
            style={{ color: "#57534E" }}
          >
            If you can dream it, you can create it with{" "}
            <span className="italic font-medium" style={{ color: "#000000" }}>
              genpire
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

// Dark CTA Section
function DarkCTASection({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section className="px-4 md:px-8 lg:px-[80px] py-12 md:py-16">
      <div className="max-w-[1000px] mx-auto">
        <div
          className="rounded-2xl py-16 md:py-20 px-6 md:px-12 text-center relative overflow-hidden"
          style={{
            backgroundColor: "#18181B",
            backgroundImage:
              "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        >
          <h2
            className="text-[20px] md:text-[28px] lg:text-[32px] font-bold leading-[1.4] max-w-[800px] mx-auto"
            style={{ color: "#FFFFFF" }}
          >
            Create factory-ready products and collections in minutes — not weeks.
          </h2>

          <p
            className="text-[14px] md:text-[16px] mt-4 max-w-[600px] mx-auto"
            style={{ color: "#A1A1AA" }}
          >
            Everything your manufacturer needs, generated automatically in one workflow.
          </p>

          <button
            onClick={onGetStarted}
            className="mt-8 px-6 py-3 text-[14px] font-semibold rounded-xl transition-transform hover:scale-105"
            style={{
              backgroundColor: "#FFFFFF",
              color: "#18181B",
            }}
          >
            Start Creating
          </button>
        </div>
      </div>
    </section>
  );
}

// Main Welcome Page Component
export default function WelcomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleGetStarted = () => {
    setIsAuthModalOpen(true);
  };

  return (
    <div
      className="min-h-screen w-full relative"
      style={{ backgroundColor: "#F7F5F3" }}
    >
      <WelcomeHeader onGetStarted={handleGetStarted} />
      <HeroSection onGetStarted={handleGetStarted} />
      <FactorySpecsCarousel />
      <ProductCategoriesSection />
      <DarkCTASection onGetStarted={handleGetStarted} />
      
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title="Get Started with Genpire"
        description="Sign in or create an account to start creating"
        defaultTab="signup"
      />
    </div>
  );
}

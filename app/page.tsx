"use client";
import { motion } from "framer-motion";
import React, { Suspense, use } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogClose, DialogTitle, VisuallyHidden } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import CountUp from "react-countup";
import { AuthModal } from "@/components/auth/auth-modal";
import { LandingFooter } from "@/components/landing-footer";
import { X, Crown, Sparkles, Map, Grid, Package, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useRouter, useSearchParams } from "next/navigation";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { PromoModal } from "@/components/promo-modal";
import { GenPWidget } from "@/components/gen-p-widget";
import { useGetAnnouncementsStore } from "@/lib/zustand/admin/announcements/getAnnouncements";
import { sendServerEvent } from "@/hooks/meta";
import { HeroSection } from "@/components/homepage/hero-section";
import { FeaturesSection } from "@/components/homepage/features-section";
import { ProductDesignSection } from "@/components/homepage/product-design-section";
import { PlatformSection } from "@/components/homepage/platform-section";
import { ManufacturerSection } from "@/components/homepage/manufacturer-section";
import { TeamChooseSection } from "@/components/homepage/team-choose-section";
import { MakersSections } from "@/components/homepage/makers-sections";
import { PlansSection } from "@/components/homepage/plans-section";
import { TestimonialsSections } from "@/components/homepage/testimonials-section";
import { FAQSection } from "@/components/homepage/faq-section";
import { CTASection } from "@/components/homepage/cta-section";
import { Header } from "@/components/homepage/header";
import { Sansita_Swashed } from "next/font/google";
const sansitaSwashed = Sansita_Swashed({
  subsets: ["latin"],
  weight: ["600"],
});
const PlayCircle = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} cx="12" cy="12" r="10" />
    <polygon strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} points="10,8 16,12 10,16 10,8" />
  </svg>
);
function getRandomInteger(min: any, max: any) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getDailyRandomNumber(min: any, max: any) {
  const today = new Date().toDateString(); // Get today's date string (e.g., "Mon Oct 07 2025")
  const storedData = JSON.parse(localStorage.getItem("dailyRandomNumberData") || "{}");

  if (storedData && storedData.date === today) {
    // If the number was already generated for today, return it
    return storedData.number;
  } else {
    // Generate a new random number
    const newRandomNumber = getRandomInteger(min, max);
    console.log("newRandomNumber ==> ", newRandomNumber);
    // Store the new number and today's date
    localStorage.setItem(
      "dailyRandomNumberData",
      JSON.stringify({
        number: newRandomNumber,
        date: today,
      })
    );
    return newRandomNumber;
  }
}

const CreationCard = React.memo(({ creation, index }: any) => {
  return (
    <motion.div
      key={creation.id}
      initial={{
        opacity: 0,
        y: 30,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.7,
        delay: index * 0.15,
      }}
      viewport={{
        once: true,
      }}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 border border-stone-100 hover:border-stone-200 flex flex-col h-full"
    >
      {/* Testimonial Content */}
      <div className="p-5 sm:p-6 space-y-4 flex-grow flex flex-col">
        {/* Quote Icon */}
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-stone-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
          </div>
          <div className="bg-stone-100 rounded-full px-2 py-1">
            <span className="text-xs font-medium text-stone-600">{creation.category}</span>
          </div>
        </div>

        {/* Testimonial Text */}
        <div className="flex-grow space-y-3">
          <p className="text-stone-700 text-sm sm:text-base leading-relaxed">{creation.testimonial}</p>
        </div>

        {/* Product Images - Smaller, embedded */}
        <div className="relative flex w-full bg-gradient-to-br from-stone-50 to-white rounded-xl overflow-hidden border border-stone-100  gap-2">
          <img
            src={creation.images.front || "/placeholder.svg"}
            alt={`${creation.name} - Front View`}
            className="w-1/2 h-full object-contain rounded-xl"
            loading="lazy"
          />
          <img
            src={creation.images.back || "/placeholder.svg"}
            alt={`${creation.name} - Back View`}
            className="w-1/2 h-full object-contain rounded-xl"
            loading="lazy"
          />
        </div>

        {/* User Info */}
        <div className="pt-4 border-t border-stone-100 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center flex-shrink-0 text-stone-700 font-bold text-base">
            {creation.userInitials}
          </div>
          <div className="flex-grow">
            <h4 className="font-semibold text-stone-900 text-sm">{creation.userName}</h4>
            <p className="text-xs text-stone-500">{creation.userRole}</p>
            <p className="text-xs font-medium text-stone-600 mt-0.5">{creation.name}</p>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

CreationCard.displayName = "CreationCard";
function GenPireHomepageContent() {
  const router = useRouter();
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [userPrompt, setUserPrompt] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isSnapModalOpen, setIsSnapModalOpen] = useState(false);
  const [snapVideo, setSnapVideo] = useState("");
  const [getRandomNumber, setGetRandomNumber] = useState(null);
  const [displayOneText, setDisplayOneText] = useState("");
  const [showPromoAfterAuth, setShowPromoAfterAuth] = useState(false);
  const searchParams = useSearchParams();
  const { fetchGetAnnouncements, GetAnnouncements, refresGetAnnouncements } = useGetAnnouncementsStore();
  const examplePrompts = [
    "Design a minimalist coffee mug with wooden handle ☕",
    "Create a sustainable water bottle with bamboo cap 🌱",
    "Design a vintage leather backpack with brass buckles 🎒",
    "Create a modern desk lamp with adjustable arm 💡",
    "Design a cozy throw blanket with geometric pattern 🛋️",
  ];

  // Auto-open auth modal if redirected from protected route
  useEffect(() => {
    const authRequired = searchParams?.get("auth");
    if (authRequired === "required") {
      setIsAuthModalOpen(true);
      // Clean up URL without reloading
      const url = new URL(window.location.href);
      url.searchParams.delete("auth");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  useEffect(() => {
    const dailyNumber = getDailyRandomNumber(100, 900);
    setGetRandomNumber(dailyNumber);
  }, []);

  useEffect(() => {
    sendServerEvent();
  }, []);

  // Empty dependency array - only run once on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!GetAnnouncements) {
        await fetchGetAnnouncements();
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const currentText = examplePrompts[currentPrompt];
    const oneText = "Create a modern urban backpack 🎒";

    let index = 0;

    setIsTyping(true);
    setDisplayedText("");
    setDisplayOneText("");

    const typingInterval = setInterval(() => {
      if (index < Math.max(currentText.length, oneText.length)) {
        if (index < currentText.length) {
          setDisplayedText(currentText.slice(0, index + 1));
        }

        if (index < oneText.length) {
          setDisplayOneText(oneText.slice(0, index + 1));
        }

        index++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, [currentPrompt]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrompt((prev) => (prev + 1) % examplePrompts.length);
    }, 4000); // Increased to 4 seconds to allow for typing animation
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleVideoClick = () => {
      const thumbnail = document.querySelector(".aspect-video .absolute.inset-0.bg-gradient-to-br") as HTMLElement;
      const iframe = document.getElementById("genpire-video") as HTMLElement;
      if (thumbnail && iframe) {
        thumbnail.style.opacity = "0";
        iframe.style.opacity = "1";
        iframe.style.pointerEvents = "auto";
      }
    };
    const playButton = document.querySelector(".w-20.h-20.bg-white.rounded-full");
    if (playButton) {
      playButton.addEventListener("click", handleVideoClick);
      return () => playButton.removeEventListener("click", handleVideoClick);
    }
  }, []);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground relative">
      {/* Clean background - removed gradient overlays for consistency */}

      {/* Nav */}
      <Header setIsAuthModalOpen={setIsAuthModalOpen} handleSmoothScroll={handleSmoothScroll} />
      <HeroSection
        setIsAuthModalOpen={setIsAuthModalOpen}
        setIsDemoModalOpen={setIsDemoModalOpen}
        userPrompt={userPrompt}
        setUserPrompt={setUserPrompt}
        displayedText={displayOneText}
      />
      <FeaturesSection />
      <ProductDesignSection />
      <PlatformSection />
      <ManufacturerSection
        setIsAuthModalOpen={setIsAuthModalOpen}
        userPrompt={userPrompt}
        setUserPrompt={setUserPrompt}
        displayedText={displayedText}
      />
      <TeamChooseSection sansitaSwashed={sansitaSwashed} />
      {/* <TrustedLogo /> */}
      <MakersSections
        setIsSnapModalOpen={setIsSnapModalOpen}
        setSnapVideo={setSnapVideo}
        sansitaSwashed={sansitaSwashed}
      />
      <PlansSection />
      <TestimonialsSections sansitaSwashed={sansitaSwashed} />
      <FAQSection />
      <CTASection setIsAuthModalOpen={setIsAuthModalOpen} setIsDemoModalOpen={setIsDemoModalOpen} />
      <LandingFooter />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setShowPromoAfterAuth(true); // mark to show promo again
        }}
      />
      <PromoModal onOpenAuthModal={() => setIsAuthModalOpen(true)} showAgain={showPromoAfterAuth} />

      {/* <LandingFooter /> */}

      {/* Demo Video Modal */}
      <Dialog open={isDemoModalOpen} onOpenChange={setIsDemoModalOpen}>
        <DialogContent className="max-w-4xl w-[90vw] h-[80vh] p-0">
          <VisuallyHidden>
            <DialogTitle>Genpire Product Creation Demo Video</DialogTitle>
          </VisuallyHidden>
          <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
            <DialogClose className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none text-white bg-black/50 hover:bg-black/70 p-2">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
            <div className="flex items-center justify-center w-full h-full">
              {isDemoModalOpen && (
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/yhyJ5zdMi84?si=SxiATrV3UlW2-gpB&autoplay=1&controls=0&modestbranding=1&rel=0"
                  title="Genpire Product Creation Demo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isSnapModalOpen} onOpenChange={setIsSnapModalOpen}>
        <DialogContent className="max-w-4xl w-[90vw] h-[80vh] p-0">
          <VisuallyHidden>
            <DialogTitle>Genpire Product Creation Demo Video</DialogTitle>
          </VisuallyHidden>
          <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
            <DialogClose className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none text-white bg-black/50 hover:bg-black/70 p-2">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
            <div className="flex items-center justify-center w-full h-full">
              <iframe
                className="w-full h-full"
                src={snapVideo}
                title="Genpire Product Creation Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <GenPWidget />
    </div>
  );
}

export default function GenPireHomepage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GenPireHomepageContent />
    </Suspense>
  );
}

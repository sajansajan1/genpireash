"use client"

import { Play } from "lucide-react"
import { useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
const videos = [
  {
    id: 1,
    thumbnail: "https://auth.genpire.com/storage/v1/object/public/genpire-uploads/SnapInsta.to_AQM23m7mEC_b_vBpPqYvuOCQCioWR5pomb708WrWvjlqcvL-N928L4hYXGjcJndwyTiCzlh2PGLW7m4ZaHCFux_hAJdEYgZDBLZ1cQg%20(1).mp4",
    isLarge: true,
    image: "/fashion-designer-working-on-laptop-with-geometric-.jpg",
  },
  {
    id: 2,
    thumbnail: "https://auth.genpire.com/storage/v1/object/public/genpire-uploads/SnapInsta.to_AQMa0SKEwGE2kwXMvO66uT5KxrhdWk8BycfBHmxAOMdSsbNNn-fh1mbRlg2X1fFcUTeDO-52FUcIY0ZEzRKMcYil-dJXVCYbaH8YTlk%20(1).mp4",
    isLarge: false,
    image: "/designer-sketching-product-concepts.jpg",
  },
  {
    id: 3,
    thumbnail: "https://auth.genpire.com/storage/v1/object/public/genpire-uploads/SnapInsta.to_AQMPQM65Sj-cyISGO5e-JLaEqnph_cd7GKn5-7ehKyMbZdqYZX7wIH9F7u0XMu5VPEGrpCPPchepwiIqFd92I7OAx-A7ElXocieiHEI%20(1).mp4",
    isLarge: false,
    image: "/person-working-on-product-design.jpg",
  },
  {
    id: 4,
    thumbnail: "https://auth.genpire.com/storage/v1/object/public/genpire-uploads/SnapInsta.to_AQNkRCerJYUtB8A6mNUnR-1MpebTzseFLEb0TvFPu6h_tmFf8JPjMEAcD84_SWATe2cqVoS8QZRKct3yxQxZvzgvjxH59ahy9lqUoYo%20(1).mp4",
    isLarge: false,
    image: "/designer-reviewing-product-prototypes.jpg",
  },
  {
    id: 5,
    thumbnail: "https://auth.genpire.com/storage/v1/object/public/genpire-uploads/SnapInsta.to_AQNMibvnrQOBLvti_FSnJBRjwZDg3e39BI8SXkr5_SP6s_PZaOWp4FW_EDRHW6QxyprFK9ED6c10DYJ9hNhV2_SQkgyjSG963bhx6II%20(1).mp4",
    isLarge: false,
    image: "/team-collaborating-on-design.jpg",
  },
]
type MakersSectionsProps = {
  setIsSnapModalOpen: (value: boolean) => void;
  setSnapVideo: (value: string) => void;
  sansitaSwashed: any;
}
export function MakersSections({ setIsSnapModalOpen, setSnapVideo, sansitaSwashed }: MakersSectionsProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

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

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % videos.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + videos.length) % videos.length)
  }

  return (
    <section className=" px-[16px] md:px-20" style={{ backgroundColor: "#F7F5F3" }}>
      <div className="max-w-[1280px] mx-auto border-dashed border-[#DAD3C8] border-x pt-[52px] pb-[47px]">
        <div className="flex flex-col gap-6 md:gap-[96px]">
          {/* Heading */}
          <div className="flex flex-col gap-6 md:gap-9">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5" style={{ backgroundColor: "#D2C8BC" }} />
              <span className="text-[14px] leading-[1.48]" style={{ color: "#57534E" }}>
                GENPIRE IN ACTION
              </span>
            </div>
            <div className="pl-3">
              <h2
                className="text-[28px] lg:text-[44px] leading-[1.28] font-bold"
                style={{ color: "#000000" }}
                ref={sectionRef}
              >
                <span className="md:hidden">
                  Creators sharing their <motion.span style={{ color: animatedColor }}>success stories with <span className={sansitaSwashed.className}>Genpire</span></motion.span>
                </span>
                <span className="hidden md:inline">
                  Makers in action <motion.span style={{ color: animatedColor }}>around the world</motion.span>
                </span>
              </h2>
            </div>
          </div>

          {/* Video Container */}
          <div className="relative overflow-hidden">
            {/* Top border line */}
            <div className="absolute left-0 right-0 top-0 flex items-center z-10">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#D2C8BC" }} />
              <div className="flex-1 border-t border-dashed" style={{ borderColor: "#DAD3C8" }} />
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#D2C8BC" }} />
            </div>

            {/* Bottom border line */}
            <div className="absolute left-0 right-0 bottom-0 flex items-center z-10">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#D2C8BC" }} />
              <div className="flex-1 border-t border-dashed" style={{ borderColor: "#DAD3C8" }} />
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#D2C8BC" }} />
            </div>

            {/* Mobile Horizontal Carousel */}
            <div className="md:hidden relative py-4">
              <div
                className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 px-4 scrollbar-hide"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {videos.map((video, index) => (
                  <div
                    key={video.id}
                    className="relative flex-shrink-0 w-[75vw] max-w-[280px] aspect-[9/16] rounded-[10px] overflow-hidden cursor-pointer snap-center"
                    onClick={() => [setIsSnapModalOpen(true), setSnapVideo(video.thumbnail)]}
                  >
                    <img
                      src={video.image || "./placeholder.png"}
                      className="w-full h-full object-cover"
                      alt={"image1"}
                    />

                    {/* Gradient overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(24, 24, 27, 0) 0%, rgba(24, 24, 27, 0) 81.97%, rgba(24, 24, 27, 0.4) 92.01%, rgba(24, 24, 27, 0.7) 100%)",
                      }}
                    />

                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="w-[60px] h-[60px] rounded-full bg-white flex items-center justify-center"
                        style={{ boxShadow: "0px 6px 32px rgba(0, 0, 0, 0.28), 0px 8px 40px rgba(0, 0, 0, 0.4)" }}
                      >
                        <Play className="w-6 h-6 fill-black" style={{ color: "#000000" }} />
                      </div>
                    </div>

                    {/* User Info - Only show for videos with user data */}
                    {/* {video.user && (
                      <div className="absolute bottom-4 left-4 flex items-center gap-2 z-10">
                        <img
                          src={video.user.avatar || "/placeholder.svg"}
                          alt={video.user.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>
                            {video.user.name}
                          </span>
                          <span className="text-xs" style={{ color: "#98989A" }}>
                            {video.user.username}
                          </span>
                        </div>
                      </div>
                    )} */}
                  </div>
                ))}
              </div>
            </div>

            <div
              className="hidden md:flex relative py-8 gap-4 md:gap-6 items-end justify-center"
              style={{ minHeight: '540px' }}
            >
              {/* Left vertical line */}
              <div
                className="absolute left-12 top-0 bottom-0 w-px border-l border-dashed"
                style={{ borderColor: "#DAD3C8" }}
              />

              {/* Right vertical line */}
              <div
                className="absolute right-12 top-0 bottom-0 w-px border-l border-dashed"
                style={{ borderColor: "#DAD3C8" }}
              />

              {/* Featured Large Video */}
              {videos.map((video, index) => {
                const isBig = hoveredIndex !== null ? hoveredIndex === index : index === 0;

                return (
                  <motion.div
                    key={video.id}
                    className="relative rounded-[10px] overflow-hidden cursor-pointer flex-shrink-0"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    animate={{
                      width: isBig ? 280 : 140,
                      height: isBig ? 498 : 249, // Fixed heights based on 9:16 ratio
                      zIndex: isBig ? 30 : 10,
                    }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    onClick={() => [setIsSnapModalOpen(true), setSnapVideo(video.thumbnail)]}
                  >
                    <motion.div className="w-full h-full relative">
                      <img
                        src={video.image || "./placeholder.png"}
                        className="w-full h-full object-cover"
                        alt={"image1"}
                      />
                      {/* Play button */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <motion.div
                          className="rounded-full bg-white flex items-center justify-center"
                          animate={{
                            width: isBig ? 88 : 60,
                            height: isBig ? 88 : 60,
                          }}
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                          style={{
                            boxShadow: "0px 6px 32px rgba(0, 0, 0, 0.28), 0px 8px 40px rgba(0, 0, 0, 0.4)",
                          }}
                        >
                          <Play
                            className={`fill-black`}
                            style={{
                              width: isBig ? 40 : 24,
                              height: isBig ? 40 : 24,
                              transition: "width 0.5s ease-in-out, height 0.5s ease-in-out",
                            }}
                          />
                        </motion.div>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}

            </div>
          </div>
        </div>
      </div>
    </section >
  )
}

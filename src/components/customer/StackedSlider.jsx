import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export const StackedSlider = ({ slides = [] }) => {
  const activeSlides = (slides || []).filter((s) => s && s.active !== false);
  const [activeId, setActiveId] = useState(activeSlides[0]?.id || null);

  useEffect(() => {
    if (activeSlides.length > 0) {
      setActiveId((prev) => {
        const exists = activeSlides.some((s) => s.id === prev);
        return exists ? prev : activeSlides[0].id;
      });
    }
  }, [activeSlides]);

  // Auto-slide every 4 seconds
  useEffect(() => {
    if (!activeSlides.length || activeSlides.length <= 1) return;

    const interval = setInterval(() => {
      setActiveId((prev) => {
        const currentIndex = activeSlides.findIndex((s) => s.id === prev);
        const nextIndex = (currentIndex + 1) % activeSlides.length;
        return activeSlides[nextIndex]?.id || activeSlides[0].id;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [activeSlides]);

  if (!activeSlides.length) return null;

  return (
    <div className="w-full bg-black py-4 md:py-8 px-3 md:px-8 border-b border-neutral-900 select-none">
      <div className="max-w-7xl mx-auto flex h-[280px] sm:h-[360px] md:h-[440px] gap-2 md:gap-4 overflow-hidden">
        {activeSlides.map((slide, index) => {
          const isActive = slide.id === activeId;
          const imgSrc = slide.imageUrl || slide.image || "";
          const titleText = slide.heading || slide.title || "VAYRA FOOTWEAR";
          const tagText = slide.tagTitle || slide.tag || "SIGNATURE COLLECTION";
          const subtitleText = slide.subtitle || "";
          const buttonText = slide.buttonText || "";
          const buttonLink = slide.buttonLink || slide.link || "#catalog";

          return (
            <motion.div
              key={slide.id || index}
              onClick={() => setActiveId(slide.id)}
              className={`relative h-full rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer border shrink-0 bg-neutral-950 transition-colors ${
                isActive ? "border-[#C5A059]/60 shadow-2xl" : "border-neutral-900 hover:border-neutral-800"
              }`}
              animate={{
                flex: isActive ? 4 : 0.8,
              }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt={titleText}
                  className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.7] transition-transform duration-700 hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black flex items-center justify-center">
                  <span className="font-serif font-black tracking-widest text-neutral-700 text-3xl">VAYRA</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

              {!isActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white/60 font-mono text-[9px] md:text-xs uppercase tracking-[0.3em] rotate-[-90deg] whitespace-nowrap">
                    0{index + 1}
                  </span>
                </div>
              )}

              {isActive && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 md:p-9 flex flex-col justify-end z-10"
                >
                  <span className="text-[#C5A059] text-[9px] md:text-xs uppercase tracking-widest font-mono font-bold mb-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                    {tagText}
                  </span>
                  <h3 className="text-lg sm:text-2xl md:text-4xl font-serif font-black uppercase text-white tracking-wide leading-tight line-clamp-2">
                    {titleText}
                  </h3>
                  {subtitleText && (
                    <p className="text-xs md:text-sm text-neutral-300 font-light mt-1.5 hidden sm:block max-w-lg">
                      {subtitleText}
                    </p>
                  )}
                  {buttonText && (
                    <div className="mt-3.5">
                      <a
                        href={buttonLink}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (buttonLink.startsWith("#")) {
                            const el = document.querySelector(buttonLink);
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                          }
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5F2EB] text-black text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#C5A059] transition-all shadow-lg active:scale-95 cursor-pointer"
                      >
                        {buttonText}
                      </a>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
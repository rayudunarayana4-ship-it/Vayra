import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export const StackedSlider = ({ slides = [] }) => {
  const [activeId, setActiveId] = useState(slides[0]?.id || null);

  useEffect(() => {
    if (slides.length > 0) {
      setActiveId((prev) => {
        const exists = slides.some((s) => s.id === prev);
        return exists ? prev : slides[0].id;
      });
    }
  }, [slides]);

  // Decreased auto-slide timer interval to 2 seconds (2000ms)
  useEffect(() => {
    if (!slides.length || slides.length <= 1) return;

    const interval = setInterval(() => {
      setActiveId((prev) => {
        const currentIndex = slides.findIndex((s) => s.id === prev);
        const nextIndex = (currentIndex + 1) % slides.length;
        return slides[nextIndex]?.id || slides[0].id;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [slides]);

  if (!slides.length) return null;

  return (
    <div className="w-full bg-black py-4 md:py-8 px-3 md:px-8 border-b border-neutral-900 select-none">
      <div className="max-w-7xl mx-auto flex h-[260px] sm:h-[340px] md:h-[420px] gap-2 md:gap-4 overflow-hidden">
        {slides.map((slide, index) => {
          const isActive = slide.id === activeId;
          const imgSrc = slide.imageUrl || slide.image || "https://placehold.co/800x600";
          const titleText = slide.heading || slide.title || "TWO BROTHERS";
          const tagText = slide.tagTitle || slide.tag || "DROP 1";
          const subtitleText = slide.subtitle || "";

          return (
            <motion.div
              key={slide.id || index}
              onClick={() => setActiveId(slide.id)}
              className="relative h-full rounded-2xl overflow-hidden cursor-pointer border border-neutral-800 shrink-0 bg-neutral-950"
              animate={{
                flex: isActive ? 4 : 0.8,
              }}
              transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
            >
              <img
                src={imgSrc}
                alt={titleText}
                className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.7] transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

              {!isActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white/60 font-mono text-[9px] md:text-xs uppercase tracking-[0.25em] rotate-[-90deg] whitespace-nowrap">
                    0{index + 1}
                  </span>
                </div>
              )}

              {isActive && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 flex flex-col justify-end z-10"
                >
                  <span className="text-white/80 text-[9px] md:text-xs uppercase tracking-widest font-mono font-bold mb-1">
                    {tagText}
                  </span>
                  <h3 className="text-base sm:text-xl md:text-3xl font-serif font-black uppercase text-white tracking-wide leading-tight line-clamp-2">
                    {titleText}
                  </h3>
                  {subtitleText && (
                    <p className="text-[11px] md:text-xs text-neutral-300 font-light mt-1 hidden sm:block max-w-md">
                      {subtitleText}
                    </p>
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
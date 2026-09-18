import React from "react";
import { ShoppingBag } from "lucide-react";

export const Navbar = ({ cartCount = 0, onOpenBag }) => {
  return (
    <header className="sticky top-0 z-50 bg-[#050505]/95 backdrop-blur-md border-b border-neutral-900/90 px-3 sm:px-6 md:px-8 py-2.5 sm:py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 sm:gap-4 cursor-pointer min-w-0 group select-none">
          {/* Architectural V Emblem */}
          <div className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl bg-gradient-to-b from-neutral-900 to-black border border-neutral-800 flex items-center justify-center shrink-0 shadow-lg group-hover:border-[#C5A059]/60 transition-colors">
            <svg viewBox="0 0 40 40" className="w-5 h-5 sm:w-6 sm:h-6" fill="none">
              <path d="M9 10L20 32L31 10H25L20 22L15 10H9Z" fill="#F5F2EB" />
              <path d="M20 18L26 30L32 18" stroke="#C5A059" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="20" cy="8" r="1.5" fill="#C5A059" />
            </svg>
          </div>

          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-lg md:text-xl tracking-[0.2em] sm:tracking-[0.25em] font-serif font-black uppercase text-white leading-none">
                VAYRA
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[8px] tracking-[0.2em] font-mono uppercase bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30">
                FOOTWEAR
              </span>
            </div>
            <span className="text-[7px] sm:text-[9px] uppercase tracking-[0.22em] text-neutral-400 mt-1 font-medium flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[#C5A059]" />
              Step Into Your Style
            </span>
          </div>
        </div>

        {/* Right Actions: Shopping Bag */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

          {/* Bag Trigger */}
          <button
            onClick={onOpenBag}
            className="relative p-2.5 sm:p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 hover:text-white hover:border-[#C5A059]/70 transition-all active:scale-95 cursor-pointer shadow-md"
            aria-label="Open Shopping Bag"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-200" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] sm:min-w-[20px] h-4 sm:h-5 px-1 bg-[#F5F2EB] text-black text-[9px] sm:text-[10px] font-black rounded-full flex items-center justify-center shadow-lg border border-black font-mono">
                {cartCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
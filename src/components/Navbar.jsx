import React from "react";
import { ShoppingBag } from "lucide-react";

export const Navbar = ({ cartCount = 0, onOpenBag }) => {
  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-neutral-900 px-3 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-2.5 sm:gap-4 cursor-pointer min-w-0">
          {/* Increased logo size container */}
          <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-20 md:h-20 lg:w-24 lg:h-24 flex items-center justify-center shrink-0">
            <img
              src="/logo.png"
              alt="Two Brothers"
              className="w-full h-full object-contain invert brightness-200"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>

          <div className="flex flex-col justify-center min-w-0">
            <span className="text-xs sm:text-lg md:text-xl tracking-[0.14em] sm:tracking-[0.25em] font-serif font-black uppercase text-white leading-tight truncate">
              Two Brothers
            </span>
            <span className="text-[6.5px] sm:text-[8px] md:text-[9px] uppercase tracking-[0.18em] sm:tracking-[0.25em] text-neutral-400 mt-0.5">
              Premium Shirting
            </span>
          </div>
        </div>

        {/* Bag Trigger */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onOpenBag}
            className="relative p-2 sm:p-2.5 rounded-full bg-neutral-950 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-600 transition active:scale-95 cursor-pointer"
            aria-label="Open Shopping Bag"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[15px] sm:min-w-[17px] h-3.5 sm:h-4 px-1 bg-white text-black text-[8px] sm:text-[9px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
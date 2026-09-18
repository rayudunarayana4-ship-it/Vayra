import React from "react";
import { Sparkles, Footprints, Award, Shield, Briefcase, Sun } from "lucide-react";

export const FilterBar = ({ selectedFilter, setFilter }) => {
  const categories = [
    { label: "All Footwear", key: "All", icon: Sparkles },
    { label: "Sneakers", key: "Sneakers", icon: Footprints },
    { label: "Loafers", key: "Loafers", icon: Award },
    { label: "Boots", key: "Boots", icon: Shield },
    { label: "Formal", key: "Formal", icon: Briefcase },
    { label: "Sandals/Slides", key: "Sandals/Slides", icon: Sun },
  ];

  return (
    <div className="sticky top-[57px] sm:top-[65px] z-40 w-full bg-[#050505]/95 backdrop-blur-md border-b border-neutral-900 py-2.5 px-3 md:px-8 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Footwear Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full scrollbar-none py-0.5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedFilter === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setFilter(cat.key)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] md:text-[11px] uppercase tracking-wider font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer active:scale-95 ${
                  isActive
                    ? "bg-[#F5F2EB] text-black shadow-md font-bold"
                    : "bg-neutral-950 text-neutral-400 border border-neutral-800 hover:text-white hover:border-[#C5A059]/50"
                }`}
              >
                <Icon size={12} className={isActive ? "text-black" : "text-[#C5A059]"} />
                {cat.label}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
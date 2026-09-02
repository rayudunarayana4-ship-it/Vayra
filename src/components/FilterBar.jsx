import React from "react";
import { Sparkles, Shirt, Layers, Box } from "lucide-react";

export const FilterBar = ({ selectedFilter, setFilter, selectedDrop, setDrop }) => {
  const categories = [
    { label: "All Items", key: "All", icon: Sparkles },
    { label: "Casual Shirt", key: "Casual Shirt", icon: Shirt },
    { label: "100% Cotton", key: "Cotton", icon: Layers },
    { label: "Boxy Fit", key: "Boxy Fit", icon: Box },
  ];

  const drops = ["All Drops", "Drop 1", "Drop 2"];

  return (
    <div className="sticky top-[53px] md:top-[65px] z-40 w-full bg-black/90 backdrop-blur-md border-b border-neutral-900 py-2 px-3 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
        
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none py-0.5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedFilter === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setFilter(cat.key)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] md:text-[10px] uppercase tracking-wider font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer active:scale-95 ${
                  isActive
                    ? "bg-white text-black"
                    : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white hover:border-neutral-700"
                }`}
              >
                <Icon size={11} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Drops Selection */}
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex bg-neutral-900 p-0.5 rounded-lg border border-neutral-800 w-full sm:w-auto justify-center">
            {drops.map((d) => {
              const isDropActive = selectedDrop === d;
              return (
                <button
                  key={d}
                  onClick={() => setDrop(d)}
                  className={`flex-1 sm:flex-none px-2.5 py-0.5 text-[9px] md:text-[10px] font-semibold rounded-md transition-all cursor-pointer ${
                    isDropActive
                      ? "bg-neutral-800 text-white"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
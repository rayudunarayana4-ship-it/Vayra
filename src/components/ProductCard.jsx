import React from "react";
import { Star, ArrowUpRight } from "lucide-react";

export const ProductCard = ({ product, onSelect, onQuickBuy }) => {
  const primaryImage =
    product?.images?.[0] ||
    product?.image ||
    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80";

  const stockCount = product?.stock !== undefined ? Number(product.stock) : 10;
  const isOutOfStock = stockCount <= 0;
  const isLowStock = stockCount > 0 && stockCount <= 3;

  return (
    <div
      onClick={() => onSelect(product)}
      className="group flex flex-col bg-neutral-950 border border-neutral-900 rounded-xl overflow-hidden hover:border-neutral-700 transition duration-300 cursor-pointer"
    >
      {/* Product Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-950">
        <img
          src={primaryImage}
          alt={product?.name || "Shirt"}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            isOutOfStock ? "grayscale opacity-50" : ""
          }`}
          loading="lazy"
        />

        {/* Drop Badge */}
        <div className="absolute top-2 left-2">
          <span className="bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded text-[8px] tracking-wider uppercase border border-neutral-800 text-white">
            {product?.dropName || "Drop 1"}
          </span>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] font-bold text-white border border-neutral-800">
          <Star size={9} className="fill-white text-white" />
          <span>{product?.rating || 4.8}</span>
        </div>

        {/* Flipkart-Style Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] flex items-center justify-center p-2">
            <span className="bg-red-600 text-white text-[10px] sm:text-xs font-black uppercase px-3 py-1 rounded-md tracking-wider shadow-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-2 bg-neutral-950">
        <div>
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="text-[8px] sm:text-[9px] tracking-wider uppercase font-semibold text-neutral-400 truncate">
              {product?.fabric || "Cotton"} • {product?.fit || "Boxy"}
            </span>

            {/* Flipkart-style urgency pill */}
            {isLowStock && (
              <span className="text-[8px] font-bold text-amber-400 animate-pulse whitespace-nowrap">
                Only {stockCount} left!
              </span>
            )}
          </div>

          <h3 className="font-serif text-xs sm:text-sm font-medium text-white group-hover:text-neutral-300 transition-colors leading-snug line-clamp-2">
            {product?.name}
          </h3>
        </div>

        <div className="pt-2.5 border-t border-neutral-900 flex items-center justify-between gap-2">
          <div>
            <span className="text-[7px] tracking-wider uppercase text-neutral-500 block leading-none">
              Price
            </span>
            <span className="text-xs sm:text-sm font-serif font-medium text-white">
              ₹{product?.price?.toLocaleString("en-IN")}
            </span>
          </div>

          <button
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation();
              if (!isOutOfStock) onQuickBuy(product);
            }}
            className={`flex items-center gap-0.5 px-2.5 py-1 text-[9px] sm:text-[10px] uppercase tracking-wider font-bold rounded transition shrink-0 ${
              isOutOfStock
                ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                : "bg-white text-black hover:bg-neutral-200 active:scale-95 cursor-pointer"
            }`}
          >
            <span>{isOutOfStock ? "Sold" : "Buy"}</span>
            {!isOutOfStock && <ArrowUpRight size={10} className="hidden sm:inline" />}
          </button>
        </div>
      </div>
    </div>
  );
};
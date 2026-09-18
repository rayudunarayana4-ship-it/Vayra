import React from "react";
import { Star, ArrowUpRight } from "lucide-react";

export const ProductCard = ({ product, onSelect, onQuickBuy }) => {
  const primaryImage =
    product?.images?.[0] ||
    product?.image ||
    "";

  const stockCount = product?.stock !== undefined && product?.stock !== null ? Number(product.stock) : 10;
  const isOutOfStock = stockCount <= 0;
  const isLowStock = stockCount > 0 && stockCount <= 3;

  const categoryLabel = product?.category || "Footwear";
  const materialLabel = product?.upperMaterial || product?.material || "Full-Grain Leather";
  const soleLabel = product?.soleType || product?.sole || "Cushioned Sole";

  return (
    <div
      onClick={() => onSelect(product)}
      className="group flex flex-col bg-[#0A0A0A] border border-neutral-900/90 rounded-2xl overflow-hidden hover:border-[#C5A059]/40 hover:shadow-2xl hover:shadow-black/60 transition-all duration-300 cursor-pointer"
    >
      {/* Footwear Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-950">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product?.name || "Footwear"}
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
              isOutOfStock ? "grayscale opacity-40" : ""
            }`}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-900/40 text-neutral-600 text-[10px] font-mono uppercase tracking-widest gap-2">
            <span className="font-serif text-neutral-500 font-bold tracking-wider">VAYRA</span>
            <span>No Image</span>
          </div>
        )}

        {/* Featured Badge (if applicable) */}
        {product?.featured && (
          <div className="absolute top-2.5 left-2.5">
            <span className="bg-[#C5A059]/90 text-black px-2 py-0.5 rounded-md text-[8px] tracking-widest uppercase font-mono font-black shadow-md">
              Featured
            </span>
          </div>
        )}

        {/* Rating Badge */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/85 backdrop-blur-md px-2 py-1 rounded-md text-[9px] font-bold text-white border border-neutral-800">
          <Star size={10} className="fill-[#C5A059] text-[#C5A059]" />
          <span>{Number(product?.rating || 4.8).toFixed(1)}</span>
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] flex items-center justify-center p-3">
            <span className="bg-red-700 text-white text-[10px] sm:text-xs font-black uppercase px-3.5 py-1.5 rounded-lg tracking-widest shadow-xl border border-red-600">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-3.5 sm:p-5 flex flex-col flex-1 justify-between gap-2.5 bg-[#0A0A0A]">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[8px] sm:text-[9px] tracking-widest uppercase font-semibold text-[#C5A059] truncate">
              {categoryLabel} • {materialLabel}
            </span>

            {isLowStock && (
              <span className="text-[8px] font-bold text-amber-400 animate-pulse whitespace-nowrap">
                Only {stockCount} left!
              </span>
            )}
          </div>

          <h3 className="font-serif text-sm sm:text-base font-bold text-white group-hover:text-[#F5F2EB] transition-colors leading-snug line-clamp-1">
            {product?.name}
          </h3>

          <p className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5 font-light">
            {soleLabel}
          </p>
        </div>

        <div className="pt-3 border-t border-neutral-900 flex items-center justify-between gap-2">
          <div>
            <span className="text-[7.5px] tracking-widest uppercase text-neutral-500 block leading-none font-mono">
              INR Price
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-sm sm:text-base font-serif font-bold text-white">
                ₹{Number(product?.price || 2999).toLocaleString("en-IN")}
              </span>
              {product?.originalPrice && (
                <span className="text-[10px] text-neutral-600 line-through">
                  ₹{Number(product.originalPrice).toLocaleString("en-IN")}
                </span>
              )}
            </div>
          </div>

          <button
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation();
              if (!isOutOfStock) onQuickBuy(product);
            }}
            className={`flex items-center gap-1 px-3 py-1.5 text-[9px] sm:text-[10px] uppercase tracking-wider font-bold rounded-lg transition-all shrink-0 ${
              isOutOfStock
                ? "bg-neutral-900 text-neutral-600 cursor-not-allowed border border-neutral-800"
                : "bg-[#F5F2EB] text-black hover:bg-[#C5A059] active:scale-95 cursor-pointer shadow"
            }`}
          >
            <span>{isOutOfStock ? "Sold" : "Select"}</span>
            {!isOutOfStock && <ArrowUpRight size={12} className="hidden sm:inline" />}
          </button>
        </div>
      </div>
    </div>
  );
};
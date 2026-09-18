import React from "react";
import { ProductCard } from "./ProductCard";

export const ProductGrid = ({ products = [], onSelectProduct, onQuickBuy }) => {
  if (!products || products.length === 0) {
    return (
      <div className="py-20 text-center border border-dashed border-neutral-800 rounded-3xl p-8 bg-neutral-950">
        <h3 className="text-sm font-serif font-bold text-white mb-2 tracking-wide">
          No footwear silhouettes found
        </h3>
        <p className="text-xs text-neutral-500">
          Check back soon for new footwear collections.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
      {products.map((shoe) => (
        <ProductCard
          key={shoe?.id || Math.random()}
          product={shoe}
          onSelect={onSelectProduct}
          onQuickBuy={onQuickBuy}
        />
      ))}
    </div>
  );
};
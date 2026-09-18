import React from "react";
import { X, Trash2, Plus, Minus, ShoppingBag, ShieldCheck, ArrowRight, Footprints } from "lucide-react";

export const BagDrawer = ({
  isOpen,
  onClose,
  items = [],
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1),
    0
  );
  const total = subtotal;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-8 sm:pl-10">
        <div className="w-screen max-w-md bg-[#090909] border-l border-neutral-800/80 text-neutral-100 flex flex-col shadow-2xl">
          
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-neutral-900 flex items-center justify-between bg-[#0c0c0c]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-[#C5A059]">
                <ShoppingBag size={18} />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-serif font-black uppercase tracking-wider text-white">
                  Shopping Bag
                </h2>
                <p className="text-[10px] text-neutral-400 font-mono">
                  {items.reduce((sum, i) => sum + (i.quantity || 1), 0)} {items.length === 1 ? "Pair" : "Pairs"} Reserved
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-900/80 border border-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Bag Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-3 text-neutral-600">
                  <Footprints size={28} className="text-[#C5A059]" />
                </div>
                <h3 className="font-serif font-bold text-white text-base mb-1">Your bag is empty</h3>
                <p className="text-xs text-neutral-400 max-w-[240px] leading-relaxed">
                  Explore our handcrafted footwear collection and step into your style.
                </p>
              </div>
            ) : (
              items.map((item, index) => {
                const img = item.images?.[0] || item.image || "";
                const itemKey = `${item.id}-${item.selectedSize || "UK 8"}`;
                const materialText = item.upperMaterial || item.material || item.fabric || "Leather";

                return (
                  <div
                    key={itemKey || index}
                    className="flex gap-3.5 bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-3.5 relative hover:border-neutral-700 transition"
                  >
                    {/* Item Image */}
                    <div className="w-20 h-24 rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 shrink-0 flex items-center justify-center">
                      {img ? (
                        <img src={img} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[9px] font-mono text-neutral-600 uppercase">No Image</span>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex justify-between items-start gap-1 pr-6">
                          <h4 className="font-serif font-bold text-xs sm:text-sm text-white leading-tight truncate">
                            {item.name}
                          </h4>
                        </div>
                        <div className="text-[10px] text-neutral-400 mt-1 flex items-center gap-2 font-mono">
                          <span>Size: <strong className="text-[#C5A059]">{item.selectedSize || "UK 8"}</strong></span>
                          <span>•</span>
                          <span className="truncate">{materialText}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-900">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-neutral-800 bg-neutral-950 rounded-lg p-0.5">
                          <button
                            onClick={() => onUpdateQuantity(itemKey, (item.quantity || 1) - 1)}
                            className="p-1 text-neutral-400 hover:text-white transition cursor-pointer"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-2.5 text-xs font-mono font-bold text-white">
                            {item.quantity || 1}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(itemKey, (item.quantity || 1) + 1)}
                            className="p-1 text-neutral-400 hover:text-white transition cursor-pointer"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* Price */}
                        <span className="font-serif font-bold text-xs sm:text-sm text-white">
                          ₹{((Number(item.price) || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* Remove Action */}
                    <button
                      onClick={() => onRemoveItem(itemKey)}
                      className="absolute top-3 right-3 text-neutral-500 hover:text-red-400 transition cursor-pointer"
                      aria-label="Remove item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Checkout Footer */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-neutral-900 bg-[#0c0c0c] space-y-4">
              <div className="space-y-1.5 text-xs text-neutral-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white font-mono font-medium">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Express Courier (Pan-India)</span>
                  <span className="text-emerald-400 font-bold uppercase text-[10px] tracking-wider font-mono">FREE</span>
                </div>
                <div className="flex justify-between text-sm font-serif font-bold text-white pt-2.5 border-t border-neutral-900">
                  <span>Total Payable</span>
                  <span className="text-base text-[#F5F2EB] font-mono">₹{total.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <button
                onClick={() => onCheckout(total, items)}
                className="w-full py-4 px-4 bg-[#F5F2EB] text-black hover:bg-[#C5A059] font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xl cursor-pointer"
              >
                <span>Proceed to Checkout • ₹{total.toLocaleString("en-IN")}</span>
                <ArrowRight size={14} />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-500">
                <ShieldCheck size={13} className="text-[#C5A059]" />
                <span>Encrypted Direct WhatsApp UPI Checkout</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
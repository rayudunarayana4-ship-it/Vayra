import React from "react";
import { X, Trash2, Plus, Minus, ShoppingBag, ShieldCheck, ArrowRight } from "lucide-react";

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
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );
  const shipping = subtotal > 0 ? 0 : 0; // Free shipping
  const total = subtotal + shipping;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0a0a0a] border-l border-neutral-800 text-neutral-100 flex flex-col shadow-2xl">
          
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-neutral-900 flex items-center justify-between bg-[#0d0d0d]">
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} className="text-amber-400" />
              <h2 className="text-sm sm:text-base font-serif font-black uppercase tracking-wider text-white">
                Shopping Bag ({items.reduce((sum, i) => sum + (i.quantity || 1), 0)})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition"
            >
              <X size={16} />
            </button>
          </div>

          {/* Bag Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-3 text-neutral-600">
                  <ShoppingBag size={28} />
                </div>
                <h3 className="font-serif font-bold text-white text-sm mb-1">Your bag is empty</h3>
                <p className="text-xs text-neutral-500 max-w-[200px]">
                  Explore our luxury shirting collection and add your preferred drape.
                </p>
              </div>
            ) : (
              items.map((item, index) => {
                const img = item.images?.[0] || item.image || "https://placehold.co/100x120";
                const itemKey = `${item.id}-${item.selectedSize || "M"}`;

                return (
                  <div
                    key={itemKey || index}
                    className="flex gap-3 bg-neutral-900/40 border border-neutral-800/80 rounded-xl p-3 relative"
                  >
                    {/* Item Image */}
                    <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden bg-neutral-950 border border-neutral-800 shrink-0">
                      <img src={img} alt={item.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-1 pr-6">
                          <h4 className="font-serif font-bold text-xs sm:text-sm text-white leading-tight line-clamp-1">
                            {item.name}
                          </h4>
                        </div>
                        <div className="text-[10px] text-neutral-400 mt-1 flex items-center gap-2">
                          <span>Size: <strong className="text-white">{item.selectedSize || "M"}</strong></span>
                          <span>•</span>
                          <span>{item.fabric || "Cotton"}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-900/80">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-neutral-800 bg-neutral-950 rounded-md">
                          <button
                            onClick={() => onUpdateQuantity(itemKey, (item.quantity || 1) - 1)}
                            className="p-1 text-neutral-400 hover:text-white"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-2 text-xs font-bold text-white">
                            {item.quantity || 1}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(itemKey, (item.quantity || 1) + 1)}
                            className="p-1 text-neutral-400 hover:text-white"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* Price */}
                        <span className="font-serif font-bold text-xs sm:text-sm text-white">
                          ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* Remove Action */}
                    <button
                      onClick={() => onRemoveItem(itemKey)}
                      className="absolute top-2.5 right-2.5 text-neutral-500 hover:text-red-400 transition"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer / Checkout Summary */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-neutral-900 bg-[#0d0d0d] space-y-4">
              <div className="space-y-1.5 text-xs text-neutral-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Express Delivery</span>
                  <span className="text-emerald-400 font-medium">FREE</span>
                </div>
                <div className="flex justify-between text-sm font-serif font-bold text-white pt-2 border-t border-neutral-900">
                  <span>Grand Total</span>
                  <span className="text-base text-amber-200">₹{total.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <button
                onClick={() => onCheckout(total, items)}
                className="w-full py-3.5 px-4 bg-white text-black hover:bg-amber-300 font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 active:scale-95 shadow-xl"
              >
                <span>Place Order • ₹{total.toLocaleString("en-IN")}</span>
                <ArrowRight size={14} />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-500">
                <ShieldCheck size={12} className="text-emerald-500" />
                <span>Encrypted 256-Bit UPI & Card Checkout</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
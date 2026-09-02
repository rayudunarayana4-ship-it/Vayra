import React, { useState, useEffect, useMemo } from "react";
import { Navbar } from "./components/Navbar";
import { StackedSlider } from "./components/StackedSlider";
import { FilterBar } from "./components/FilterBar";
import { ProductCard } from "./components/ProductCard";
import { ProductPage } from "./components/ProductPage";
import { BagDrawer } from "./components/BagDrawer";
import { CheckoutPage } from "./components/CheckoutPage";
import { Footer } from "./components/Footer";
import { fetchProducts } from "./services/api";

const API_BASE_URL = "http://localhost:8081/api";

export default function App() {
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [filter, setFilter] = useState("All");
  const [drop, setDrop] = useState("All Drops");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("two_brothers_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("two_brothers_cart", JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Auto-fetch products and stock levels every 3 seconds in the background
  useEffect(() => {
    loadData();

    const stockPollInterval = setInterval(() => {
      loadData();
    }, 3000);

    return () => clearInterval(stockPollInterval);
  }, []);

  const loadData = async () => {
    try {
      const [productData, bannerData] = await Promise.all([
        fetchProducts().catch(() => []),
        fetch(`${API_BASE_URL}/banners/active`)
          .then((res) => (res.ok ? res.json() : []))
          .catch(() => []),
      ]);

      setProducts(Array.isArray(productData) ? productData : []);
      setBanners(Array.isArray(bannerData) ? bannerData : []);
    } catch (err) {
      console.error("Error loading store data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (productWithSize) => {
    const itemSize = productWithSize?.selectedSize || "M";
    const itemKey = `${productWithSize?.id}-${itemSize}`;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => `${item.id}-${item.selectedSize || "M"}` === itemKey
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: (updated[existingIndex].quantity || 1) + 1,
        };
        return updated;
      } else {
        return [...prevCart, { ...productWithSize, selectedSize: itemSize, quantity: 1 }];
      }
    });

    setIsBagOpen(true);
  };

  const handleDirectBuy = (productWithSize) => {
    const itemSize = productWithSize?.selectedSize || "M";
    const itemKey = `${productWithSize?.id}-${itemSize}`;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => `${item.id}-${item.selectedSize || "M"}` === itemKey
      );

      if (existingIndex > -1) return prevCart;
      return [...prevCart, { ...productWithSize, selectedSize: itemSize, quantity: 1 }];
    });

    setSelectedProduct(null);
    setIsBagOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleUpdateQuantity = (itemKey, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemKey);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        const currentKey = `${item.id}-${item.selectedSize || "M"}`;
        return currentKey === itemKey ? { ...item, quantity: newQuantity } : item;
      })
    );
  };

  const handleRemoveItem = (itemKey) => {
    setCart((prev) =>
      prev.filter((item) => `${item.id}-${item.selectedSize || "M"}` !== itemKey)
    );
  };

  const handleProceedToCheckout = () => {
    setIsBagOpen(false);
    setIsCheckoutOpen(true);
  };

  const totalCartCount = (cart || []).reduce((sum, item) => sum + (item.quantity || 1), 0);

  const activeSliderSlides = useMemo(() => {
    return banners.length > 0
      ? banners.map((b, idx) => ({
          id: b.id || idx,
          title: b.heading || "TWO BROTHERS",
          subtitle: b.subtitle || "",
          tag: b.tagTitle || "EXCLUSIVE DROP",
          image: b.imageUrl || "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80",
        }))
      : (products || [])
          .filter((p) => p && Array.isArray(p.images) && p.images.length > 0)
          .slice(0, 4)
          .map((item, index) => ({
            id: item?.id || index,
            title: item?.name || "Two Brothers",
            subtitle: `${item?.fabric || "100% Cotton"} • ${item?.fit || "Boxy Fit"}`,
            tag: item?.dropName || `DROP 0${index + 1}`,
            image: item?.images?.[0] || "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80",
          }));
  }, [banners, products]);

  const filteredProducts = useMemo(() => {
    const list = (products || []).filter((item) => {
      if (!item) return false;

      let matchCategory = true;
      if (filter !== "All") {
        const target = filter.toLowerCase();
        const fabric = (item.fabric || "").toLowerCase();
        const fit = (item.fit || "").toLowerCase();
        const type = (item.type || "").toLowerCase();
        matchCategory = fabric.includes(target) || fit.includes(target) || type.includes(target);
      }

      let matchDrop = true;
      if (drop !== "All Drops") {
        const targetDrop = drop.toLowerCase().replace(/\s+/g, "");
        const itemDrop = (item.dropName || "").toLowerCase().replace(/\s+/g, "");
        matchDrop = itemDrop === targetDrop || itemDrop.includes(targetDrop);
      }

      return matchCategory && matchDrop;
    });

    // Sort products: In-stock items first, Out-of-stock items last
    return list.sort((a, b) => {
      const stockA = a.stock !== null && a.stock !== undefined ? Number(a.stock) : 10;
      const stockB = b.stock !== null && b.stock !== undefined ? Number(b.stock) : 10;

      const isOutA = stockA <= 0 ? 1 : 0;
      const isOutB = stockB <= 0 ? 1 : 0;

      return isOutA - isOutB;
    });
  }, [products, filter, drop]);

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col justify-between selection:bg-white selection:text-black">
      <div className="flex-1">
        {/* CHECKOUT */}
        {isCheckoutOpen ? (
          <CheckoutPage
            items={cart}
            onBack={() => setIsCheckoutOpen(false)}
            onOrderSuccess={() => setCart([])}
          />
        ) : selectedProduct ? (
          /* PRODUCT DETAILS */
          <>
            <Navbar cartCount={totalCartCount} onOpenBag={() => setIsBagOpen(true)} />
            <ProductPage
              product={selectedProduct}
              allProducts={products}
              onBack={() => setSelectedProduct(null)}
              onAddToCart={handleAddToCart}
              onBuyNow={handleDirectBuy}
              onSelectProduct={(p) => setSelectedProduct(p)}
            />
          </>
        ) : (
          /* HOME STORE */
          <>
            <Navbar cartCount={totalCartCount} onOpenBag={() => setIsBagOpen(true)} />
            
            {activeSliderSlides.length > 0 && <StackedSlider slides={activeSliderSlides} />}

            <FilterBar
              selectedFilter={filter}
              setFilter={setFilter}
              selectedDrop={drop}
              setDrop={setDrop}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-12">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-900">
                <div>
                  <h2 className="text-base sm:text-xl md:text-2xl font-serif font-black uppercase text-white tracking-wider">
                    {drop === "All Drops" ? "Current Collection" : drop}
                  </h2>
                  <p className="text-[10px] sm:text-xs text-neutral-400 mt-0.5 tracking-wide">
                    Showing <span className="text-white font-bold">{filteredProducts.length}</span> items
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="py-24 text-center text-xs tracking-widest text-neutral-500 font-serif uppercase animate-pulse">
                  Loading garments...
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-20 text-center border border-dashed border-neutral-800 rounded-2xl p-8 bg-neutral-950">
                  <h3 className="text-sm font-serif font-bold text-white mb-2 tracking-wide">No pieces found</h3>
                  <button
                    onClick={() => {
                      setFilter("All");
                      setDrop("All Drops");
                    }}
                    className="mt-2 px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider rounded hover:bg-neutral-200 transition cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
                  {filteredProducts.map((shirt) => (
                    <ProductCard
                      key={shirt?.id || Math.random()}
                      product={shirt}
                      onSelect={(p) => setSelectedProduct(p)}
                      onQuickBuy={(p) => handleDirectBuy(p)}
                    />
                  ))}
                </div>
              )}
            </main>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-neutral-900">
        <Footer />
      </div>

      {/* Bag Drawer */}
      <BagDrawer
        isOpen={isBagOpen}
        onClose={() => setIsBagOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleProceedToCheckout}
      />
    </div>
  );
}
import React, { useState, useEffect, useMemo } from "react";
import { Navbar } from "./components/customer/Navbar";
import { StackedSlider } from "./components/customer/StackedSlider";
import { FilterBar } from "./components/customer/FilterBar";
import { ProductCard } from "./components/customer/ProductCard";
import { ProductPage } from "./components/customer/ProductPage";
import { BagDrawer } from "./components/customer/BagDrawer";
import { CheckoutPage } from "./components/customer/CheckoutPage";
import { Footer } from "./components/customer/Footer";
import { FootwearChatbot } from "./components/customer/FootwearChatbot";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import {
  fetchProducts,
  getInitialProducts,
  getAdminProducts,
  subscribeToProductUpdates,
  fetchSlides,
  getInitialSlides,
  subscribeToSlideUpdates,
} from "./services/api";

export default function App() {
  // Single Source of Truth: Initialize products directly from synchronized storage
  const [products, setProducts] = useState(() => getInitialProducts());
  // Single Source of Truth: Initialize hero slides directly from synchronized storage
  const [banners, setBanners] = useState(() => getInitialSlides());
  const [filter, setFilter] = useState("All");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Admin Portal View State
  const [isAdminOpen, setIsAdminOpen] = useState(() => {
    return false;
  });

  // Listen to hash/history changes for direct /admin or #admin navigation
  useEffect(() => {
    const handleNavigationChange = () => {
      setIsAdminOpen(window.location.hash === "#admin" || window.location.pathname.startsWith("/admin"));
    };
    window.addEventListener("hashchange", handleNavigationChange);
    window.addEventListener("popstate", handleNavigationChange);
    return () => {
      window.removeEventListener("hashchange", handleNavigationChange);
      window.removeEventListener("popstate", handleNavigationChange);
    };
  }, []);

  // VAYRA FOOTWEAR Persistent Cart
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("vayra_footwear_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("vayra_footwear_cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Cart save error:", e);
    }
  }, [cart]);

  // LIVE SYNCHRONIZATION: Subscribe to BroadcastChannel and storage events
  useEffect(() => {
    // 1. Subscribe to live product updates across all tabs and components
    const unsubscribeProducts = subscribeToProductUpdates((updatedProducts) => {
      if (Array.isArray(updatedProducts)) {
        setProducts(updatedProducts);
      }
    });

    // 2. Subscribe to live hero slide updates across all tabs and components
    const unsubscribeSlides = subscribeToSlideUpdates((updatedSlides) => {
      if (Array.isArray(updatedSlides)) {
        setBanners(updatedSlides);
      }
    });

    // 3. Initial load from local cache, then fetch fresh data from MySQL backend
    setProducts(getInitialProducts());
    setBanners(getInitialSlides());

    fetchProducts().then((prods) => {
      if (Array.isArray(prods)) setProducts(prods);
    });
    fetchSlides().then((slides) => {
      if (Array.isArray(slides)) setBanners(slides);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeSlides();
    };
  }, []);

  const handleOpenAdmin = () => {
    window.location.hash = "admin";
    setIsAdminOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleExitAdmin = () => {
    setIsAdminOpen(false);
    if (window.location.hash === "#admin") {
      history.pushState(null, "", window.location.pathname);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddToCart = (productWithSize) => {
    const itemSize = productWithSize?.selectedSize || "UK 8";
    const itemKey = `${productWithSize?.id}-${itemSize}`;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => `${item.id}-${item.selectedSize || "UK 8"}` === itemKey
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
    const itemSize = productWithSize?.selectedSize || "UK 8";
    const itemKey = `${productWithSize?.id}-${itemSize}`;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => `${item.id}-${item.selectedSize || "UK 8"}` === itemKey
      );

      if (existingIndex > -1) return prevCart;
      return [...prevCart, { ...productWithSize, selectedSize: itemSize, quantity: 1 }];
    });

    setSelectedProductId(null);
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
        const currentKey = `${item.id}-${item.selectedSize || "UK 8"}`;
        return currentKey === itemKey ? { ...item, quantity: newQuantity } : item;
      })
    );
  };

  const handleRemoveItem = (itemKey) => {
    setCart((prev) =>
      prev.filter((item) => `${item.id}-${item.selectedSize || "UK 8"}` !== itemKey)
    );
  };

  const handleProceedToCheckout = () => {
    setIsBagOpen(false);
    setIsCheckoutOpen(true);
  };

  const totalCartCount = (cart || []).reduce((sum, item) => sum + (item.quantity || 1), 0);

  // Synchronized selected product resolution (always fresh from products array)
  const currentSelectedProduct = useMemo(() => {
    if (!selectedProductId) return null;
    const found = products.find((p) => String(p.id) === String(selectedProductId));
    // If deleted or marked inactive, gracefully dismiss product page
    if (!found || found.active === false || found.status === "INACTIVE") {
      return null;
    }
    return found;
  }, [selectedProductId, products]);

  // MAIN SLIDES: Directly controlled by Admin Slides (Single Source of Truth)
  const activeSliderSlides = useMemo(() => {
    const activeBanners = (banners || []).filter((b) => b && b.active !== false);
    if (activeBanners.length > 0) {
      return activeBanners.map((b, idx) => ({
        id: b.id || idx,
        title: b.heading || b.title || "VAYRA FOOTWEAR",
        subtitle: b.subtitle || "Step Into Your Style",
        tag: b.tagTitle || b.tag || "SIGNATURE COLLECTION",
        image: b.imageUrl || b.image || "",
        buttonText: b.buttonText || "",
        buttonLink: b.buttonLink || "",
        active: true,
      }));
    }

    const featuredProducts = (products || []).filter(
      (p) => p && p.active !== false && p.status !== "INACTIVE" && p.featured
    );
    if (featuredProducts.length > 0) {
      return featuredProducts.map((p, idx) => ({
        id: p.id || idx,
        title: p.name || "VAYRA FOOTWEAR",
        subtitle: `${p.upperMaterial || "Full-Grain Leather"} • ${p.soleType || "Cushioned Sole"}`,
        tag: "FEATURED SILHOUETTE",
        image: p.images?.[0] || p.image || "",
        buttonText: "Explore Silhouette",
        buttonLink: "#catalog",
        active: true,
      }));
    }

    return [];
  }, [banners, products]);

  // ACTIVE & CATEGORY FILTERING for Customer Store
  const filteredProducts = useMemo(() => {
    const list = (products || []).filter((item) => {
      if (!item) return false;

      // REQUIREMENT 4: ACTIVE / INACTIVE check
      // Inactive products are strictly hidden from the customer storefront
      const isActive = item.active !== false && item.status !== "INACTIVE";
      if (!isActive) return false;

      // CATEGORY FILTERING
      if (filter !== "All") {
        const target = filter.toLowerCase();
        const cat = (item.category || item.type || "").toLowerCase();
        if (target === "sandals/slides") {
          return cat.includes("sandal") || cat.includes("slide");
        }
        return cat === target || cat.includes(target);
      }

      return true;
    });

    // REQUIREMENT 6: STOCK SORTING
    // In-stock first, Out-of-stock last
    return list.sort((a, b) => {
      const stockA = a.stock !== null && a.stock !== undefined ? Number(a.stock) : 10;
      const stockB = b.stock !== null && b.stock !== undefined ? Number(b.stock) : 10;

      const isOutA = stockA <= 0 ? 1 : 0;
      const isOutB = stockB <= 0 ? 1 : 0;

      return isOutA - isOutB;
    });
  }, [products, filter]);

  // If Admin Portal is active, render the dedicated Admin Dashboard
  if (isAdminOpen) {
    return (
      <AdminDashboard
        onExit={handleExitAdmin}
        products={products}
        onProductsChange={(updatedProducts) => setProducts(updatedProducts)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col justify-between selection:bg-[#C5A059] selection:text-black">
      <div className="flex-1">
        {/* CHECKOUT */}
        {isCheckoutOpen ? (
          <CheckoutPage
            items={cart}
            onBack={() => setIsCheckoutOpen(false)}
            onOrderSuccess={() => setCart([])}
          />
        ) : currentSelectedProduct ? (
          /* FOOTWEAR DETAILS */
          <>
            <Navbar
              cartCount={totalCartCount}
              onOpenBag={() => setIsBagOpen(true)}
            />
            <ProductPage
              product={currentSelectedProduct}
              allProducts={products.filter((p) => p.active !== false && p.status !== "INACTIVE")}
              onBack={() => setSelectedProductId(null)}
              onAddToCart={handleAddToCart}
              onBuyNow={handleDirectBuy}
              onSelectProduct={(p) => setSelectedProductId(p?.id || null)}
            />
          </>
        ) : (
          /* HOME STORE */
          <>
            <Navbar
              cartCount={totalCartCount}
              onOpenBag={() => setIsBagOpen(true)}
            />
            
            {activeSliderSlides.length > 0 && <StackedSlider slides={activeSliderSlides} />}

            <div id="catalog">
              <FilterBar
                selectedFilter={filter}
                setFilter={setFilter}
              />
            </div>

            <main className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 py-6 md:py-12">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-900">
                <div>
                  <h2 className="text-base sm:text-xl md:text-2xl font-serif font-black uppercase text-white tracking-wider">
                    {filter === "All" ? "Current Footwear Collection" : `${filter} Collection`}
                  </h2>
                  <p className="text-[10px] sm:text-xs text-neutral-400 mt-1 tracking-wide">
                    Showing <span className="text-[#C5A059] font-bold font-mono">{filteredProducts.length}</span> luxury silhouettes
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="py-24 text-center text-xs tracking-widest text-neutral-500 font-serif uppercase animate-pulse">
                  Loading footwear collection...
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-20 text-center border border-dashed border-neutral-800 rounded-3xl p-8 bg-neutral-950">
                  {products.length === 0 ? (
                    <>
                      <h3 className="text-sm font-serif font-bold text-white mb-2 tracking-wide">
                        No footwear added yet
                      </h3>
                      <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                        Our latest luxury silhouettes are currently being curated. Check back soon for new arrivals.
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-sm font-serif font-bold text-white mb-2 tracking-wide">
                        No silhouettes found in this category
                      </h3>
                      <button
                        onClick={() => setFilter("All")}
                        className="mt-3 px-5 py-2.5 bg-[#F5F2EB] text-black text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#C5A059] transition cursor-pointer"
                      >
                        Reset Category Filter
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
                  {filteredProducts.map((shoe) => (
                    <ProductCard
                      key={shoe?.id || Math.random()}
                      product={shoe}
                      onSelect={(p) => setSelectedProductId(p?.id || null)}
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

      <FootwearChatbot />
    </div>
  );
}

import React, { useState, useEffect, useMemo } from "react";
import { 
  ArrowLeft, Star, ShoppingBag, Zap, ShieldCheck, 
  Truck, RefreshCw, ChevronRight, ChevronLeft, Check, X, MessageSquarePlus, Tag, AlertCircle, Compass, Footprints
} from "lucide-react";
import { ProductCard } from "./ProductCard";

export const ProductPage = ({ product, allProducts, onBack, onAddToCart, onBuyNow, onSelectProduct }) => {
  const defaultSizes = ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"];
  const availableSizes = product?.sizes && product.sizes.length > 0 ? product.sizes : defaultSizes;

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(availableSizes[2] || availableSizes[0] || "UK 8");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Stock parsing
  const stockCount = useMemo(() => {
    if (product?.stock === null || product?.stock === undefined || product?.stock === "") {
      return 10;
    }
    const parsed = Number(product.stock);
    return isNaN(parsed) ? 0 : parsed;
  }, [product?.stock]);

  const isOutOfStock = stockCount <= 0;
  const isLowStock = stockCount > 0 && stockCount <= 3;

  // Price calculations
  const finalPrice = Number(product?.price) || 3499;
  const originalPrice = Number(product?.originalPrice) || (product?.price ? Number(product.price) + 1200 : 4999);
  const discountPercent = Math.max(0, Math.round(((originalPrice - finalPrice) / originalPrice) * 100));
  const savingsAmount = Math.max(0, originalPrice - finalPrice);

  // Normalize image data
  const images = useMemo(() => {
    if (!product) return [];

    let list = [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      list = product.images;
    } else if (Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
      list = product.imageUrls;
    } else if (typeof product.image === "string" && product.image.trim()) {
      list = product.image.includes(",") ? product.image.split(",").map((s) => s.trim()) : [product.image];
    } else if (typeof product.imageUrl === "string" && product.imageUrl.trim()) {
      list = product.imageUrl.includes(",") ? product.imageUrl.split(",").map((s) => s.trim()) : [product.imageUrl];
    }

    const valid = list.filter((img) => typeof img === "string" && img.length > 0);
    return valid;
  }, [product]);

  // Auto-slide image timer
  useEffect(() => {
    if (images.length <= 1 || isOutOfStock) return;

    const timer = setInterval(() => {
      setSelectedImage((prev) => (prev + 1) % images.length);
    }, 3200);

    return () => clearInterval(timer);
  }, [images.length, isOutOfStock]);

  // VAYRA FOOTWEAR Reviews State (persisted per product)
  const [reviews, setReviews] = useState(() => {
    try {
      const saved = localStorage.getItem(`vayra_footwear_reviews_${product?.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [reviewerName, setReviewerName] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setSelectedImage(0);
    setSelectedSize(availableSizes[2] || availableSizes[0] || "UK 8");

    try {
      const saved = localStorage.getItem(`vayra_footwear_reviews_${product?.id}`);
      setReviews(saved ? JSON.parse(saved) : []);
    } catch {
      setReviews([]);
    }
  }, [product]);

  useEffect(() => {
    if (product?.id) {
      try {
        localStorage.setItem(`vayra_footwear_reviews_${product?.id}`, JSON.stringify(reviews));
      } catch (e) {
        console.error(e);
      }
    }
  }, [reviews, product?.id]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return (Number(product?.rating) || 4.9).toFixed(1);
    const sum = reviews.reduce((acc, curr) => acc + (Number(curr.rating) || 5), 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews, product?.rating]);

  const totalReviewsCount = reviews.length;

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) return;

    const newEntry = {
      id: Date.now(),
      name: reviewerName.trim(),
      rating: reviewRating,
      comment: reviewComment.trim(),
      date: "Verified Buyer • Just now",
    };

    setReviews([newEntry, ...reviews]);
    setReviewerName("");
    setReviewComment("");
    setReviewRating(5);
    setShowSuccessToast(true);

    setTimeout(() => {
      setShowSuccessToast(false);
      setIsReviewModalOpen(false);
    }, 1200);
  };

  if (!product) return null;

  const suggestedProducts = (allProducts || [])
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const upperMaterial = product.upperMaterial || product.material || "Full-Grain Leather";
  const soleType = product.soleType || product.sole || "Cushioned EVA Cupsole";
  const insole = product.insole || "High-Density Ortho-Memory Bed";
  const fitNote = product.fit || "True to UK Size";
  const careNote = product.care || "Clean with soft cloth and condition with natural leather cream.";

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-24 selection:bg-[#C5A059] selection:text-black relative">
      
      {/* Top Breadcrumb Bar */}
      <div className="border-b border-neutral-900 bg-[#050505]/95 backdrop-blur-md sticky top-[57px] sm:top-[65px] z-30 px-3 sm:px-8 py-2.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[11px] sm:text-xs uppercase font-bold text-neutral-400 hover:text-white transition tracking-wider cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Catalog
          </button>
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-neutral-400 font-medium truncate max-w-[240px]">
            <span className="text-[#C5A059]">{product.category || "Footwear"}</span>
            <ChevronRight size={10} />
            <span className="text-white font-semibold truncate">{product.name}</span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
          
          {/* Main Footwear Imagery */}
          <div className="lg:col-span-6">
            <div className="group relative aspect-[4/5] rounded-3xl overflow-hidden bg-neutral-950 border border-neutral-900 select-none shadow-2xl">
              {images.length > 0 ? (
                <img
                  src={images[selectedImage] || images[0]}
                  alt={`${product.name} - View ${selectedImage + 1}`}
                  className={`w-full h-full object-cover transition-all duration-500 ${
                    isOutOfStock ? "grayscale opacity-40" : ""
                  }`}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-950 text-neutral-500">
                  <span className="font-serif font-black tracking-widest text-lg text-neutral-400">VAYRA</span>
                  <span className="text-xs font-mono tracking-widest uppercase mt-1 text-neutral-600">No Image Uploaded</span>
                </div>
              )}

              {/* Category Badge */}
              <span className="absolute top-4 left-4 bg-black/85 backdrop-blur-md px-3 py-1 rounded-lg text-[9px] font-bold tracking-widest uppercase font-mono border border-neutral-800 text-[#C5A059] z-10 pointer-events-none">
                {product.category || "Footwear"}
              </span>

              {/* Out of Stock Overlay Ribbon */}
              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-[2px] z-10 pointer-events-none">
                  <span className="bg-red-700/90 text-white text-xs sm:text-sm font-black uppercase px-5 py-2 rounded-xl tracking-widest border border-red-600 shadow-2xl">
                    Sold Out
                  </span>
                </div>
              )}

              {/* Photo Counter */}
              {images.length > 1 && !isOutOfStock && (
                <span className="absolute top-4 right-4 bg-black/85 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono text-neutral-300 border border-neutral-800 z-10 pointer-events-none">
                  {selectedImage + 1} / {images.length}
                </span>
              )}

              {/* Nav Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/75 hover:bg-black text-neutral-300 hover:text-white border border-neutral-800 backdrop-blur-md transition-all cursor-pointer z-20 active:scale-90"
                    aria-label="Previous View"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/75 hover:bg-black text-neutral-300 hover:text-white border border-neutral-800 backdrop-blur-md transition-all cursor-pointer z-20 active:scale-90"
                    aria-label="Next View"
                  >
                    <ChevronRight size={20} />
                  </button>

                  {/* Indicator Dots */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-1.5 z-20 pointer-events-none">
                    {images.map((_, dotIdx) => (
                      <span
                        key={dotIdx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          selectedImage === dotIdx 
                            ? "w-6 bg-[#C5A059]" 
                            : "w-1.5 bg-neutral-600/80"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Preview Strip */}
            {images.length > 1 && (
              <div className="flex gap-2.5 mt-3 overflow-x-auto pb-1 scrollbar-none">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(idx)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border transition-all cursor-pointer shrink-0 ${
                      selectedImage === idx
                        ? "border-[#C5A059] ring-2 ring-[#C5A059]/40 scale-105"
                        : "border-neutral-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Purchasing */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              {/* Material & Silhouette Bar */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] sm:text-xs uppercase tracking-widest text-[#C5A059] font-bold">
                  {upperMaterial}
                </span>
                <span className="text-neutral-700">•</span>
                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-300 font-semibold">
                  {soleType}
                </span>
              </div>

              {/* Footwear Title */}
              <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-black uppercase tracking-wide text-white mb-2 leading-tight">
                {product.name}
              </h1>

              {/* Rating & Review Modal Trigger */}
              <div className="flex items-center gap-2.5 mb-3">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-2.5 py-1 rounded-full transition cursor-pointer active:scale-95"
                >
                  <Star size={11} className="fill-[#C5A059] text-[#C5A059]" />
                  <span className="text-xs font-bold text-white">{averageRating}</span>
                  <span className="text-[10px] text-neutral-400">
                    ({totalReviewsCount})
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#C5A059] hover:text-white font-semibold underline underline-offset-4 transition cursor-pointer"
                >
                  Write Review
                </button>
              </div>

              {/* Price & Savings Pill */}
              <div className="p-3 sm:p-4 bg-neutral-950 border border-neutral-900 rounded-2xl mb-4 flex flex-wrap items-center justify-between gap-2 shadow-inner">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-xs sm:text-sm text-neutral-500 line-through font-normal">
                    ₹{originalPrice.toLocaleString("en-IN")}
                  </span>
                  <span className="text-lg sm:text-2xl font-serif font-black text-white tracking-tight">
                    ₹{finalPrice.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-neutral-500">
                    (Incl. All Taxes)
                  </span>
                </div>

                {discountPercent > 0 && (
                  <div className="flex items-center gap-1.5 bg-[#C5A059]/15 border border-[#C5A059]/40 px-2.5 py-1 rounded-lg">
                    <Tag size={12} className="text-[#C5A059]" />
                    <span className="text-[10px] sm:text-xs font-bold text-[#F5F2EB] uppercase tracking-wider">
                      {discountPercent}% OFF (Save ₹{savingsAmount.toLocaleString("en-IN")})
                    </span>
                  </div>
                )}
              </div>

              {/* Stock Urgency */}
              {isOutOfStock ? (
                <div className="mb-5 px-3.5 py-2.5 bg-red-950/40 border border-red-800/80 rounded-xl flex items-center justify-between text-red-300 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={15} className="text-red-400 shrink-0" />
                    <span>Currently out of stock in this silhouette</span>
                  </div>
                  <span className="text-[10px] text-red-400/90 uppercase tracking-wider font-mono">Restocking Soon</span>
                </div>
              ) : isLowStock ? (
                <div className="mb-5 px-3.5 py-2.5 bg-amber-950/40 border border-amber-700/80 rounded-xl flex items-center justify-between text-amber-300 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                    <span>Hurry, only {stockCount} pairs left in inventory!</span>
                  </div>
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest font-mono">High Demand</span>
                </div>
              ) : (
                <div className="mb-4 text-[11px] text-neutral-400 flex items-center gap-2 pl-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>In Stock • Dispatches in 24 hours</span>
                </div>
              )}

              {/* UK / India Footwear Sizing */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs uppercase tracking-widest font-bold text-white flex items-center gap-1.5">
                    <Footprints size={14} className="text-[#C5A059]" /> Select Size (UK / India)
                  </span>
                  <span className="text-[10px] text-[#C5A059] font-mono">
                    {fitNote}
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {availableSizes.map((sz) => (
                    <button
                      key={sz}
                      disabled={isOutOfStock}
                      onClick={() => setSelectedSize(sz)}
                      className={`h-11 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center font-mono ${
                        isOutOfStock 
                          ? "bg-neutral-900 text-neutral-600 border border-neutral-800 cursor-not-allowed" 
                          : selectedSize === sz
                          ? "bg-[#F5F2EB] text-black scale-105 shadow-lg border border-white cursor-pointer active:scale-95"
                          : "bg-neutral-950 text-neutral-300 border border-neutral-800 hover:border-[#C5A059]/60 cursor-pointer active:scale-95"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Footwear Architecture Specs */}
              <div className="mb-6 bg-neutral-950/80 border border-neutral-900 rounded-2xl p-4 space-y-3">
                <h3 className="text-xs uppercase tracking-widest font-bold text-white flex items-center gap-1.5">
                  <Compass size={13} className="text-[#C5A059]" /> Footwear Specifications
                </h3>

                <p className="text-xs text-neutral-300 font-light leading-relaxed">
                  {product.description || "Crafted with precision-lasted patterns, architectural soles, and glove-soft premium leathers engineered for everyday luxury and durability."}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 bg-neutral-900/60 rounded-xl border border-neutral-800/80 text-[11px]">
                    <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-bold block mb-0.5 font-mono">Upper Construction</span>
                    <span className="text-white font-medium">{upperMaterial}</span>
                  </div>
                  <div className="p-2.5 bg-neutral-900/60 rounded-xl border border-neutral-800/80 text-[11px]">
                    <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-bold block mb-0.5 font-mono">Sole System</span>
                    <span className="text-white font-medium">{soleType}</span>
                  </div>
                  <div className="p-2.5 bg-neutral-900/60 rounded-xl border border-neutral-800/80 text-[11px]">
                    <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-bold block mb-0.5 font-mono">Insole Comfort</span>
                    <span className="text-white font-medium">{insole}</span>
                  </div>
                  <div className="p-2.5 bg-neutral-900/60 rounded-xl border border-neutral-800/80 text-[11px]">
                    <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-bold block mb-0.5 font-mono">Care Protocol</span>
                    <span className="text-white font-medium">{careNote}</span>
                  </div>
                </div>

                {product.details && product.details.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-neutral-900">
                    {product.details.map((bullet, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-neutral-300">
                        <Check size={12} className="text-[#C5A059] shrink-0" />
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons & Brand Guarantees */}
            <div className="pt-3 border-t border-neutral-900">
              <div className="flex gap-3 mb-4">
                <button
                  disabled={isOutOfStock}
                  onClick={() => onAddToCart({ ...product, selectedSize })}
                  className={`flex-1 py-3.5 px-3 rounded-2xl text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition-all ${
                    isOutOfStock
                      ? "bg-neutral-900 text-neutral-600 border border-neutral-800 cursor-not-allowed"
                      : "bg-neutral-950 text-white border border-neutral-800 hover:border-[#C5A059] active:scale-95 cursor-pointer shadow-lg"
                  }`}
                >
                  <ShoppingBag size={15} />
                  {isOutOfStock ? "Out of Stock" : `Add to Bag (${selectedSize})`}
                </button>

                <button
                  disabled={isOutOfStock}
                  onClick={() => onBuyNow({ ...product, selectedSize })}
                  className={`flex-1 py-3.5 px-3 rounded-2xl text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition-all ${
                    isOutOfStock
                      ? "bg-neutral-900 text-neutral-600 border border-neutral-800 cursor-not-allowed"
                      : "bg-[#F5F2EB] text-black hover:bg-[#C5A059] active:scale-95 cursor-pointer shadow-xl font-black"
                  }`}
                >
                  <Zap size={15} className={isOutOfStock ? "fill-neutral-600" : "fill-black"} />
                  {isOutOfStock ? "Unavailable" : "Instant Buy UPI"}
                </button>
              </div>

              {/* 3 Trust Pillars */}
              <div className="grid grid-cols-3 gap-2 text-[10px] text-neutral-400 text-center">
                <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-900 flex flex-col items-center gap-1">
                  <Truck size={14} className="text-[#C5A059]" />
                  <span className="font-semibold text-neutral-200">Express Shipping</span>
                  <span className="text-[8px] text-neutral-500 font-mono">Pan-India Free</span>
                </div>
                <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-900 flex flex-col items-center gap-1">
                  <RefreshCw size={14} className="text-[#C5A059]" />
                  <span className="font-semibold text-neutral-200">7-Day Exchange</span>
                  <span className="text-[8px] text-neutral-500 font-mono">Hassle-Free Size Swap</span>
                </div>
                <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-900 flex flex-col items-center gap-1">
                  <ShieldCheck size={14} className="text-[#C5A059]" />
                  <span className="font-semibold text-neutral-200">Authentic Build</span>
                  <span className="text-[8px] text-neutral-500 font-mono">Handcrafted Luxury</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* You Might Also Like */}
        {suggestedProducts.length > 0 && (
          <section className="mt-16 pt-10 border-t border-neutral-900">
            <h2 className="text-base sm:text-xl font-serif font-black uppercase text-white mb-6 tracking-wide">
              Complete Your Stride • More Footwear
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {suggestedProducts.map((shoe) => (
                <ProductCard
                  key={shoe.id}
                  product={shoe}
                  onSelect={(p) => onSelectProduct(p)}
                  onQuickBuy={(p) => onBuyNow(p)}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Customer Reviews Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0c0c0c] border border-neutral-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-900 bg-neutral-900/40">
              <div>
                <h3 className="font-serif font-black text-base uppercase text-white tracking-wide">
                  Patron Reviews & Feedback
                </h3>
                <p className="text-xs text-[#C5A059]">
                  {product.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              
              {/* Rating Summary Bar */}
              <div className="flex items-center justify-between p-4 bg-neutral-900/50 border border-neutral-800 rounded-2xl">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-serif font-black text-white">
                      {averageRating}
                    </span>
                    <span className="text-xs text-neutral-400 font-bold">/ 5.0</span>
                  </div>
                  <span className="text-[10px] text-neutral-400">
                    Calculated from {totalReviewsCount} {totalReviewsCount === 1 ? "verified patron rating" : "verified patron ratings"}
                  </span>
                </div>
                <div className="flex text-[#C5A059]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={star <= Math.round(Number(averageRating)) ? "fill-[#C5A059]" : "text-neutral-700"}
                    />
                  ))}
                </div>
              </div>

              {/* Add Review Form */}
              <div className="bg-neutral-900/30 p-5 rounded-2xl border border-neutral-800">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquarePlus size={16} className="text-[#C5A059]" />
                  <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-white">
                    Rate Your Footwear Experience
                  </h4>
                </div>

                <form onSubmit={handleAddReview} className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Select Rating
                    </label>
                    <div className="flex items-center gap-1.5 py-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setReviewRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="cursor-pointer p-0.5 transition-transform hover:scale-110 active:scale-95"
                        >
                          <Star
                            size={20}
                            className={`${
                              star <= (hoverRating || reviewRating)
                                ? "fill-[#C5A059] text-[#C5A059]"
                                : "text-neutral-700"
                            } transition-colors`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-xs font-mono font-bold text-white">
                        {hoverRating || reviewRating} / 5 Stars
                      </span>
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Your Name"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      className="w-full bg-black border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <div>
                    <textarea
                      required
                      rows={2}
                      placeholder="Share feedback on comfort, sole cushioning, leather grain, arch support, or sizing..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full bg-black border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#C5A059] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#F5F2EB] text-black rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#C5A059] transition-all active:scale-95 cursor-pointer shadow-lg"
                  >
                    Submit Review
                  </button>

                  {showSuccessToast && (
                    <p className="text-xs text-[#C5A059] bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-center font-medium">
                      Thank you! Your verified footwear review has been posted.
                    </p>
                  )}
                </form>
              </div>

              {/* Feed of Reviews */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2.5 px-1 font-mono">
                  Patron Reviews ({reviews.length})
                </h4>

                {reviews.length === 0 ? (
                  <div className="py-8 px-4 text-center bg-neutral-900/20 border border-dashed border-neutral-800 rounded-2xl">
                    <p className="text-xs text-neutral-500">
                      No customer reviews yet. Be the first patron to step out in this silhouette!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                    {reviews.map((rev) => (
                      <div key={rev.id || Math.random()} className="p-3.5 bg-neutral-900/40 border border-neutral-800/80 rounded-xl">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white">{rev.name}</span>
                          <div className="flex text-[#C5A059]">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={10}
                                className={s <= rev.rating ? "fill-[#C5A059]" : "text-neutral-700"}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-neutral-300 font-light leading-relaxed">
                          "{rev.comment}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
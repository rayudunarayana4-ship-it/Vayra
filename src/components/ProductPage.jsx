import React, { useState, useEffect, useMemo } from "react";
import { 
  ArrowLeft, Star, ShoppingBag, Zap, ShieldCheck, 
  Truck, RefreshCw, ChevronRight, ChevronLeft, Check, X, MessageSquarePlus, Tag, AlertCircle
} from "lucide-react";
import { ProductCard } from "./ProductCard";

export const ProductPage = ({ product, allProducts, onBack, onAddToCart, onBuyNow, onSelectProduct }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || "M");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Critical stock parsing: Prevents 0 from defaulting to 10
  const stockCount = useMemo(() => {
    if (product?.stock === null || product?.stock === undefined || product?.stock === "") {
      return 10;
    }
    const parsed = Number(product.stock);
    return isNaN(parsed) ? 0 : parsed;
  }, [product?.stock]);

  const isOutOfStock = stockCount <= 0;
  const isLowStock = stockCount > 0 && stockCount <= 3;

  // Dynamic price & discount calculation
  const finalPrice = Number(product?.price) || 2499;
  const originalPrice = Number(product?.originalPrice) || (product?.price ? Number(product.price) + 800 : 3299);
  const discountPercent = Math.max(0, Math.round(((originalPrice - finalPrice) / originalPrice) * 100));
  const savingsAmount = Math.max(0, originalPrice - finalPrice);

  // Normalize image data from any API format
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
    return valid.length > 0
      ? valid
      : ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80"];
  }, [product]);

  // Auto-slide images every 3 seconds (pauses when out of stock or only 1 image)
  useEffect(() => {
    if (images.length <= 1 || isOutOfStock) return;

    const timer = setInterval(() => {
      setSelectedImage((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [images.length, isOutOfStock]);

  // Reviews state with localStorage persistence per product
  const [reviews, setReviews] = useState(() => {
    try {
      const saved = localStorage.getItem(`two_brothers_reviews_${product?.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal review form states
  const [reviewerName, setReviewerName] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setSelectedImage(0);
    setSelectedSize(product?.sizes?.[0] || "M");

    try {
      const saved = localStorage.getItem(`two_brothers_reviews_${product?.id}`);
      setReviews(saved ? JSON.parse(saved) : []);
    } catch {
      setReviews([]);
    }
  }, [product]);

  useEffect(() => {
    if (product?.id) {
      try {
        localStorage.setItem(`two_brothers_reviews_${product?.id}`, JSON.stringify(reviews));
      } catch (e) {
        console.error(e);
      }
    }
  }, [reviews, product?.id]);

  // Dynamic rating calculation
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return (product?.rating || 4.8).toFixed(1);
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
      date: "Just now",
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

  const sizes = product.sizes && product.sizes.length > 0 
    ? product.sizes 
    : ["S", "M", "L", "XL", "XXL"];

  const suggestedProducts = (allProducts || [])
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-20 selection:bg-white selection:text-black relative">
      
      {/* Top Bar */}
      <div className="border-b border-neutral-900 bg-black/90 backdrop-blur-md sticky top-[48px] sm:top-[65px] z-30 px-3 sm:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[11px] sm:text-xs uppercase font-bold text-neutral-400 hover:text-white transition tracking-wider cursor-pointer"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-neutral-500 font-medium truncate max-w-[200px]">
            <span>{product.dropName || "Drop 1"}</span>
            <ChevronRight size={10} />
            <span className="text-white font-semibold truncate">{product.name}</span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-12">
          
          {/* Main Photo Card */}
          <div className="lg:col-span-6">
            <div className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-900 select-none">
              <img
                src={images[selectedImage] || images[0]}
                alt={`${product.name} - View ${selectedImage + 1}`}
                className={`w-full h-full object-cover transition-all duration-500 ${
                  isOutOfStock ? "grayscale opacity-40" : ""
                }`}
              />

              {/* Drop Badge */}
              <span className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded text-[9px] font-bold tracking-widest uppercase border border-neutral-800 text-white z-10 pointer-events-none">
                {product.dropName || "Drop 1"}
              </span>

              {/* Out of Stock Ribbon on Image */}
              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px] z-10 pointer-events-none">
                  <span className="bg-red-600/90 text-white text-xs sm:text-sm font-black uppercase px-4 py-1.5 rounded-lg tracking-widest border border-red-500 shadow-2xl">
                    Sold Out
                  </span>
                </div>
              )}

              {/* Counter Badge */}
              {images.length > 1 && !isOutOfStock && (
                <span className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-mono text-neutral-300 border border-neutral-800 z-10 pointer-events-none">
                  {selectedImage + 1}/{images.length}
                </span>
              )}

              {/* Tap Arrow Controls directly on photo */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/70 hover:bg-black text-neutral-300 hover:text-white border border-neutral-800 backdrop-blur-sm transition-all cursor-pointer z-20 active:scale-90"
                    aria-label="Previous Photo"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/70 hover:bg-black text-neutral-300 hover:text-white border border-neutral-800 backdrop-blur-sm transition-all cursor-pointer z-20 active:scale-90"
                    aria-label="Next Photo"
                  >
                    <ChevronRight size={20} />
                  </button>

                  {/* Navigation Dots Indicator */}
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center items-center gap-1.5 z-20 pointer-events-none">
                    {images.map((_, dotIdx) => (
                      <span
                        key={dotIdx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          selectedImage === dotIdx 
                            ? "w-5 bg-white" 
                            : "w-1.5 bg-neutral-600/70"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1 sm:mb-2">
                <span className="text-[9px] sm:text-[11px] uppercase tracking-wider text-neutral-400 font-bold">
                  {product.fabric || "100% Cotton"} • {product.gsm || "240 GSM"}
                </span>
                <span className="text-neutral-700">•</span>
                <span className="text-[9px] sm:text-[11px] uppercase tracking-wider text-neutral-300 font-semibold">
                  {product.fit || "Boxy Fit"}
                </span>
              </div>

              {/* Garment Title */}
              <h1 className="text-base sm:text-lg md:text-xl font-serif font-bold uppercase tracking-wide text-white mb-1.5 leading-snug">
                {product.name}
              </h1>

              {/* Rating Header */}
              <div className="flex items-center gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="flex items-center gap-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-2 py-0.5 rounded-full transition cursor-pointer active:scale-95"
                >
                  <Star size={10} className="fill-white text-white" />
                  <span className="text-[10px] font-bold text-white">{averageRating}</span>
                  <span className="text-[9px] text-neutral-400 ml-0.5">
                    ({totalReviewsCount})
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="text-[9px] sm:text-[10px] uppercase tracking-wider text-neutral-400 hover:text-white font-semibold underline underline-offset-2 transition cursor-pointer"
                >
                  Write Review
                </button>
              </div>

              {/* Price & Discount Bar */}
              <div className="p-2.5 sm:p-3 bg-neutral-950 border border-neutral-900 rounded-xl mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs sm:text-sm text-red-400/80 line-through font-normal">
                    ₹{originalPrice.toLocaleString("en-IN")}
                  </span>
                  <span className="text-base sm:text-lg font-serif font-bold text-emerald-400 tracking-tight">
                    ₹{finalPrice.toLocaleString("en-IN")}
                  </span>
                </div>

                {discountPercent > 0 && (
                  <div className="flex items-center gap-1 bg-emerald-950/50 border border-emerald-800/50 px-2 py-0.5 rounded-md">
                    <Tag size={10} className="text-emerald-400" />
                    <span className="text-[9px] sm:text-[10px] font-medium text-emerald-300 uppercase tracking-wider">
                      {discountPercent}% OFF (Save ₹{savingsAmount.toLocaleString("en-IN")})
                    </span>
                  </div>
                )}
              </div>

              {/* Stock Alert Banner (Count ONLY displayed when <= 3) */}
              {isOutOfStock ? (
                <div className="mb-4 px-3 py-2 bg-red-950/40 border border-red-800/80 rounded-xl flex items-center justify-between text-red-300 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={14} className="text-red-400 shrink-0" />
                    <span>Currently out of stock</span>
                  </div>
                  <span className="text-[10px] text-red-400/80 uppercase tracking-wider">Restocking soon</span>
                </div>
              ) : isLowStock ? (
                <div className="mb-4 px-3 py-2 bg-amber-950/40 border border-amber-700/80 rounded-xl flex items-center justify-between text-amber-300 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                    <span>Hurry, only {stockCount} left in stock!</span>
                  </div>
                  <span className="text-[10px] text-amber-400/90 font-bold uppercase tracking-wider">High Demand</span>
                </div>
              ) : (
                <div className="mb-4 text-[11px] text-neutral-400 flex items-center gap-1.5 pl-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>In Stock • Ready to ship</span>
                </div>
              )}

              {/* Sizes */}
              <div className="mb-4 sm:mb-6">
                <span className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-white block mb-2">
                  Select Size
                </span>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((sz) => (
                    <button
                      key={sz}
                      disabled={isOutOfStock}
                      onClick={() => setSelectedSize(sz)}
                      className={`min-w-[42px] sm:min-w-[50px] h-10 sm:h-11 rounded-lg text-xs font-bold uppercase transition-all flex items-center justify-center ${
                        isOutOfStock 
                          ? "bg-neutral-900 text-neutral-600 border border-neutral-800/50 cursor-not-allowed" 
                          : selectedSize === sz
                          ? "bg-white text-black scale-105 cursor-pointer active:scale-95"
                          : "bg-neutral-950 text-neutral-300 border border-neutral-800 hover:border-neutral-600 cursor-pointer active:scale-95"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Garment Details */}
              <div className="mb-4">
                <h3 className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-neutral-400 mb-1.5">
                  Garment Details
                </h3>
                <p className="text-xs text-neutral-300 font-light leading-relaxed mb-3">
                  {product.description || "Crafted with pure heavyweight cotton drape tailored for everyday luxury."}
                </p>

                {product.details && product.details.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {product.details.map((item, i) => (
                      <div key={i} className="flex items-center gap-1.5 p-2 bg-neutral-950 border border-neutral-900 rounded text-[11px] text-neutral-300">
                        <Check size={12} className="text-white shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons & Badges */}
            <div className="pt-2 sm:pt-4 border-t border-neutral-900">
              <div className="flex gap-2.5 mb-3">
                <button
                  disabled={isOutOfStock}
                  onClick={() => onAddToCart({ ...product, selectedSize })}
                  className={`flex-1 py-3 px-2 rounded-xl text-[11px] sm:text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-1.5 transition ${
                    isOutOfStock
                      ? "bg-neutral-900 text-neutral-600 border border-neutral-800 cursor-not-allowed"
                      : "bg-neutral-950 text-white border border-neutral-800 hover:border-neutral-600 active:scale-95 cursor-pointer"
                  }`}
                >
                  <ShoppingBag size={14} />
                  {isOutOfStock ? "Out of Stock" : "Add to Bag"}
                </button>
                <button
                  disabled={isOutOfStock}
                  onClick={() => onBuyNow({ ...product, selectedSize })}
                  className={`flex-1 py-3 px-2 rounded-xl text-[11px] sm:text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-1.5 transition ${
                    isOutOfStock
                      ? "bg-neutral-900 text-neutral-600 border border-neutral-800 cursor-not-allowed"
                      : "bg-white text-black hover:bg-neutral-200 active:scale-95 cursor-pointer"
                  }`}
                >
                  <Zap size={14} className={isOutOfStock ? "fill-neutral-600" : "fill-black"} />
                  {isOutOfStock ? "Unavailable" : "Buy UPI"}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1.5 text-[9px] text-neutral-400 text-center">
                <div className="p-2 bg-neutral-950 rounded-lg border border-neutral-900 flex flex-col items-center gap-0.5">
                  <Truck size={12} className="text-white" />
                  <span className="font-semibold text-neutral-300">Free Ship</span>
                </div>
                <div className="p-2 bg-neutral-950 rounded-lg border border-neutral-900 flex flex-col items-center gap-0.5">
                  <RefreshCw size={12} className="text-white" />
                  <span className="font-semibold text-neutral-300">7-Day Return</span>
                </div>
                <div className="p-2 bg-neutral-950 rounded-lg border border-neutral-900 flex flex-col items-center gap-0.5">
                  <ShieldCheck size={12} className="text-white" />
                  <span className="font-semibold text-neutral-300">100% Cotton</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Suggested Pieces */}
        {suggestedProducts.length > 0 && (
          <section className="mt-14 pt-8 border-t border-neutral-900">
            <h2 className="text-base sm:text-lg font-serif font-black uppercase text-white mb-4">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {suggestedProducts.map((shirt) => (
                <ProductCard
                  key={shirt.id}
                  product={shirt}
                  onSelect={(p) => onSelectProduct(p)}
                  onQuickBuy={(p) => onBuyNow(p)}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Reviews Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-neutral-950 border border-neutral-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-900 bg-neutral-900/60">
              <div>
                <h3 className="font-serif font-black text-base uppercase text-white tracking-wide">
                  Customer Ratings & Feedback
                </h3>
                <p className="text-[11px] text-neutral-400">
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
            <div className="p-5 overflow-y-auto space-y-5">
              
              {/* Rating Summary Bar */}
              <div className="flex items-center justify-between p-3.5 bg-neutral-900/40 border border-neutral-800 rounded-2xl">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-serif font-black text-white">
                      {averageRating}
                    </span>
                    <span className="text-xs text-neutral-400 font-bold">/ 5.0</span>
                  </div>
                  <span className="text-[10px] text-neutral-400">
                    Based on {totalReviewsCount} {totalReviewsCount === 1 ? "rating" : "ratings"}
                  </span>
                </div>
                <div className="flex text-white">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={14}
                      className={star <= Math.round(Number(averageRating)) ? "fill-white" : "text-neutral-700"}
                    />
                  ))}
                </div>
              </div>

              {/* Add Review Form */}
              <div className="bg-neutral-900/30 p-4 rounded-2xl border border-neutral-800">
                <div className="flex items-center gap-1.5 mb-3">
                  <MessageSquarePlus size={15} className="text-white" />
                  <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-white">
                    Leave a Rating
                  </h4>
                </div>

                <form onSubmit={handleAddReview} className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      Tap to Rate
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
                            size={18}
                            className={`${
                              star <= (hoverRating || reviewRating)
                                ? "fill-white text-white"
                                : "text-neutral-700"
                            } transition-colors`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-xs font-serif font-bold text-white">
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
                      className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-500"
                    />
                  </div>

                  <div>
                    <textarea
                      required
                      rows={2}
                      placeholder="Share your experience (fabric quality, drape, or fit)..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-white text-black rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition active:scale-95 cursor-pointer"
                  >
                    Submit Review
                  </button>

                  {showSuccessToast && (
                    <p className="text-[10px] text-white bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-center font-medium">
                      Thank you! Your rating has been calculated.
                    </p>
                  )}
                </form>
              </div>

              {/* Feed of Reviews */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2 px-1">
                  Recent Patron Feedback
                </h4>

                {reviews.length === 0 ? (
                  <div className="py-6 px-4 text-center bg-neutral-900/20 border border-dashed border-neutral-800 rounded-2xl">
                    <p className="text-xs text-neutral-500">
                      No reviews submitted yet. Be the first to share your thoughts!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {reviews.map((rev) => (
                      <div key={rev.id || Math.random()} className="p-3 bg-neutral-900/40 border border-neutral-800/80 rounded-xl">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white">{rev.name}</span>
                          <div className="flex text-white">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={9}
                                className={s <= rev.rating ? "fill-white text-white" : "text-neutral-700"}
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
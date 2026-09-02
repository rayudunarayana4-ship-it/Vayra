import React, { useState, useEffect, useMemo } from "react";
import { 
  ArrowLeft, Star, ShoppingBag, Zap, ShieldCheck, 
  Truck, RefreshCw, ChevronRight, ChevronLeft, Check, MessageSquarePlus 
} from "lucide-react";
import { ProductCard } from "./ProductCard";

export const ProductPage = ({ product, allProducts, onBack, onAddToCart, onBuyNow, onSelectProduct }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || "M");

  // Normalize image data from any API format (array, single string, imageUrls, comma-separated)
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

    // Filter out invalid items
    const valid = list.filter((img) => typeof img === "string" && img.length > 0);
    return valid.length > 0
      ? valid
      : ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80"];
  }, [product]);

  // Robust 3-second auto-slide interval
  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setSelectedImage((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [images]);

  // Dynamic reviews state
  const [reviews, setReviews] = useState(() => {
    try {
      const saved = localStorage.getItem(`two_brothers_reviews_${product?.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [reviewerName, setReviewerName] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [formSubmitted, setFormSubmitted] = useState(false);

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
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 4000);
  };

  if (!product) return null;

  const sizes = product.sizes && product.sizes.length > 0 
    ? product.sizes 
    : ["S", "M", "L", "XL", "XXL"];

  const suggestedProducts = (allProducts || [])
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-20 selection:bg-white selection:text-black">
      
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
          
          {/* Main Card Image with 3-sec Auto-slide & Navigation Arrows */}
          <div className="lg:col-span-6">
            <div className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-900 select-none">
              <img
                src={images[selectedImage] || images[0]}
                alt={`${product.name} - View ${selectedImage + 1}`}
                className="w-full h-full object-cover transition-opacity duration-500"
              />

              {/* Drop Badge */}
              <span className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded text-[9px] font-bold tracking-widest uppercase border border-neutral-800 text-white z-10 pointer-events-none">
                {product.dropName || "Drop 1"}
              </span>

              {/* Arrow Controls (Active when 2 or more images exist) */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-black text-neutral-300 hover:text-white border border-neutral-700 backdrop-blur-sm transition cursor-pointer z-20 active:scale-95"
                    aria-label="Previous Image"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-black text-neutral-300 hover:text-white border border-neutral-700 backdrop-blur-sm transition cursor-pointer z-20 active:scale-95"
                    aria-label="Next Image"
                  >
                    <ChevronRight size={20} />
                  </button>

                  {/* Navigation Indicator Dots */}
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center items-center gap-1.5 z-20">
                    {images.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImage(dotIdx);
                        }}
                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                          selectedImage === dotIdx 
                            ? "w-5 bg-white" 
                            : "w-1.5 bg-neutral-600 hover:bg-neutral-400"
                        }`}
                        aria-label={`Go to image ${dotIdx + 1}`}
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

              <h1 className="text-xl sm:text-3xl font-serif font-black uppercase tracking-wide text-white mb-2 leading-tight">
                {product.name}
              </h1>

              {/* Rating Header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded">
                  <Star size={11} className="fill-white text-white" />
                  <span className="text-[11px] font-black text-white">{averageRating}</span>
                </div>
                <span className="text-[11px] text-neutral-400">
                  {totalReviewsCount} {totalReviewsCount === 1 ? "Customer Review" : "Customer Reviews"}
                </span>
              </div>

              <div className="p-3 sm:p-4 bg-neutral-950 border border-neutral-900 rounded-xl mb-4 flex items-baseline gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl font-serif font-black text-white">
                  ₹{product.price?.toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] sm:text-xs text-neutral-500 line-through">
                  ₹{(product.price ? product.price + 800 : 3299).toLocaleString("en-IN")}
                </span>
              </div>

              {/* Sizes */}
              <div className="mb-4 sm:mb-6">
                <span className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-white block mb-2">
                  Select Size
                </span>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`min-w-[42px] sm:min-w-[50px] h-10 sm:h-11 rounded-lg text-xs font-bold uppercase transition-all flex items-center justify-center cursor-pointer active:scale-95 ${
                        selectedSize === sz
                          ? "bg-white text-black scale-105"
                          : "bg-neutral-950 text-neutral-300 border border-neutral-800 hover:border-neutral-600"
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

            {/* Action Buttons */}
            <div className="pt-2 sm:pt-4 border-t border-neutral-900">
              <div className="flex gap-2.5 mb-3">
                <button
                  onClick={() => onAddToCart({ ...product, selectedSize })}
                  className="flex-1 py-3 px-2 bg-neutral-950 text-white border border-neutral-800 hover:border-neutral-600 rounded-xl text-[11px] sm:text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer transition"
                >
                  <ShoppingBag size={14} />
                  Add to Bag
                </button>
                <button
                  onClick={() => onBuyNow({ ...product, selectedSize })}
                  className="flex-1 py-3 px-2 bg-white text-black rounded-xl text-[11px] sm:text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-1.5 hover:bg-neutral-200 active:scale-95 cursor-pointer transition"
                >
                  <Zap size={14} className="fill-black" />
                  Buy UPI
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

        {/* Customer Reviews Section */}
        <section className="mt-12 pt-8 border-t border-neutral-900">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base sm:text-xl font-serif font-black uppercase text-white">
                Customer Ratings & Feedback
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Authentic reviews from patrons who wear Two Brothers garments.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-neutral-950 p-3 rounded-2xl border border-neutral-900 self-start md:self-auto">
              <div className="text-center px-2">
                <span className="text-2xl font-serif font-black text-white block leading-none">
                  {averageRating}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-bold">
                  out of 5
                </span>
              </div>
              <div className="h-8 w-[1px] bg-neutral-900" />
              <div>
                <div className="flex text-white mb-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={12}
                      className={star <= Math.round(Number(averageRating)) ? "fill-white text-white" : "text-neutral-700"}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-neutral-400 font-medium block">
                  Based on {totalReviewsCount} {totalReviewsCount === 1 ? "review" : "reviews"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Add Review Form */}
            <div className="lg:col-span-5 bg-neutral-950 p-4 sm:p-5 rounded-2xl border border-neutral-900">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquarePlus size={16} className="text-white" />
                <h3 className="font-serif font-bold text-sm sm:text-base text-white uppercase tracking-wide">
                  Leave a Review
                </h3>
              </div>

              <form onSubmit={handleAddReview} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Your Rating
                  </label>
                  <div className="flex items-center gap-1.5 py-1">
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
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram K."
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Review / Fabric Experience
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Share feedback on collar stiffness, weave thickness, or fit..."
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

                {formSubmitted && (
                  <p className="text-[10px] text-white bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-center font-medium">
                    Thank you! Your review has been added and calculated.
                  </p>
                )}
              </form>
            </div>

            {/* List of Customer Reviews */}
            <div className="lg:col-span-7">
              {reviews.length === 0 ? (
                <div className="py-12 px-4 text-center bg-neutral-950 border border-dashed border-neutral-800 rounded-2xl">
                  <p className="font-serif text-sm font-bold text-white mb-1">No reviews yet</p>
                  <p className="text-xs text-neutral-500">
                    Be the first patron to leave your thoughts on this garment.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {reviews.map((rev) => (
                    <div key={rev.id || Math.random()} className="p-4 bg-neutral-950 border border-neutral-900 rounded-2xl">
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <span className="text-xs font-bold text-white block">{rev.name}</span>
                          <span className="text-[9px] text-neutral-500">{rev.date}</span>
                        </div>
                        <div className="flex text-white">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={10}
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
        </section>

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

    </div>
  );
};
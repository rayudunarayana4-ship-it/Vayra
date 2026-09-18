import React, { useState, useEffect, useMemo } from "react";
import {
  Footprints,
  PlusCircle,
  ShoppingBag,
  ArrowLeft,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Plus,
  X,
  ExternalLink,
  Sparkles,
  Phone,
  Sliders,
  Image as ImageIcon,
} from "lucide-react";
import {
  fetchProducts,
  getInitialProducts,
  subscribeToProductUpdates,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchAllOrders,
  updateOrderStatusApi,
  getInitialSlides,
  fetchSlides,
  subscribeToSlideUpdates,
  createSlide,
  updateSlide,
  deleteSlide,
} from "../../services/api";

const FOOTWEAR_CATEGORIES = ["Sneakers", "Loafers", "Boots", "Formal", "Sandals/Slides"];
const AVAILABLE_SIZES = ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"];

export const AdminDashboard = ({ onExit, products: initialProducts = [], onProductsChange }) => {
  // Navigation Tabs: 'products' | 'add' | 'edit' | 'slides' | 'orders'
  const [activeTab, setActiveTab] = useState("products");

  // Footwear Inventory State
  const [productsList, setProductsList] = useState(() => getInitialProducts());

  // Hero Main Slides State
  const [slidesList, setSlidesList] = useState(() => getInitialSlides());
  const [editingSlide, setEditingSlide] = useState(null);
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);

  // Orders State
  const [ordersList, setOrdersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
  const [selectedStockFilter, setSelectedStockFilter] = useState("All");
  const [toastMessage, setToastMessage] = useState(null);

  // Product Form State
  const initialProductFormState = {
    name: "",
    category: "Sneakers",
    price: "",
    originalPrice: "",
    stock: 10,
    sizes: ["UK 7", "UK 8", "UK 9", "UK 10"],
    upperMaterial: "Full-Grain Italian Calfskin",
    soleType: "Sculpted EVA Cushion Cupsole",
    insole: "High-Density Ortho-Memory Bed",
    fit: "True to UK Size",
    care: "Condition with beeswax cream; wipe with clean soft cloth.",
    description: "",
    images: [""],
    featured: false,
    active: true,
    details: ["Handcrafted precision lasting", "Shock-dampening sole architecture"],
  };

  const [formData, setFormData] = useState(initialProductFormState);
  const [detailInput, setDetailInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Slide Form State
  const initialSlideFormState = {
    title: "",
    subtitle: "",
    tag: "SIGNATURE COLLECTION",
    buttonText: "Shop Collection",
    buttonLink: "#catalog",
    image: "",
    active: true,
  };
  const [slideFormData, setSlideFormData] = useState(initialSlideFormState);
  const [isSlideSubmitting, setIsSlideSubmitting] = useState(false);

  // Toast feedback
  const showToast = (message, type = "success") => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initial load
  useEffect(() => {
    loadData();
  }, []);

  // Live real-time synchronizers
  useEffect(() => {
    const unsubProducts = subscribeToProductUpdates((updated) => {
      if (Array.isArray(updated)) {
        setProductsList(updated);
      }
    });

    const unsubSlides = subscribeToSlideUpdates((updated) => {
      if (Array.isArray(updated)) {
        setSlidesList(updated);
      }
    });

    return () => {
      unsubProducts();
      unsubSlides();
    };
  }, []);

  useEffect(() => {
    if (Array.isArray(initialProducts)) {
      setProductsList(initialProducts);
    }
  }, [initialProducts]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, ords, slides] = await Promise.all([
        fetchProducts().catch(() => getInitialProducts()),
        fetchAllOrders().catch(() => []),
        fetchSlides().catch(() => getInitialSlides()),
      ]);

      if (Array.isArray(prods)) {
        setProductsList(prods);
        if (onProductsChange) onProductsChange(prods);
      }
      if (Array.isArray(ords)) {
        setOrdersList(ords);
      }
      if (Array.isArray(slides)) {
        setSlidesList(slides);
      }
    } catch (err) {
      console.error("Admin load error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Inventory Quick Stats
  const stats = useMemo(() => {
    const total = productsList.length;
    const active = productsList.filter((p) => p && p.active !== false && p.status !== "INACTIVE").length;
    const lowStock = productsList.filter((p) => {
      const s = Number(p.stock !== undefined ? p.stock : 10);
      return s > 0 && s <= 3;
    }).length;
    const outOfStock = productsList.filter((p) => {
      const s = Number(p.stock !== undefined ? p.stock : 10);
      return s <= 0;
    }).length;
    return { total, active, lowStock, outOfStock };
  }, [productsList]);

  // Filtered Products for Inventory Table
  const filteredProducts = useMemo(() => {
    return productsList.filter((p) => {
      if (!p) return false;
      const name = (p.name || "").toLowerCase();
      const cat = (p.category || p.type || "").toLowerCase();
      const material = (p.upperMaterial || p.fabric || "").toLowerCase();
      const search = searchTerm.toLowerCase();

      const matchesSearch = name.includes(search) || cat.includes(search) || material.includes(search);

      let matchesCat = true;
      if (selectedCategoryFilter !== "All") {
        matchesCat = cat.toLowerCase() === selectedCategoryFilter.toLowerCase();
      }

      let matchesStock = true;
      const stock = Number(p.stock !== undefined ? p.stock : 10);
      if (selectedStockFilter === "In Stock") matchesStock = stock > 3;
      if (selectedStockFilter === "Low Stock") matchesStock = stock > 0 && stock <= 3;
      if (selectedStockFilter === "Out of Stock") matchesStock = stock <= 0;
      if (selectedStockFilter === "Active") matchesStock = p.active !== false && p.status !== "INACTIVE";
      if (selectedStockFilter === "Inactive") matchesStock = p.active === false || p.status === "INACTIVE";

      return matchesSearch && matchesCat && matchesStock;
    });
  }, [productsList, searchTerm, selectedCategoryFilter, selectedStockFilter]);

  // -------------------------------------------------------------
  // PRODUCT MANAGEMENT ACTIONS
  // -------------------------------------------------------------
  const handleProductInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleSize = (size) => {
    setFormData((prev) => {
      const current = prev.sizes || [];
      return {
        ...prev,
        sizes: current.includes(size) ? current.filter((s) => s !== size) : [...current, size],
      };
    });
  };

  const handleImageFieldChange = (index, value) => {
    setFormData((prev) => {
      const imgs = [...prev.images];
      imgs[index] = value;
      return { ...prev, images: imgs };
    });
  };

  const addImageField = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ""] }));
  };

  const removeImageField = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result;
        if (!imageData) return;
        setFormData((prev) => ({
          ...prev,
          images: [...(prev.images || []).filter(Boolean), imageData],
        }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleAddDetail = (e) => {
    e.preventDefault();
    if (!detailInput.trim()) return;
    setFormData((prev) => ({ ...prev, details: [...(prev.details || []), detailInput.trim()] }));
    setDetailInput("");
  };

  const handleRemoveDetail = (idx) => {
    setFormData((prev) => ({ ...prev, details: prev.details.filter((_, i) => i !== idx) }));
  };

  const startEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      category: product.category || product.type || "Sneakers",
      price: product.price || "",
      originalPrice: product.originalPrice || (product.price ? Number(product.price) + 1200 : ""),
      stock: product.stock !== undefined ? product.stock : 10,
      sizes: product.sizes && product.sizes.length ? product.sizes : AVAILABLE_SIZES,
      upperMaterial: product.upperMaterial || product.fabric || "Full-Grain Leather",
      soleType: product.soleType || "Cushioned EVA Sole",
      insole: product.insole || "Ortho-Memory Foam",
      fit: product.fit || "True to UK Size",
      care: product.care || "Condition with leather balm.",
      description: product.description || "",
      images: Array.isArray(product.images) && product.images.length ? product.images : (product.image ? [product.image] : []),
      featured: Boolean(product.featured),
      active: product.active !== false && product.status !== "INACTIVE",
      details: Array.isArray(product.details) ? product.details : [],
    });
    setActiveTab("edit");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.price) {
      alert("Please provide at least a Product Name and Price.");
      return;
    }

    setIsSubmitting(true);

    try {
      // RULE 6: Strict Single Source of Truth for Images
      // 1 image = 1 image, 2 = 2, 0 = 0 (empty array). Never inject demo unsplash fallback!
      const validImages = (formData.images || []).filter(
        (img) => typeof img === "string" && img.trim().length > 0
      );

      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice
          ? parseFloat(formData.originalPrice)
          : parseFloat(formData.price) + 1200,
        stock: parseInt(formData.stock, 10) || 0,
        images: validImages,
        image: validImages[0] || "",
        status: formData.active ? "ACTIVE" : "INACTIVE",
        fabric: formData.upperMaterial,
        type: formData.category,
        gsm: formData.soleType,
      };

      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, payload);
        const updatedList = productsList.map((p) =>
          p.id === editingProduct.id ? { ...p, ...payload, ...updated } : p
        );
        setProductsList(updatedList);
        if (onProductsChange) onProductsChange(updatedList);
        showToast(`"${payload.name}" updated successfully.`);
      } else {
        const newProduct = await createProduct(payload);
        const updatedList = [newProduct, ...productsList.filter((p) => p.id !== newProduct.id)];
        setProductsList(updatedList);
        if (onProductsChange) onProductsChange(updatedList);
        showToast(`"${payload.name}" published to store.`);
      }

      setFormData(initialProductFormState);
      setEditingProduct(null);
      setActiveTab("products");
    } catch (err) {
      console.error("Save product error:", err);
      showToast("Error saving footwear. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from the VAYRA catalog?`)) {
      return;
    }

    try {
      await deleteProduct(id);
      const updatedList = productsList.filter((p) => p.id !== id);
      setProductsList(updatedList);
      if (onProductsChange) onProductsChange(updatedList);
      showToast(`"${name}" deleted from catalog.`);
    } catch (err) {
      console.error("Delete error:", err);
      showToast("Failed to delete product.", "error");
    }
  };

  const handleToggleActiveStatus = async (product) => {
    const nextActive = product.active === false || product.status === "INACTIVE";
    const nextStatus = nextActive ? "ACTIVE" : "INACTIVE";

    const updated = { ...product, active: nextActive, status: nextStatus };
    await updateProduct(product.id, { active: nextActive, status: nextStatus });

    const updatedList = productsList.map((p) => (p.id === product.id ? updated : p));
    setProductsList(updatedList);
    if (onProductsChange) onProductsChange(updatedList);
    showToast(`${product.name} is now ${nextStatus}.`);
  };

  const handleToggleFeaturedStatus = async (product) => {
    const nextFeatured = !product.featured;
    const updated = { ...product, featured: nextFeatured };
    await updateProduct(product.id, { featured: nextFeatured });

    const updatedList = productsList.map((p) => (p.id === product.id ? updated : p));
    setProductsList(updatedList);
    if (onProductsChange) onProductsChange(updatedList);
    showToast(`"${product.name}" is now ${nextFeatured ? "Featured" : "Standard"}.`);
  };

  // -------------------------------------------------------------
  // MAIN SLIDES MANAGEMENT ACTIONS
  // -------------------------------------------------------------
  const startAddSlide = () => {
    setEditingSlide(null);
    setSlideFormData(initialSlideFormState);
    setIsSlideModalOpen(true);
  };

  const startEditSlide = (slide) => {
    setEditingSlide(slide);
    setSlideFormData({
      title: slide.heading || slide.title || "",
      subtitle: slide.subtitle || "",
      tag: slide.tagTitle || slide.tag || "SIGNATURE COLLECTION",
      buttonText: slide.buttonText || "Shop Collection",
      buttonLink: slide.buttonLink || slide.link || "#catalog",
      image: slide.imageUrl || slide.image || "",
      active: slide.active !== false,
    });
    setIsSlideModalOpen(true);
  };

  const handleSlideFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result;
      if (imageData) {
        setSlideFormData((prev) => ({ ...prev, image: imageData }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSubmitSlide = async (e) => {
    e.preventDefault();
    if (!slideFormData.title.trim()) {
      alert("Please provide a title for the slide.");
      return;
    }

    setIsSlideSubmitting(true);
    try {
      if (editingSlide) {
        const updated = await updateSlide(editingSlide.id, slideFormData);
        setSlidesList((prev) =>
          prev.map((s) => (s.id === editingSlide.id ? { ...s, ...slideFormData, ...updated } : s))
        );
        showToast("Hero slide updated successfully.");
      } else {
        const created = await createSlide(slideFormData);
        setSlidesList((prev) => [created, ...prev.filter((s) => s.id !== created.id)]);
        showToast("New hero slide published to storefront.");
      }
      setIsSlideModalOpen(false);
      setEditingSlide(null);
      setSlideFormData(initialSlideFormState);
    } catch (err) {
      console.error("Save slide error:", err);
      showToast("Error saving slide.", "error");
    } finally {
      setIsSlideSubmitting(false);
    }
  };

  const handleToggleSlideActive = async (slide) => {
    const nextActive = slide.active === false;
    await updateSlide(slide.id, { active: nextActive });
    setSlidesList((prev) =>
      prev.map((s) => (s.id === slide.id ? { ...s, active: nextActive } : s))
    );
    showToast(`Slide "${slide.title || slide.heading}" is now ${nextActive ? "Active" : "Hidden"}.`);
  };

  const handleDeleteSlide = async (slideId, title) => {
    if (!window.confirm(`Delete slide "${title || "Selected Slide"}" from hero slider?`)) return;

    try {
      await deleteSlide(slideId);
      setSlidesList((prev) => prev.filter((s) => s.id !== slideId));
      showToast("Slide deleted successfully.");
    } catch (err) {
      console.error("Delete slide error:", err);
      showToast("Failed to delete slide.", "error");
    }
  };

  // -------------------------------------------------------------
  // ORDERS MANAGEMENT ACTIONS
  // -------------------------------------------------------------
  const handleOrderStatusChange = async (orderId, newStatus) => {
    await updateOrderStatusApi(orderId, newStatus);
    setOrdersList((prev) =>
      prev.map((o) => (o.orderNumber === orderId || o.id === orderId ? { ...o, status: newStatus } : o))
    );
    showToast(`Order #${orderId} marked as ${newStatus}.`);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F2EB] font-sans selection:bg-[#C5A059] selection:text-black">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-2 animate-in fade-in duration-300 ${
            toastMessage.type === "error"
              ? "bg-red-950 text-red-200 border-red-800"
              : "bg-[#111111] text-[#F5F2EB] border-[#C5A059]/80"
          }`}
        >
          {toastMessage.type === "error" ? (
            <XCircle size={16} className="text-red-400 shrink-0" />
          ) : (
            <CheckCircle2 size={16} className="text-[#C5A059] shrink-0" />
          )}
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-neutral-900 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 select-none">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-neutral-900 to-black border border-neutral-800 flex items-center justify-center shrink-0 shadow-lg">
              <svg viewBox="0 0 40 40" className="w-5 h-5" fill="none">
                <path d="M9 10L20 32L31 10H25L20 22L15 10H9Z" fill="#F5F2EB" />
                <path d="M20 18L26 30L32 18" stroke="#C5A059" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="20" cy="8" r="1.5" fill="#C5A059" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-black uppercase text-sm sm:text-base tracking-[0.2em] text-white">
                  VAYRA FOOTWEAR
                </span>
                <span className="px-2 py-0.5 rounded text-[8px] tracking-[0.2em] font-mono uppercase bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/40">
                  ADMIN
                </span>
              </div>
              <p className="text-[9px] text-neutral-400 font-mono tracking-widest uppercase">
                STEP INTO YOUR STYLE • STORE CONTROL CENTER
              </p>
            </div>
          </div>

          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F5F2EB] text-black hover:bg-[#C5A059] transition-all text-xs font-bold uppercase tracking-wider active:scale-95 cursor-pointer shadow-lg"
          >
            <ArrowLeft size={13} />
            <span>Customer Store</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between gap-4 border-b border-neutral-900 pb-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            {[
              { key: "products", label: `Footwear Inventory (${productsList.length})`, icon: Footprints },
              { key: "add", label: "+ Add Footwear", icon: PlusCircle },
              { key: "slides", label: `Main Slides (${slidesList.length})`, icon: Sliders },
              { key: "orders", label: `Customer Orders (${ordersList.length})`, icon: ShoppingBag },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key || (tab.key === "products" && activeTab === "edit");
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    if (tab.key === "add") {
                      setEditingProduct(null);
                      setFormData(initialProductFormState);
                    }
                    setActiveTab(tab.key);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition cursor-pointer active:scale-95 ${
                    isActive
                      ? "bg-[#F5F2EB] text-black shadow-lg font-black"
                      : "bg-neutral-900/60 text-neutral-400 border border-neutral-800 hover:text-white hover:border-[#C5A059]/40"
                  }`}
                >
                  <Icon size={14} className={isActive ? "text-black" : "text-[#C5A059]"} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Stat Pill */}
          <div className="hidden md:flex items-center gap-3 text-[11px] font-mono text-neutral-400">
            <span>
              Active: <strong className="text-[#C5A059]">{stats.active}</strong>
            </span>
            <span>•</span>
            <span>
              Low Stock: <strong className="text-amber-400">{stats.lowStock}</strong>
            </span>
            <span>•</span>
            <span>
              Out of Stock: <strong className="text-red-400">{stats.outOfStock}</strong>
            </span>
          </div>
        </div>

        {/* ============================================================= */}
        {/* TAB 1: FOOTWEAR INVENTORY TABLE */}
        {/* ============================================================= */}
        {(activeTab === "products" || activeTab === "edit") && activeTab !== "add" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0A0A0A] p-4 rounded-2xl border border-neutral-900">
              <div className="relative w-full sm:w-80">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search silhouettes, material, sole..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="All">All Categories</option>
                  {FOOTWEAR_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <select
                  value={selectedStockFilter}
                  onChange={(e) => setSelectedStockFilter(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="All">All Stock Levels</option>
                  <option value="In Stock">In Stock (&gt;3)</option>
                  <option value="Low Stock">Low Stock (1-3)</option>
                  <option value="Out of Stock">Out of Stock (0)</option>
                  <option value="Active">Active Only</option>
                  <option value="Inactive">Inactive Only</option>
                </select>

                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setFormData(initialProductFormState);
                    setActiveTab("add");
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#F5F2EB] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#C5A059] transition active:scale-95 cursor-pointer whitespace-nowrap shadow"
                >
                  + Add Shoe
                </button>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-[#0A0A0A] border border-neutral-900 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0f0f0f] border-b border-neutral-900 text-neutral-400 uppercase font-mono tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4">Footwear Silhouette</th>
                      <th className="py-3.5 px-3">Category</th>
                      <th className="py-3.5 px-3">Price</th>
                      <th className="py-3.5 px-3">Stock</th>
                      <th className="py-3.5 px-3">UK Sizes</th>
                      <th className="py-3.5 px-3">Hero Featured</th>
                      <th className="py-3.5 px-3">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900/80">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-16 text-center text-neutral-500 font-mono text-xs">
                          {productsList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center">
                              <Footprints size={36} className="text-neutral-600 mb-2" />
                              <div className="font-serif font-bold text-white text-sm mb-1">
                                No footwear added yet.
                              </div>
                              <p className="text-xs text-neutral-500 mb-4 max-w-sm">
                                Your catalog is currently empty. Add your first footwear article to publish it to the customer store.
                              </p>
                              <button
                                onClick={() => {
                                  setEditingProduct(null);
                                  setFormData(initialProductFormState);
                                  setActiveTab("add");
                                }}
                                className="px-4 py-2 rounded-xl bg-[#F5F2EB] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#C5A059] transition cursor-pointer"
                              >
                                + Add First Shoe
                              </button>
                            </div>
                          ) : (
                            "No footwear silhouettes match your filter criteria."
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product) => {
                        const stock = Number(product.stock !== undefined ? product.stock : 10);
                        const isLow = stock > 0 && stock <= 3;
                        const isOut = stock <= 0;
                        const isActive = product.active !== false && product.status !== "INACTIVE";
                        const img = product.images?.[0] || product.image || "";

                        return (
                          <tr key={product.id} className="hover:bg-neutral-900/40 transition-colors">
                            {/* Product Info */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-14 rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 shrink-0 flex items-center justify-center">
                                  {img ? (
                                    <img src={img} alt={product.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-[9px] font-mono text-neutral-600">No Image</span>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-serif font-bold text-white text-xs sm:text-sm truncate">
                                    {product.name}
                                  </div>
                                  <div className="text-[10px] text-neutral-400 truncate max-w-xs">
                                    {product.upperMaterial || "Leather"} • {product.soleType || "Cushioned"}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="py-3 px-3 whitespace-nowrap">
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-mono uppercase bg-neutral-900 border border-neutral-800 text-neutral-300">
                                {product.category || product.type || "Footwear"}
                              </span>
                            </td>

                            {/* Price */}
                            <td className="py-3 px-3 whitespace-nowrap">
                              <div className="font-serif font-bold text-white text-xs sm:text-sm">
                                ₹{Number(product.price || 0).toLocaleString("en-IN")}
                              </div>
                              {product.originalPrice && (
                                <div className="text-[10px] text-neutral-500 line-through">
                                  ₹{Number(product.originalPrice).toLocaleString("en-IN")}
                                </div>
                              )}
                            </td>

                            {/* Stock */}
                            <td className="py-3 px-3 whitespace-nowrap">
                              {isOut ? (
                                <span className="px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase bg-red-950/80 text-red-300 border border-red-800">
                                  Out of Stock (0)
                                </span>
                              ) : isLow ? (
                                <span className="px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase bg-amber-950/80 text-amber-300 border border-amber-700 animate-pulse">
                                  Low Stock ({stock})
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-emerald-950/60 text-emerald-300 border border-emerald-800">
                                  In Stock ({stock})
                                </span>
                              )}
                            </td>

                            {/* Sizes */}
                            <td className="py-3 px-3">
                              <div className="flex flex-wrap gap-1 max-w-[150px]">
                                {(product.sizes || AVAILABLE_SIZES).map((sz) => (
                                  <span
                                    key={sz}
                                    className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-neutral-950 border border-neutral-800 text-neutral-400"
                                  >
                                    {sz}
                                  </span>
                                ))}
                              </div>
                            </td>

                            {/* Featured in Hero Toggle */}
                            <td className="py-3 px-3 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => handleToggleFeaturedStatus(product)}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition cursor-pointer ${
                                  product.featured
                                    ? "bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/50 shadow-sm"
                                    : "bg-neutral-900 text-neutral-500 border border-neutral-800 hover:text-neutral-300"
                                }`}
                              >
                                <Sparkles size={11} className={product.featured ? "fill-[#C5A059]" : ""} />
                                <span>{product.featured ? "Featured" : "Standard"}</span>
                              </button>
                            </td>

                            {/* Storefront Active Toggle */}
                            <td className="py-3 px-3 whitespace-nowrap">
                              <button
                                onClick={() => handleToggleActiveStatus(product)}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition cursor-pointer ${
                                  isActive
                                    ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                                    : "bg-neutral-900 text-neutral-500 border border-neutral-800"
                                }`}
                              >
                                {isActive ? <Eye size={11} /> : <EyeOff size={11} />}
                                <span>{isActive ? "Active" : "Inactive"}</span>
                              </button>
                            </td>

                            {/* Edit / Delete Actions */}
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => startEditProduct(product)}
                                  title="Edit Footwear"
                                  className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-[#C5A059] transition cursor-pointer"
                                >
                                  <Edit size={13} />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id, product.name)}
                                  title="Delete Footwear"
                                  className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-red-400 hover:border-red-800 transition cursor-pointer"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB 2: ADD / EDIT FOOTWEAR FORM */}
        {/* ============================================================= */}
        {(activeTab === "add" || activeTab === "edit") && (
          <div className="bg-[#0A0A0A] border border-neutral-900 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-900">
              <div>
                <h2 className="font-serif font-black uppercase tracking-wider text-base sm:text-lg text-white">
                  {editingProduct ? `Edit Footwear • ${editingProduct.name}` : "Add New Footwear Article"}
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Configure specifications, pricing, UK sizing, and gallery imagery.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  setActiveTab("products");
                }}
                className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitProduct} className="space-y-6 text-xs">
              {/* Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider font-mono text-neutral-400 font-bold mb-1.5">
                    Model Name *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. VAYRA AERO"
                    value={formData.name}
                    onChange={(e) => handleProductInputChange("name", e.target.value)}
                    className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-mono text-neutral-400 font-bold mb-1.5">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleProductInputChange("category", e.target.value)}
                    className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#C5A059]"
                  >
                    {FOOTWEAR_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block uppercase tracking-wider font-mono text-neutral-400 font-bold mb-1.5">
                    Selling Price (INR ₹) *
                  </label>
                  <input
                    required
                    type="number"
                    placeholder="3499"
                    value={formData.price}
                    onChange={(e) => handleProductInputChange("price", e.target.value)}
                    className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#C5A059] font-mono"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-mono text-neutral-400 font-bold mb-1.5">
                    Original Price / MRP (INR ₹)
                  </label>
                  <input
                    type="number"
                    placeholder="4999"
                    value={formData.originalPrice}
                    onChange={(e) => handleProductInputChange("originalPrice", e.target.value)}
                    className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#C5A059] font-mono"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-mono text-neutral-400 font-bold mb-1.5">
                    Inventory Stock Count *
                  </label>
                  <input
                    required
                    type="number"
                    placeholder="10"
                    value={formData.stock}
                    onChange={(e) => handleProductInputChange("stock", e.target.value)}
                    className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#C5A059] font-mono"
                  />
                </div>
              </div>

              {/* Upper, Sole, Insole & Fit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block uppercase tracking-wider font-mono text-neutral-400 font-bold mb-1.5">
                    Upper Material
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Italian Calfskin Leather"
                    value={formData.upperMaterial}
                    onChange={(e) => handleProductInputChange("upperMaterial", e.target.value)}
                    className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-mono text-neutral-400 font-bold mb-1.5">
                    Sole Construction
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sculpted EVA Cupsole"
                    value={formData.soleType}
                    onChange={(e) => handleProductInputChange("soleType", e.target.value)}
                    className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-mono text-neutral-400 font-bold mb-1.5">
                    Insole Bed
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ortho-Memory Foam"
                    value={formData.insole}
                    onChange={(e) => handleProductInputChange("insole", e.target.value)}
                    className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-mono text-neutral-400 font-bold mb-1.5">
                    Fit Recommendation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. True to UK Size"
                    value={formData.fit}
                    onChange={(e) => handleProductInputChange("fit", e.target.value)}
                    className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              {/* Description & Care */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider font-mono text-neutral-400 font-bold mb-1.5">
                    Product Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Silhouette inspiration, arch support, leather drape..."
                    value={formData.description}
                    onChange={(e) => handleProductInputChange("description", e.target.value)}
                    className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl p-3 text-white focus:outline-none focus:border-[#C5A059] resize-none"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-mono text-neutral-400 font-bold mb-1.5">
                    Shoe Care Instructions
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Condition with beeswax balm; use cedar shoe trees..."
                    value={formData.care}
                    onChange={(e) => handleProductInputChange("care", e.target.value)}
                    className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl p-3 text-white focus:outline-none focus:border-[#C5A059] resize-none"
                  />
                </div>
              </div>

              {/* UK Sizes Checkboxes */}
              <div>
                <label className="block uppercase tracking-wider font-mono text-neutral-400 font-bold mb-2">
                  Available UK / India Shoe Sizes
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SIZES.map((sz) => {
                    const isSelected = (formData.sizes || []).includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => handleToggleSize(sz)}
                        className={`px-4 py-2 rounded-xl font-mono font-bold text-xs transition cursor-pointer active:scale-95 ${
                          isSelected
                            ? "bg-[#F5F2EB] text-black border border-white shadow"
                            : "bg-neutral-900 text-neutral-500 border border-neutral-800 hover:text-white"
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Strict Product Images Single Source of Truth */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="uppercase tracking-wider font-mono text-neutral-300 font-bold block">
                      Footwear Images ({formData.images.filter(Boolean).length})
                    </label>
                    <p className="text-[10px] text-neutral-500 font-mono">
                      Single source of truth: 1 image = 1 image, 2 = 2, 0 = 0. No demo images injected.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addImageField}
                    className="text-[#C5A059] hover:underline flex items-center gap-1 font-semibold text-xs cursor-pointer"
                  >
                    <Plus size={13} /> Add Photo URL
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.images.map((url, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/... or direct image URL"
                        value={url}
                        onChange={(e) => handleImageFieldChange(idx, e.target.value)}
                        className="flex-1 bg-neutral-900/80 border border-neutral-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#C5A059]"
                      />
                      <button
                        type="button"
                        onClick={() => removeImageField(idx)}
                        className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-red-400 cursor-pointer"
                        title="Remove Image"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Local Device Upload */}
                <div className="pt-2">
                  <label className="block text-[10px] font-mono text-neutral-400 mb-1">
                    Or Upload Images from Device:
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="text-xs text-neutral-400 file:mr-3 file:py-1.5 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-neutral-800 file:text-[#F5F2EB] hover:file:bg-[#C5A059] hover:file:text-black cursor-pointer"
                  />
                </div>
              </div>

              {/* Craftsmanship Highlights */}
              <div>
                <label className="block uppercase tracking-wider font-mono text-neutral-400 font-bold mb-1.5">
                  Craftsmanship Highlights
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. Hand-finished edges, Vibram-grade traction"
                    value={detailInput}
                    onChange={(e) => setDetailInput(e.target.value)}
                    className="flex-1 bg-neutral-900/80 border border-neutral-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#C5A059]"
                  />
                  <button
                    type="button"
                    onClick={handleAddDetail}
                    className="px-4 py-2 rounded-xl bg-neutral-800 text-white font-bold hover:bg-neutral-700 cursor-pointer"
                  >
                    Add Bullet
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(formData.details || []).map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-300 text-[11px]"
                    >
                      <span>{item}</span>
                      <X
                        size={12}
                        className="cursor-pointer hover:text-red-400"
                        onClick={() => handleRemoveDetail(idx)}
                      />
                    </span>
                  ))}
                </div>
              </div>

              {/* Status & Featured Flags */}
              <div className="flex items-center gap-6 pt-3 border-t border-neutral-900">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => handleProductInputChange("active", e.target.checked)}
                    className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 text-[#C5A059] focus:ring-0"
                  />
                  <span className="font-bold text-neutral-300">Active on Storefront</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => handleProductInputChange("featured", e.target.checked)}
                    className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 text-[#C5A059] focus:ring-0"
                  />
                  <span className="font-bold text-neutral-300">Featured in Hero / Banners</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-neutral-900 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setActiveTab("products");
                  }}
                  className="px-5 py-3 rounded-2xl bg-neutral-900 text-neutral-300 font-bold border border-neutral-800 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-7 py-3 rounded-2xl bg-[#F5F2EB] text-black font-black uppercase tracking-wider hover:bg-[#C5A059] transition-all cursor-pointer shadow-xl active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Saving Footwear..."
                    : editingProduct
                    ? "Save Changes"
                    : "Publish to VAYRA Catalog"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB 3: MAIN SLIDES MANAGEMENT (Dedicated Hero Banner Section) */}
        {/* ============================================================= */}
        {activeTab === "slides" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0A0A0A] p-4 rounded-2xl border border-neutral-900">
              <div>
                <h3 className="font-serif font-black uppercase tracking-wider text-white text-sm">
                  Main Hero Slides ({slidesList.length})
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Control the main stacked slider on the homepage in real-time.
                </p>
              </div>

              <button
                onClick={startAddSlide}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F5F2EB] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#C5A059] transition active:scale-95 cursor-pointer shadow"
              >
                <Plus size={14} /> Add Slide
              </button>
            </div>

            {/* Slides Cards Grid */}
            {slidesList.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-neutral-800 rounded-3xl p-8 bg-neutral-950">
                <Sliders size={32} className="mx-auto text-neutral-600 mb-2" />
                <h4 className="text-sm font-serif font-bold text-white mb-1">No custom slides yet</h4>
                <p className="text-xs text-neutral-500 mb-4">
                  Add hero slides to showcase collections, seasonal footwear, and announcements.
                </p>
                <button
                  onClick={startAddSlide}
                  className="px-4 py-2 rounded-xl bg-[#F5F2EB] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#C5A059] transition cursor-pointer"
                >
                  + Add First Slide
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {slidesList.map((slide, idx) => {
                  const isActive = slide.active !== false;
                  const imgSrc = slide.imageUrl || slide.image || "";
                  const title = slide.heading || slide.title || "VAYRA FOOTWEAR";
                  const tag = slide.tagTitle || slide.tag || "SIGNATURE COLLECTION";
                  const subtitle = slide.subtitle || "";

                  return (
                    <div
                      key={slide.id || idx}
                      className={`bg-[#0A0A0A] border rounded-2xl overflow-hidden flex flex-col justify-between shadow-xl transition-all ${
                        isActive ? "border-neutral-800" : "border-neutral-900 opacity-60"
                      }`}
                    >
                      {/* Image Preview Header */}
                      <div className="relative aspect-[16/9] bg-neutral-950 overflow-hidden">
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-900 text-neutral-600 text-xs font-mono">
                            <ImageIcon size={24} className="mb-1 text-neutral-500" />
                            <span>No Image</span>
                          </div>
                        )}

                        {/* Tag Badge */}
                        <span className="absolute top-2.5 left-2.5 bg-black/85 backdrop-blur-md px-2.5 py-0.5 rounded text-[8px] font-mono font-bold tracking-widest text-[#C5A059] border border-neutral-800">
                          {tag}
                        </span>

                        {/* Status Badge */}
                        <button
                          onClick={() => handleToggleSlideActive(slide)}
                          className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[8px] font-mono font-bold border transition cursor-pointer ${
                            isActive
                              ? "bg-emerald-950/90 text-emerald-300 border-emerald-800"
                              : "bg-neutral-900 text-neutral-500 border-neutral-800"
                          }`}
                        >
                          {isActive ? "ACTIVE" : "INACTIVE"}
                        </button>
                      </div>

                      {/* Content Details */}
                      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                        <div>
                          <h4 className="font-serif font-black uppercase text-white text-sm line-clamp-1">
                            {title}
                          </h4>
                          {subtitle && (
                            <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1 font-light">
                              {subtitle}
                            </p>
                          )}
                          {slide.buttonText && (
                            <div className="mt-2 text-[10px] font-mono text-[#C5A059]">
                              CTA: <strong>{slide.buttonText}</strong> &rarr; {slide.buttonLink || "#"}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-3 border-t border-neutral-900 flex items-center justify-between">
                          <button
                            onClick={() => handleToggleSlideActive(slide)}
                            className="text-[10px] font-mono uppercase text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                          >
                            {isActive ? <EyeOff size={11} /> : <Eye size={11} />}
                            <span>{isActive ? "Hide on Store" : "Show on Store"}</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => startEditSlide(slide)}
                              className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-[#C5A059] transition cursor-pointer"
                              title="Edit Slide"
                            >
                              <Edit size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteSlide(slide.id, title)}
                              className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-red-400 hover:border-red-800 transition cursor-pointer"
                              title="Delete Slide"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Slide Add / Edit Modal */}
            {isSlideModalOpen && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#0A0A0A] border border-neutral-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-900">
                    <h3 className="font-serif font-black uppercase text-sm text-white">
                      {editingSlide ? "Edit Hero Slide" : "Add New Hero Slide"}
                    </h3>
                    <button
                      onClick={() => setIsSlideModalOpen(false)}
                      className="p-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmitSlide} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block uppercase tracking-wider font-mono text-neutral-400 font-bold mb-1">
                        Slide Heading / Title *
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. VAYRA HERITAGE LOAFERS"
                        value={slideFormData.title}
                        onChange={(e) => setSlideFormData({ ...slideFormData, title: e.target.value })}
                        className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>

                    <div>
                      <label className="block uppercase tracking-wider font-mono text-neutral-400 font-bold mb-1">
                        Subtitle / Highlights
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Italian Calfskin • Goodyear Welted"
                        value={slideFormData.subtitle}
                        onChange={(e) => setSlideFormData({ ...slideFormData, subtitle: e.target.value })}
                        className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block uppercase tracking-wider font-mono text-neutral-400 font-bold mb-1">
                          Tag Text
                        </label>
                        <input
                          type="text"
                          placeholder="SIGNATURE COLLECTION"
                          value={slideFormData.tag}
                          onChange={(e) => setSlideFormData({ ...slideFormData, tag: e.target.value })}
                          className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#C5A059]"
                        />
                      </div>

                      <div>
                        <label className="block uppercase tracking-wider font-mono text-neutral-400 font-bold mb-1">
                          Button CTA Text
                        </label>
                        <input
                          type="text"
                          placeholder="Shop Collection"
                          value={slideFormData.buttonText}
                          onChange={(e) => setSlideFormData({ ...slideFormData, buttonText: e.target.value })}
                          className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#C5A059]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block uppercase tracking-wider font-mono text-neutral-400 font-bold mb-1">
                        Button Link Target
                      </label>
                      <input
                        type="text"
                        placeholder="#catalog or URL"
                        value={slideFormData.buttonLink}
                        onChange={(e) => setSlideFormData({ ...slideFormData, buttonLink: e.target.value })}
                        className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>

                    <div>
                      <label className="block uppercase tracking-wider font-mono text-neutral-400 font-bold mb-1">
                        Slide Image URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={slideFormData.image}
                        onChange={(e) => setSlideFormData({ ...slideFormData, image: e.target.value })}
                        className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-neutral-400 mb-1">
                        Or Upload Slide Image from Device:
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSlideFileSelect}
                        className="text-xs text-neutral-400 file:mr-3 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-neutral-800 file:text-[#F5F2EB] hover:file:bg-[#C5A059] hover:file:text-black cursor-pointer"
                      />
                    </div>

                    <div className="pt-2 border-t border-neutral-900 flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={slideFormData.active}
                          onChange={(e) => setSlideFormData({ ...slideFormData, active: e.target.checked })}
                          className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 text-[#C5A059] focus:ring-0"
                        />
                        <span className="font-bold text-neutral-300">Active in Homepage Slider</span>
                      </label>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setIsSlideModalOpen(false)}
                          className="px-4 py-2 rounded-xl bg-neutral-900 text-neutral-300 font-bold border border-neutral-800 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSlideSubmitting}
                          className="px-5 py-2 rounded-xl bg-[#F5F2EB] text-black font-bold uppercase tracking-wider hover:bg-[#C5A059] transition"
                        >
                          {isSlideSubmitting ? "Saving..." : editingSlide ? "Save Changes" : "Publish Slide"}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB 4: ORDERS MANAGEMENT */}
        {/* ============================================================= */}
        {activeTab === "orders" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between bg-[#0A0A0A] p-4 rounded-2xl border border-neutral-900">
              <div>
                <h3 className="font-serif font-black uppercase tracking-wider text-white text-sm">
                  Customer Order Invoices ({ordersList.length})
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Manage WhatsApp confirmations and delivery dispatches.
                </p>
              </div>

              <button
                onClick={loadData}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-[#C5A059] hover:text-white cursor-pointer"
              >
                Sync Orders
              </button>
            </div>

            {ordersList.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-neutral-800 rounded-3xl p-8 bg-neutral-950">
                <ShoppingBag size={32} className="mx-auto text-neutral-600 mb-2" />
                <h4 className="text-sm font-serif font-bold text-white mb-1">No customer orders yet</h4>
                <p className="text-xs text-neutral-500">
                  When patrons place footwear orders, their WhatsApp invoices will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {ordersList.map((order, idx) => {
                  const orderId = order.orderNumber || order.id || `VF-${idx + 1001}`;
                  const status = order.status || "PLACED";
                  const items = Array.isArray(order.items) ? order.items : [];

                  return (
                    <div
                      key={orderId}
                      className="bg-[#0A0A0A] border border-neutral-900 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-900">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-sm text-[#F5F2EB]">
                            #{orderId}
                          </span>
                          <span className="text-[10px] text-neutral-500 font-mono">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "Recent Order"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-mono text-neutral-400">Status:</span>
                          <select
                            value={status}
                            onChange={(e) => handleOrderStatusChange(orderId, e.target.value)}
                            className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border focus:outline-none cursor-pointer ${
                              status === "DELIVERED"
                                ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                                : status === "DISPATCHED"
                                ? "bg-blue-950 text-blue-300 border-blue-800"
                                : status === "CONFIRMED"
                                ? "bg-[#C5A059]/20 text-[#C5A059] border-[#C5A059]/40"
                                : "bg-neutral-900 text-amber-300 border-amber-800"
                            }`}
                          >
                            <option value="PLACED">PLACED (Pending QR)</option>
                            <option value="CONFIRMED">CONFIRMED (Paid)</option>
                            <option value="DISPATCHED">DISPATCHED</option>
                            <option value="DELIVERED">DELIVERED</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs bg-neutral-950/60 p-4 rounded-2xl border border-neutral-800/80">
                        <div>
                          <span className="text-[9px] uppercase font-mono text-neutral-500 block">Customer</span>
                          <div className="font-bold text-white mt-0.5">{order.fullName || "Guest Patron"}</div>
                          <div className="text-neutral-400 font-mono flex items-center gap-1.5 mt-1">
                            <Phone size={11} className="text-[#C5A059]" />
                            <span>+91 {order.phone || "N/A"}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[9px] uppercase font-mono text-neutral-500 block">Delivery Address</span>
                          <div className="text-neutral-300 text-[11px] mt-0.5 leading-relaxed">
                            {order.address || `${order.houseNo || ""}, ${order.village || ""}, ${order.town || ""}, ${order.district || ""}, ${order.pincode || ""}`}
                          </div>
                        </div>

                        <div className="flex flex-col justify-between">
                          <div>
                            <span className="text-[9px] uppercase font-mono text-neutral-500 block">Grand Total</span>
                            <div className="font-serif font-black text-base text-[#F5F2EB] mt-0.5">
                              ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                            </div>
                            <div className="text-[9px] text-[#C5A059] font-mono">
                              Payment: {order.paymentMethod || "DIRECT_WHATSAPP_QR"}
                            </div>
                          </div>

                          {order.phone && (
                            <a
                              href={`https://wa.me/91${order.phone.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-[#C5A059] hover:underline font-bold mt-2"
                            >
                              <span>Chat on WhatsApp</span>
                              <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-mono font-bold text-neutral-400 block mb-2">
                          Footwear Items ({items.length})
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {items.map((item, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-2.5 bg-neutral-950 rounded-xl border border-neutral-900 text-xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {item.imageUrl && (
                                  <img
                                    src={item.imageUrl}
                                    alt=""
                                    className="w-9 h-11 object-cover rounded-lg bg-neutral-900 border border-neutral-800 shrink-0"
                                  />
                                )}
                                <div className="truncate">
                                  <span className="font-serif font-bold text-white block truncate">
                                    {item.productName || item.name}
                                  </span>
                                  <span className="text-[10px] text-neutral-400 font-mono">
                                    Size: <strong className="text-[#C5A059]">{item.size || "UK 8"}</strong> • Qty: {item.quantity || 1}
                                  </span>
                                </div>
                              </div>
                              <span className="font-mono text-white font-bold ml-2">
                                ₹{((Number(item.price) || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

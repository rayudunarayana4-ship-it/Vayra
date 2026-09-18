export const API_BASE_URL = (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) || "http://localhost:8082/api";

export const LOCAL_STORAGE_PRODUCTS_KEY = "vayra_footwear_admin_products";
export const LOCAL_STORAGE_SLIDES_KEY = "vayra_footwear_admin_slides";
export const LOCAL_STORAGE_ORDERS_KEY = "vayra_footwear_orders";
const SYNC_CHANNEL_NAME = "vayra_footwear_sync_channel";

// Initialize BroadcastChannel for cross-tab live synchronization
const syncChannel =
  typeof window !== "undefined" && "BroadcastChannel" in window
    ? new BroadcastChannel(SYNC_CHANNEL_NAME)
    : null;

/**
 * 1. Single Source of Truth Initializer
 * Reads strictly from localStorage('vayra_footwear_admin_products').
 * NEVER seeds mock or demo data. If empty, returns [].
 */
export const getInitialProducts = () => {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error reading initial products:", e);
  }
  return [];
};

export const getAdminProducts = getInitialProducts;

/**
 * Helper to get local stored products
 */
export const getLocalStoredProducts = () => {
  return getInitialProducts();
};

/**
 * Helper to save local stored products and broadcast
 */
export const saveLocalStoredProducts = (products) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(products));
  } catch (e) {
    console.error("Failed to save local products:", e);
  }
};

/**
 * Helper to broadcast product updates to:
 * 1. BroadcastChannel (other open tabs)
 * 2. CustomEvent (same-tab subscribers)
 * 3. storage event (fallback for older browsers)
 */
export const notifyProductUpdate = (updatedList, action, details) => {
  saveLocalStoredProducts(updatedList);

  // Broadcast to other browser tabs
  if (syncChannel) {
    try {
      syncChannel.postMessage({
        type: "PRODUCTS_UPDATED",
        products: updatedList,
        action,
        details,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.warn("BroadcastChannel error:", err);
    }
  }

  // Broadcast within the same window
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("vayra_products_updated", {
        detail: { products: updatedList, action, details, timestamp: Date.now() },
      })
    );
  }
};

/**
 * Subscription listener for real-time live synchronization
 * Supports both BroadcastChannel (cross-tab) and CustomEvent (same-tab)
 */
export const subscribeToProductUpdates = (callback) => {
  const handleBroadcastMessage = (event) => {
    if (event?.data?.type === "PRODUCTS_UPDATED" && Array.isArray(event.data.products)) {
      callback(event.data.products, event.data.action, event.data.details);
    }
  };

  const handleCustomEvent = (event) => {
    if (event?.detail?.products && Array.isArray(event.detail.products)) {
      callback(event.detail.products, event.detail.action, event.detail.details);
    }
  };

  const handleStorageEvent = (e) => {
    if (e.key === LOCAL_STORAGE_PRODUCTS_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (Array.isArray(parsed)) {
          callback(parsed, "STORAGE_EVENT", null);
        }
      } catch (err) {
        console.error("Storage event parse error:", err);
      }
    }
  };

  if (syncChannel) {
    syncChannel.addEventListener("message", handleBroadcastMessage);
  }

  if (typeof window !== "undefined") {
    window.addEventListener("vayra_products_updated", handleCustomEvent);
    window.addEventListener("storage", handleStorageEvent);
  }

  return () => {
    if (syncChannel) {
      syncChannel.removeEventListener("message", handleBroadcastMessage);
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("vayra_products_updated", handleCustomEvent);
      window.removeEventListener("storage", handleStorageEvent);
    }
  };
};

/**
 * Slide / Banner Synchronization Layer
 * Main slides are completely controlled from Admin and stored in localStorage.
 */
export const getInitialSlides = () => {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_SLIDES_KEY);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error reading initial slides:", e);
  }
  return [];
};

export const saveLocalStoredSlides = (slides) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_SLIDES_KEY, JSON.stringify(slides));
  } catch (e) {
    console.error("Failed to save local slides:", e);
  }
};

export const notifySlideUpdate = (updatedList, action, details) => {
  saveLocalStoredSlides(updatedList);

  if (syncChannel) {
    try {
      syncChannel.postMessage({
        type: "SLIDES_UPDATED",
        slides: updatedList,
        action,
        details,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.warn("BroadcastChannel slide error:", err);
    }
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("vayra_slides_updated", {
        detail: { slides: updatedList, action, details, timestamp: Date.now() },
      })
    );
  }
};

export const subscribeToSlideUpdates = (callback) => {
  const handleBroadcastMessage = (event) => {
    if (event?.data?.type === "SLIDES_UPDATED" && Array.isArray(event.data.slides)) {
      callback(event.data.slides, event.data.action, event.data.details);
    }
  };

  const handleCustomEvent = (event) => {
    if (event?.detail?.slides && Array.isArray(event.detail.slides)) {
      callback(event.detail.slides, event.detail.action, event.detail.details);
    }
  };

  const handleStorageEvent = (e) => {
    if (e.key === LOCAL_STORAGE_SLIDES_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (Array.isArray(parsed)) {
          callback(parsed, "STORAGE_EVENT", null);
        }
      } catch (err) {
        console.error("Storage slide event parse error:", err);
      }
    }
  };

  if (syncChannel) {
    syncChannel.addEventListener("message", handleBroadcastMessage);
  }

  if (typeof window !== "undefined") {
    window.addEventListener("vayra_slides_updated", handleCustomEvent);
    window.addEventListener("storage", handleStorageEvent);
  }

  return () => {
    if (syncChannel) {
      syncChannel.removeEventListener("message", handleBroadcastMessage);
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("vayra_slides_updated", handleCustomEvent);
      window.removeEventListener("storage", handleStorageEvent);
    }
  };
};

export const fetchSlides = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/slides`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        saveLocalStoredSlides(data);
        return data;
      }
    }
  } catch (e) {
    console.warn("Slides fetch note (using local cache):", e);
  }
  return getInitialSlides();
};

export const createSlide = async (slidePayload) => {
  let savedSlide = null;
  try {
    const res = await fetch(`${API_BASE_URL}/slides`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(slidePayload),
    });
    if (res.ok) {
      savedSlide = await res.json();
    }
  } catch (err) {
    console.error("Failed to POST slide:", err);
  }

  if (!savedSlide) {
    const id = slidePayload.id || `slide-${Date.now().toString().slice(-6)}`;
    savedSlide = { ...slidePayload, id };
  }

  const currentList = getInitialSlides();
  const updatedList = [savedSlide, ...currentList.filter((s) => String(s.id) !== String(savedSlide.id))];
  notifySlideUpdate(updatedList, "CREATE", savedSlide);
  return savedSlide;
};

export const updateSlide = async (id, updatedFields) => {
  let updatedSlide = null;
  try {
    const res = await fetch(`${API_BASE_URL}/slides/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedFields),
    });
    if (res.ok) {
      updatedSlide = await res.json();
    }
  } catch (err) {
    console.error("Failed to PUT slide:", err);
  }

  if (!updatedSlide) {
    const currentList = getInitialSlides();
    const existing = currentList.find((s) => String(s.id) === String(id)) || { id };
    updatedSlide = { ...existing, ...updatedFields, id };
  }

  const currentList = getInitialSlides();
  const index = currentList.findIndex((s) => String(s.id) === String(id));
  let updatedList;
  if (index > -1) {
    updatedList = [...currentList];
    updatedList[index] = updatedSlide;
  } else {
    updatedList = [updatedSlide, ...currentList];
  }

  notifySlideUpdate(updatedList, "UPDATE", updatedSlide);
  return updatedSlide;
};

export const deleteSlide = async (id) => {
  try {
    await fetch(`${API_BASE_URL}/slides/${id}`, {
      method: "DELETE",
    });
  } catch (err) {
    console.error("Failed to DELETE slide:", err);
  }

  const currentList = getInitialSlides();
  const updatedList = currentList.filter((s) => String(s.id) !== String(id));
  notifySlideUpdate(updatedList, "DELETE", { id });
  return true;
};

/**
 * 2. Fetch Products (MySQL Database as Single Source of Truth)
 */
export const fetchProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        // Safe migration: If database is currently empty, but localStorage has existing VAYRA products:
        if (data.length === 0) {
          const localProducts = getInitialProducts();
          if (Array.isArray(localProducts) && localProducts.length > 0) {
            console.log("Migrating existing VAYRA local products to MySQL database...");
            const migrated = [];
            for (const p of localProducts) {
              try {
                const res = await fetch(`${API_BASE_URL}/products`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(p),
                });
                if (res.ok) {
                  migrated.push(await res.json());
                }
              } catch (err) {
                console.error("Migration error for product:", p.name, err);
              }
            }
            if (migrated.length > 0) {
              saveLocalStoredProducts(migrated);
              return migrated;
            }
          }
        }

        saveLocalStoredProducts(data);
        return data;
      }
    }
  } catch (e) {
    console.warn("Backend fetch note (using local fallback):", e);
  }
  return getInitialProducts();
};

/**
 * 3. Create Product (Persists to MySQL Database)
 */
export const createProduct = async (productPayload) => {
  const images = Array.isArray(productPayload.images)
    ? productPayload.images.filter((img) => typeof img === "string" && img.trim().length > 0)
    : (typeof productPayload.image === "string" && productPayload.image.trim() ? [productPayload.image.trim()] : []);

  const payload = {
    name: productPayload.name || "VAYRA Footwear",
    category: productPayload.category || "Sneakers",
    price: Number(productPayload.price) || 0,
    originalPrice: productPayload.originalPrice ? Number(productPayload.originalPrice) : null,
    stock: productPayload.stock !== undefined ? parseInt(productPayload.stock, 10) : 10,
    active: productPayload.active !== undefined ? productPayload.active : true,
    featured: Boolean(productPayload.featured),
    upperMaterial: productPayload.upperMaterial || "Full-Grain Leather",
    soleType: productPayload.soleType || "Sculpted EVA Cushion Cupsole",
    insole: productPayload.insole || "High-Density Ortho-Memory Bed",
    fit: productPayload.fit || "True to UK Size",
    care: productPayload.care || "Condition with beeswax cream; wipe with clean soft cloth.",
    description: productPayload.description || "",
    images,
    sizes: productPayload.sizes || ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    details: productPayload.details || ["Handcrafted precision lasting"],
  };

  let savedProduct = null;
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      savedProduct = await response.json();
    }
  } catch (err) {
    console.error("Failed to POST product to backend:", err);
  }

  if (!savedProduct) {
    savedProduct = { ...payload, id: productPayload.id || `vf-${Date.now().toString().slice(-6)}` };
  }

  const currentList = getInitialProducts();
  const updatedList = [savedProduct, ...currentList.filter((p) => String(p.id) !== String(savedProduct.id))];
  notifyProductUpdate(updatedList, "CREATE", savedProduct);
  return savedProduct;
};

/**
 * 4. Edit / Update Product (Persists to MySQL Database)
 */
export const updateProduct = async (id, updatedFields) => {
  const images = updatedFields.images !== undefined
    ? (Array.isArray(updatedFields.images)
        ? updatedFields.images.filter((img) => typeof img === "string" && img.trim().length > 0)
        : (typeof updatedFields.image === "string" && updatedFields.image.trim() ? [updatedFields.image.trim()] : []))
    : undefined;

  const payload = {
    ...updatedFields,
    ...(images !== undefined ? { images } : {}),
    price: updatedFields.price !== undefined ? Number(updatedFields.price) : undefined,
    originalPrice: updatedFields.originalPrice !== undefined ? Number(updatedFields.originalPrice) : undefined,
    stock: updatedFields.stock !== undefined ? parseInt(updatedFields.stock, 10) : undefined,
    active: updatedFields.active !== undefined ? Boolean(updatedFields.active) : undefined,
    featured: updatedFields.featured !== undefined ? Boolean(updatedFields.featured) : undefined,
  };

  let updatedProduct = null;
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      updatedProduct = await response.json();
    }
  } catch (err) {
    console.error("Failed to PUT product to backend:", err);
  }

  if (!updatedProduct) {
    const currentList = getInitialProducts();
    const existing = currentList.find((p) => String(p.id) === String(id)) || { id };
    updatedProduct = { ...existing, ...payload, id };
  }

  const currentList = getInitialProducts();
  const index = currentList.findIndex((p) => String(p.id) === String(id));
  let updatedList;
  if (index > -1) {
    updatedList = [...currentList];
    updatedList[index] = updatedProduct;
  } else {
    updatedList = [updatedProduct, ...currentList];
  }

  notifyProductUpdate(updatedList, "UPDATE", updatedProduct);
  return updatedProduct;
};

/**
 * 5. Delete Product (Persists Deletion in MySQL Database)
 */
export const deleteProduct = async (id) => {
  try {
    await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "DELETE",
    });
  } catch (err) {
    console.error("Failed to DELETE product on backend:", err);
  }

  const currentList = getInitialProducts();
  const updatedList = currentList.filter((p) => String(p.id) !== String(id));
  notifyProductUpdate(updatedList, "DELETE", { id });
  return true;
};

/**
 * 6. Order Storage & API
 */
export const getLocalStoredOrders = () => {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const saveLocalStoredOrder = (order) => {
  try {
    const existing = getLocalStoredOrders();
    const updated = [order, ...existing.filter((o) => o.orderNumber !== order.orderNumber)];
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save local order:", e);
  }
};

export const placeOrderApi = async (orderPayload) => {
  saveLocalStoredOrder(orderPayload);

  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn("Backend offline, cached order locally:", error.message);
  }

  return orderPayload;
};

export const fetchAllOrders = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`);
    if (response.ok) {
      const backendOrders = await response.json();
      if (Array.isArray(backendOrders) && backendOrders.length > 0) {
        return backendOrders;
      }
    }
  } catch (error) {
    // Backend offline
  }

  return getLocalStoredOrders();
};

export const updateOrderStatusApi = async (orderId, newStatus) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    // Backend offline
  }

  const orders = getLocalStoredOrders();
  const updated = orders.map((o) =>
    o.orderNumber === orderId || o.id === orderId ? { ...o, status: newStatus } : o
  );
  localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(updated));
  return { orderId, status: newStatus };
};

/**
 * 8. Backend Connectivity Health Check
 */
export const checkBackendHealth = async () => {
  const start = performance.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${API_BASE_URL}/products`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeoutId);

    const latency = Math.round(performance.now() - start);
    return {
      connected: res.ok,
      status: res.status,
      latency,
      url: API_BASE_URL,
    };
  } catch (error) {
    return {
      connected: false,
      status: 0,
      latency: 0,
      error: error.message,
      url: API_BASE_URL,
    };
  }
};
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api";

// 1. Fetch all shirts catalog
export const fetchProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error("Failed to connect to backend:", error);
    return [];
  }
};

// 2. Upload product with multipart images (from device)
export const uploadProductWithDeviceFiles = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload failed (${response.status}): ${errorText}`);
  }

  return await response.json();
};

// 3. Save customer order & delivery details into MySQL
export const placeOrderApi = async (orderPayload) => {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderPayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Order placement failed (${response.status}): ${errorText}`);
  }

  return await response.json();
};

// 4. Fetch all customer orders (for admin/order dashboard)
export const fetchAllOrders = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return [];
  }
};
import React, { useState } from "react";
import { generateOrderInvoicePDF } from "../utils/generateInvoicePdf";

// Set your official 10-digit number with 91 prefix
const FOUNDER_WHATSAPP_NUMBER = "917396811099"; 
const API_BASE_URL = "http://localhost:8081/api";

export const CheckoutPage = ({ items = [], onBack, onOrderSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    houseNo: "",
    landmark: "",
    village: "",
    town: "",
    mandal: "",
    district: "",
    state: "Andhra Pradesh",
    pincode: "",
    addressType: "Home",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );
  const totalAmount = subtotal;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrderAndWhatsApp = async (e) => {
    e.preventDefault();

    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.houseNo ||
      !formData.village ||
      !formData.town ||
      !formData.mandal ||
      !formData.district ||
      !formData.pincode
    ) {
      alert("Please fill in all mandatory delivery details (House No, Village/Street, Town, Mandal, District, Pincode).");
      return;
    }

    try {
      setIsSubmitting(true);
      const orderNumber = "TB-" + Math.floor(100000 + Math.random() * 900000);

      // Concatenated summary string for legacy schema compatibility
      const fullAddressString = `D.No: ${formData.houseNo}, Near ${formData.landmark || "N/A"}, ${formData.village}, Mandal: ${formData.mandal}, ${formData.town}, ${formData.district}, ${formData.state}`;

      const orderPayload = {
        orderNumber,
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        houseNo: formData.houseNo,
        landmark: formData.landmark,
        village: formData.village,
        town: formData.town,
        mandal: formData.mandal,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode,
        address: fullAddressString,
        locality: formData.mandal,
        city: formData.town,
        addressType: formData.addressType,
        paymentMethod: "DIRECT_WHATSAPP_QR",
        totalAmount,
        status: "PLACED",
        items: items.map((item) => ({
          productName: item.name || item.title,
          size: item.selectedSize || "M",
          quantity: item.quantity || 1,
          price: item.price,
          imageUrl: item.images?.[0] || item.image || "",
        })),
      };

      // 1. Save order into Spring Boot / MySQL ledger
      try {
        await fetch(`${API_BASE_URL}/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload),
        });
      } catch (err) {
        console.warn("Backend order sync error:", err);
      }

      // 2. Generate and download Invoice PDF
      generateOrderInvoicePDF(orderPayload);

      // 3. Format WhatsApp Message with separated delivery fields
      const itemsListText = items
        .map(
          (item, idx) =>
            `${idx + 1}. *${item.name || item.title}* (Size: ${item.selectedSize || "M"}, Qty: ${item.quantity || 1}) - Rs. ${(Number(item.price) * Number(item.quantity || 1)).toLocaleString("en-IN")}`
        )
        .join("\n");

      const whatsappMessage = 
`*NEW ORDER REQUEST - TWO BROTHERS*

*Order ID:* ${orderNumber}
*Customer:* ${formData.fullName}
*WhatsApp:* +91 ${formData.phone}

*DETAILED SHIPPING ADDRESS:*
*House / Door No:* ${formData.houseNo}
*Landmark:* ${formData.landmark || "N/A"}
*Village / Street:* ${formData.village}
*Town / City:* ${formData.town}
*Mandal:* ${formData.mandal}
*District:* ${formData.district}
*State:* ${formData.state}
*Pincode:* ${formData.pincode}
*Type:* ${formData.addressType}

*ITEMS ORDERED:*
${itemsListText}

*GRAND TOTAL:* Rs. ${totalAmount.toLocaleString("en-IN")}
*Payment:* Direct UPI QR Code

_I have downloaded my invoice PDF. Please send your payment QR code to confirm._`;

      const encodedMessage = encodeURIComponent(whatsappMessage);
      const whatsappUrl = `https://wa.me/${FOUNDER_WHATSAPP_NUMBER}?text=${encodedMessage}`;

      if (onOrderSuccess) onOrderSuccess();

      // 4. Open WhatsApp directly
      window.open(whatsappUrl, "_blank");
    } catch (err) {
      console.error(err);
      alert("Error placing order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 font-sans pb-24 selection:bg-neutral-800">
      <header className="border-b border-neutral-900 bg-[#080808] px-4 md:px-8 py-4 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-xs font-bold text-neutral-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
          >
            &larr; Return to Store
          </button>
          <h1 className="font-serif font-black uppercase text-sm tracking-widest text-white">
            TWO BROTHERS • DIRECT CHECKOUT
          </h1>
          <div className="w-12" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        <form onSubmit={handlePlaceOrderAndWhatsApp} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Detailed Shipping Form */}
          <div className="lg:col-span-7 bg-[#0c0c0c] border border-neutral-800 rounded-3xl p-6 md:p-8 space-y-4">
            <h2 className="text-base font-serif font-black uppercase text-white tracking-wider mb-2">
              Delivery Address Details
            </h2>

            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                Full Name *
              </label>
              <input
                required
                type="text"
                name="fullName"
                placeholder="e.g. S. Venkat Reddy"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                  WhatsApp Contact *
                </label>
                <input
                  required
                  type="tel"
                  name="phone"
                  placeholder="9848012345"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="venkat@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Granular Address Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                  House No / Door No / Flat *
                </label>
                <input
                  required
                  type="text"
                  name="houseNo"
                  placeholder="D.No 4-12/1, Flat 301"
                  value={formData.houseNo}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                  Landmark
                </label>
                <input
                  type="text"
                  name="landmark"
                  placeholder="Opposite Temple / Beside Bank"
                  value={formData.landmark}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                  Village / Street / Colony *
                </label>
                <input
                  required
                  type="text"
                  name="village"
                  placeholder="Velampalem / Main Road"
                  value={formData.village}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                  Town / City *
                </label>
                <input
                  required
                  type="text"
                  name="town"
                  placeholder="Kakinada / Rajahmundry"
                  value={formData.town}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                  Mandal *
                </label>
                <input
                  required
                  type="text"
                  name="mandal"
                  placeholder="Pedapudi / Kakinada Rural"
                  value={formData.mandal}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                  District *
                </label>
                <input
                  required
                  type="text"
                  name="district"
                  placeholder="Kakinada / East Godavari"
                  value={formData.district}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                  State *
                </label>
                <input
                  required
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                  Pincode *
                </label>
                <input
                  required
                  type="text"
                  name="pincode"
                  placeholder="533001"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1.5">
                Address Tag
              </label>
              <div className="flex gap-2">
                {["Home", "Office", "Other"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setFormData({ ...formData, addressType: tag })}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      formData.addressType === tag
                        ? "bg-amber-400 text-black font-bold"
                        : "bg-neutral-900 text-neutral-400 border border-neutral-800"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & QR Payment Notice */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#0c0c0c] border border-neutral-800 rounded-3xl p-6 md:p-8 space-y-4 shadow-xl">
              <h2 className="text-base font-serif font-black uppercase text-white tracking-wider">
                Order Summary ({items.length})
              </h2>

              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 bg-neutral-950 border border-neutral-900 rounded-xl p-2.5 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {(item.images?.[0] || item.image) && (
                        <img
                          src={item.images?.[0] || item.image}
                          alt=""
                          className="w-10 h-12 object-cover rounded bg-neutral-900 border border-neutral-800 shrink-0"
                        />
                      )}
                      <div className="truncate">
                        <div className="font-serif font-bold text-white truncate">{item.name || item.title}</div>
                        <div className="text-[10px] text-neutral-400">
                          Size: <strong className="text-amber-300">{item.selectedSize || "M"}</strong> • Qty: {item.quantity || 1}
                        </div>
                      </div>
                    </div>
                    <div className="font-mono font-bold text-white text-xs shrink-0">
                      ₹{((Number(item.price) || 0) * (Number(item.quantity) || 1)).toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-neutral-900 pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-white">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Express Shipping</span>
                  <span className="text-emerald-400 font-bold uppercase text-[10px]">Free</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-neutral-900">
                  <span>Total Payable</span>
                  <span className="font-serif font-black text-amber-300 text-base">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="bg-neutral-950 border border-neutral-800/80 rounded-2xl p-4 space-y-2">
                <div className="text-amber-400 font-bold text-xs uppercase">
                  Direct WhatsApp QR Protocol
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Upon placing the order, your **Invoice PDF** will download automatically. We will message you on WhatsApp with our **Payment QR Code** to confirm garment reservation.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-2xl transition shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <span>{isSubmitting ? "Generating Invoice..." : "Place Order & Pay via WhatsApp"}</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>

        </form>
      </main>
    </div>
  );
};
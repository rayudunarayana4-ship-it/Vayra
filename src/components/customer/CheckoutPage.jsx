import React, { useState } from "react";
import { generateOrderInvoicePDF } from "../../utils/generateInvoicePdf";
import { ShieldCheck, Truck, ArrowLeft, Send } from "lucide-react";
import { placeOrderApi } from "../../services/api";

// Official 10-digit WhatsApp contact
const FOUNDER_WHATSAPP_NUMBER = "917396811099";

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
      const orderNumber = "VF-" + Math.floor(100000 + Math.random() * 900000);

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
          size: item.selectedSize || "UK 8",
          quantity: item.quantity || 1,
          price: item.price,
          imageUrl: item.images?.[0] || item.image || "",
          upperMaterial: item.upperMaterial || item.material || "",
        })),
      };

      // 1. Save order into VAYRA order store
      try {
        await placeOrderApi(orderPayload);
      } catch (err) {
        console.warn("Order save note:", err);
      }

      // 2. Generate and download Invoice PDF
      generateOrderInvoicePDF(orderPayload);

      // 3. Format WhatsApp Message
      const itemsListText = items
        .map(
          (item, idx) =>
            `${idx + 1}. *${item.name || item.title}* (Size: ${item.selectedSize || "UK 8"}, Qty: ${item.quantity || 1}) - Rs. ${(Number(item.price) * Number(item.quantity || 1)).toLocaleString("en-IN")}`
        )
        .join("\n");

      const whatsappMessage = 
`*NEW ORDER REQUEST - VAYRA FOOTWEAR*
_Step Into Your Style._

*Order ID:* ${orderNumber}
*Customer:* ${formData.fullName}
*WhatsApp:* +91 ${formData.phone}

*SHIPPING & DELIVERY ADDRESS:*
*House / Door No:* ${formData.houseNo}
*Landmark:* ${formData.landmark || "N/A"}
*Village / Street:* ${formData.village}
*Town / City:* ${formData.town}
*Mandal:* ${formData.mandal}
*District:* ${formData.district}
*State:* ${formData.state}
*Pincode:* ${formData.pincode}
*Tag:* ${formData.addressType}

*FOOTWEAR ARTICLES ORDERED:*
${itemsListText}

*GRAND TOTAL:* Rs. ${totalAmount.toLocaleString("en-IN")}
*Payment Protocol:* Direct UPI QR Code

_I have downloaded my official VAYRA invoice PDF. Please share your payment QR code to confirm footwear reservation._`;

      const encodedMessage = encodeURIComponent(whatsappMessage);
      const whatsappUrl = `https://wa.me/${FOUNDER_WHATSAPP_NUMBER}?text=${encodedMessage}`;

      if (onOrderSuccess) onOrderSuccess();

      // 4. Open WhatsApp
      window.open(whatsappUrl, "_blank");
    } catch (err) {
      console.error(err);
      alert("Error processing order. Please check connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 font-sans pb-24 selection:bg-[#C5A059] selection:text-black">
      {/* Top Bar */}
      <header className="border-b border-neutral-900 bg-[#080808]/95 backdrop-blur-md px-4 md:px-8 py-4 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-xs font-bold text-neutral-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
          >
            <ArrowLeft size={14} /> Return to Store
          </button>
          <div className="text-center">
            <h1 className="font-serif font-black uppercase text-sm md:text-base tracking-[0.25em] text-white">
              VAYRA FOOTWEAR
            </h1>
            <span className="text-[8px] uppercase tracking-widest text-[#C5A059] font-mono">
              DIRECT SECURE CHECKOUT
            </span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        <form onSubmit={handlePlaceOrderAndWhatsApp} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Detailed Indian Shipping Form */}
          <div className="lg:col-span-7 bg-[#0a0a0a] border border-neutral-900 rounded-3xl p-6 md:p-8 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-900">
              <h2 className="text-base font-serif font-black uppercase text-white tracking-wider">
                1. Delivery & Address Details
              </h2>
              <span className="text-[10px] text-[#C5A059] font-mono uppercase">
                Pan-India Express
              </span>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Full Name *
              </label>
              <input
                required
                type="text"
                name="fullName"
                placeholder="e.g. Rahul Sharma"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full bg-neutral-900/70 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  WhatsApp Number *
                </label>
                <input
                  required
                  type="tel"
                  name="phone"
                  placeholder="9848012345"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-900/70 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#C5A059] font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="rahul@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-900/70 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>

            {/* Address Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  House / Door / Flat No *
                </label>
                <input
                  required
                  type="text"
                  name="houseNo"
                  placeholder="D.No 5-21/4, Flat 402"
                  value={formData.houseNo}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-900/70 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Landmark
                </label>
                <input
                  type="text"
                  name="landmark"
                  placeholder="Near Metro Station / Temple"
                  value={formData.landmark}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-900/70 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Village / Street / Colony *
                </label>
                <input
                  required
                  type="text"
                  name="village"
                  placeholder="Gandhi Nagar / Main Street"
                  value={formData.village}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-900/70 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Town / City *
                </label>
                <input
                  required
                  type="text"
                  name="town"
                  placeholder="Kakinada / Hyderabad"
                  value={formData.town}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-900/70 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Mandal *
                </label>
                <input
                  required
                  type="text"
                  name="mandal"
                  placeholder="Kakinada Urban"
                  value={formData.mandal}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-900/70 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  District *
                </label>
                <input
                  required
                  type="text"
                  name="district"
                  placeholder="Kakinada / East Godavari"
                  value={formData.district}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-900/70 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  State *
                </label>
                <input
                  required
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-900/70 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Pincode (6-Digits) *
                </label>
                <input
                  required
                  type="text"
                  name="pincode"
                  placeholder="533001"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-900/70 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#C5A059] font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
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
                        ? "bg-[#F5F2EB] text-black font-bold shadow"
                        : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary & WhatsApp QR Notice */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#0a0a0a] border border-neutral-900 rounded-3xl p-6 md:p-8 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-900">
                <h2 className="text-base font-serif font-black uppercase text-white tracking-wider">
                  2. Order Summary
                </h2>
                <span className="text-xs font-mono text-[#C5A059] font-bold">
                  {items.length} {items.length === 1 ? "Pair" : "Pairs"}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 bg-neutral-950 border border-neutral-900 rounded-2xl p-2.5 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {(item.images?.[0] || item.image) && (
                        <img
                          src={item.images?.[0] || item.image}
                          alt=""
                          className="w-12 h-14 object-cover rounded-lg bg-neutral-900 border border-neutral-800 shrink-0"
                        />
                      )}
                      <div className="truncate">
                        <div className="font-serif font-bold text-white truncate">{item.name || item.title}</div>
                        <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                          Size: <strong className="text-[#C5A059]">{item.selectedSize || "UK 8"}</strong> • Qty: {item.quantity || 1}
                        </div>
                      </div>
                    </div>
                    <div className="font-mono font-bold text-white text-xs shrink-0">
                      ₹{((Number(item.price) || 0) * (Number(item.quantity) || 1)).toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>

              {/* Cost Breakdown */}
              <div className="border-t border-neutral-900 pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-white">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Expedited Courier (Pan-India)</span>
                  <span className="text-emerald-400 font-bold uppercase text-[10px] font-mono">Free</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2.5 border-t border-neutral-900">
                  <span>Total Payable</span>
                  <span className="font-serif font-black text-[#F5F2EB] text-base font-mono">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* QR Protocol Info Box */}
              <div className="bg-neutral-950 border border-neutral-800/80 rounded-2xl p-4 space-y-1.5">
                <div className="text-[#C5A059] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={14} /> Direct WhatsApp QR Protocol
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed font-light">
                  Upon placing your order, your official **VAYRA Invoice PDF** will download instantly. We will connect with you on WhatsApp with our **Payment QR Code** to confirm your pair reservation.
                </p>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className="w-full py-4 bg-[#F5F2EB] hover:bg-[#C5A059] text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
              >
                <Send size={14} />
                <span>{isSubmitting ? "Generating VAYRA Invoice..." : "Place Order & Pay via WhatsApp"}</span>
              </button>
            </div>
          </div>

        </form>
      </main>
    </div>
  );
};
import React, { useState } from "react";
import { X, Plus, Trash2, CheckCircle2, ShieldAlert } from "lucide-react";
import { createProduct } from "../services/api";

export const AdminProductModal = ({ isOpen, onClose, onProductAdded }) => {
  const [formData, setFormData] = useState({
    name: "",
    dropName: "Drop 1",
    fabric: "100% Organic Cotton",
    fit: "Boxy Fit",
    type: "Casual Shirt",
    price: "",
    rating: 4.8,
    reviewsCount: 1,
    gsm: "240 GSM",
    description: "",
  });

  const [images, setImages] = useState([""]);
  const [sizes, setSizes] = useState(["S", "M", "L", "XL"]);
  const [details, setDetails] = useState(["Pre-shrunk comb cotton", "Drop shoulder fit"]);
  const [detailInput, setDetailInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleImageChange = (index, value) => {
    const updated = [...images];
    updated[index] = value;
    setImages(updated);
  };

  const addImageField = () => setImages([...images, ""]);
  const removeImageField = (index) => setImages(images.filter((_, i) => i !== index));

  const toggleSize = (size) => {
    if (sizes.includes(size)) {
      setSizes(sizes.filter((s) => s !== size));
    } else {
      setSizes([...sizes, size]);
    }
  };

  const addDetailBullet = (e) => {
    e.preventDefault();
    if (!detailInput.trim()) return;
    setDetails([...details, detailInput.trim()]);
    setDetailInput("");
  };

  const removeDetailBullet = (index) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        images: images.filter((img) => img.trim() !== ""),
        sizes,
        details,
      };

      const newProduct = await createProduct(payload);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onProductAdded(newProduct);
        onClose();
      }, 1200);
    } catch (err) {
      alert("Failed to save shirt to database. Ensure Spring Boot is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0c0c0c] border border-neutral-800 rounded-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-6">
          <div className="flex items-center gap-2">
            <ShieldAlert size={20} className="text-amber-400" />
            <h2 className="text-lg md:text-xl font-serif font-black uppercase tracking-wider text-white">
              Owner Portal • Add New Shirt
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
            <CheckCircle2 size={48} className="text-emerald-400 animate-bounce" />
            <span className="text-lg font-serif font-bold text-white">
              Product Published Successfully!
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            
            {/* Shirt Title & Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block uppercase tracking-wider text-neutral-400 font-bold mb-1.5">
                  Shirt Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Heavyweight Boxy Oxford"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-neutral-400 font-bold mb-1.5">
                  Price (INR ₹) *
                </label>
                <input
                  required
                  type="number"
                  placeholder="2499"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Drop, Fit, Fabric & GSM */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block uppercase tracking-wider text-neutral-400 font-bold mb-1.5">Drop</label>
                <select
                  value={formData.dropName}
                  onChange={(e) => setFormData({ ...formData, dropName: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-2 text-white"
                >
                  <option>Drop 1</option>
                  <option>Drop 2</option>
                  <option>Drop 3</option>
                </select>
              </div>

              <div>
                <label className="block uppercase tracking-wider text-neutral-400 font-bold mb-1.5">Fit</label>
                <select
                  value={formData.fit}
                  onChange={(e) => setFormData({ ...formData, fit: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-2 text-white"
                >
                  <option>Boxy Fit</option>
                  <option>Relaxed Fit</option>
                  <option>Oversized</option>
                  <option>Regular Fit</option>
                </select>
              </div>

              <div>
                <label className="block uppercase tracking-wider text-neutral-400 font-bold mb-1.5">Fabric</label>
                <input
                  type="text"
                  value={formData.fabric}
                  onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-2 text-white"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-neutral-400 font-bold mb-1.5">GSM Weight</label>
                <input
                  type="text"
                  placeholder="240 GSM"
                  value={formData.gsm}
                  onChange={(e) => setFormData({ ...formData, gsm: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-2 text-white"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block uppercase tracking-wider text-neutral-400 font-bold mb-1.5">Description</label>
              <textarea
                rows={3}
                placeholder="Product description, weave notes, and styling instructions..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Size Selectors */}
            <div>
              <label className="block uppercase tracking-wider text-neutral-400 font-bold mb-1.5">
                Available Sizes
              </label>
              <div className="flex gap-2">
                {["S", "M", "L", "XL", "XXL"].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => toggleSize(sz)}
                    className={`px-3 py-1.5 rounded font-bold border transition ${
                      sizes.includes(sz)
                        ? "bg-white text-black border-white"
                        : "bg-neutral-900 text-neutral-500 border-neutral-800"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Image URLs */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block uppercase tracking-wider text-neutral-400 font-bold">
                  Image URLs (Unsplash / Hosted Links)
                </label>
                <button
                  type="button"
                  onClick={addImageField}
                  className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Plus size={13} /> Add Image
                </button>
              </div>
              <div className="space-y-2">
                {images.map((img, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      required={i === 0}
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={img}
                      onChange={(e) => handleImageChange(i, e.target.value)}
                      className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white"
                    />
                    {images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageField(i)}
                        className="p-2 text-neutral-500 hover:text-red-400 bg-neutral-900 rounded-lg border border-neutral-800"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Bullets */}
            <div>
              <label className="block uppercase tracking-wider text-neutral-400 font-bold mb-1.5">
                Feature Bullets
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="e.g. Dropped shoulders, Mother-of-pearl buttons"
                  value={detailInput}
                  onChange={(e) => setDetailInput(e.target.value)}
                  className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white"
                />
                <button
                  type="button"
                  onClick={addDetailBullet}
                  className="px-4 py-2 bg-neutral-800 text-white rounded-lg font-bold hover:bg-neutral-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {details.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded-md text-[11px] text-neutral-300"
                  >
                    {item}
                    <X
                      size={12}
                      className="cursor-pointer hover:text-red-400"
                      onClick={() => removeDetailBullet(idx)}
                    />
                  </span>
                ))}
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-neutral-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-neutral-900 text-neutral-300 border border-neutral-800 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-white text-black font-bold uppercase tracking-wider hover:bg-amber-300 transition"
              >
                {loading ? "Publishing..." : "Upload Shirt"}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
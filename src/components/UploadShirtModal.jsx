import React, { useState, useRef } from "react";
import { X, Upload, ImagePlus, Trash2, CheckCircle2 } from "lucide-react";
import { uploadProductWithDeviceFiles } from "../services/api";

export const UploadShirtModal = ({ isOpen, onClose, onProductAdded }) => {
  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    dropName: "Drop 1",
    fabric: "100% Organic Cotton",
    fit: "Boxy Fit",
    type: "Casual Shirt",
    price: "",
    gsm: "240 GSM",
    description: "",
  });

  const [sizes, setSizes] = useState(["S", "M", "L", "XL"]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setSelectedFiles((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleSize = (size) => {
    setSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFiles || selectedFiles.length === 0) {
      alert("Please select at least one shirt image from your device.");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append("name", (formData.name || "").trim());
      data.append("dropName", formData.dropName || "Drop 1");
      data.append("fabric", formData.fabric || "100% Organic Cotton");
      data.append("fit", formData.fit || "Boxy Fit");
      data.append("type", formData.type || "Casual Shirt");
      data.append("price", parseFloat(formData.price) || 0.0);
      data.append("gsm", formData.gsm || "240 GSM");
      data.append("description", formData.description || "");

      if (sizes && sizes.length > 0) {
        sizes.forEach((sz) => data.append("sizes", sz));
      } else {
        ["S", "M", "L", "XL"].forEach((sz) => data.append("sizes", sz));
      }

      selectedFiles.forEach((file) => {
        if (file instanceof File) {
          data.append("files", file, file.name);
        }
      });

      const newProduct = await uploadProductWithDeviceFiles(data);

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onProductAdded) {
          onProductAdded(newProduct);
        }
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Upload error detail:", err);
      alert(err.message || "Upload failed. Check backend console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0c0c0c] border border-neutral-800 rounded-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-6">
          <h2 className="text-lg font-serif font-black uppercase tracking-wider text-white">
            Upload Shirt (From Device)
          </h2>
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
              Shirt Uploaded & Stored in Database!
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            <div>
              <label className="block uppercase tracking-wider text-neutral-400 font-bold mb-2">
                Shirt Photos *
              </label>

              <input
                type="file"
                multiple
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-neutral-800 hover:border-amber-400/80 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition bg-neutral-900/40 group"
              >
                <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-full group-hover:scale-110 transition mb-2">
                  <ImagePlus size={22} className="text-amber-400" />
                </div>
                <span className="text-neutral-200 font-bold">
                  Browse from Computer / Phone
                </span>
                <span className="text-[10px] text-neutral-500 mt-0.5">
                  Select 1 or more images (JPG, PNG, WEBP)
                </span>
              </div>

              {previews.length > 0 && (
                <div className="flex gap-3 overflow-x-auto mt-4 pb-2">
                  {previews.map((src, idx) => (
                    <div
                      key={idx}
                      className="relative w-20 h-24 rounded-lg overflow-hidden border border-neutral-700 shrink-0"
                    >
                      <img src={src} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-black/80 rounded text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block uppercase tracking-wider text-neutral-400 font-bold mb-1">
                  Shirt Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Heavyweight Boxy Oxford"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-neutral-400 font-bold mb-1">
                  Price (INR ₹) *
                </label>
                <input
                  required
                  type="number"
                  placeholder="2499"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block uppercase tracking-wider text-neutral-400 font-bold mb-1">Drop</label>
                <select
                  value={formData.dropName}
                  onChange={(e) => setFormData({ ...formData, dropName: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-white"
                >
                  <option>Drop 1</option>
                  <option>Drop 2</option>
                  <option>Drop 3</option>
                </select>
              </div>

              <div>
                <label className="block uppercase tracking-wider text-neutral-400 font-bold mb-1">Fit</label>
                <select
                  value={formData.fit}
                  onChange={(e) => setFormData({ ...formData, fit: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-white"
                >
                  <option>Boxy Fit</option>
                  <option>Relaxed Fit</option>
                  <option>Oversized</option>
                  <option>Regular Fit</option>
                </select>
              </div>

              <div>
                <label className="block uppercase tracking-wider text-neutral-400 font-bold mb-1">Fabric</label>
                <input
                  type="text"
                  value={formData.fabric}
                  onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-neutral-400 font-bold mb-1">GSM</label>
                <input
                  type="text"
                  value={formData.gsm}
                  onChange={(e) => setFormData({ ...formData, gsm: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block uppercase tracking-wider text-neutral-400 font-bold mb-1">Description</label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white"
                placeholder="Product description..."
              />
            </div>

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
                    className={`px-3.5 py-1.5 rounded font-bold border transition ${
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

            <div className="pt-4 border-t border-neutral-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-neutral-900 text-neutral-300 font-bold border border-neutral-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-white text-black font-bold uppercase tracking-wider hover:bg-amber-300 transition flex items-center gap-2"
              >
                <Upload size={14} />
                {loading ? "Uploading..." : "Save to Database"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Upload,
  Plus,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  TrendingUp,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

interface ProductFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState(initialData?.name || "");
  const [model, setModel] = useState(initialData?.model || "");
  const [brand, setBrand] = useState(initialData?.brand || "Haier");
  const [category, setCategory] = useState(initialData?.category || "Refrigerators");
  const [subcategory, setSubcategory] = useState(initialData?.subcategory || "");
  const [series, setSeries] = useState(initialData?.series || "");
  const [price, setPrice] = useState<string>(
    initialData?.price ? String(initialData.price) : ""
  );
  const [stockStatus, setStockStatus] = useState(initialData?.stockStatus || "In Stock");
  const [mainImage, setMainImage] = useState(
    initialData?.mainImage || "/assets/system/product-image-placeholder.webp"
  );
  const [gallery, setGallery] = useState<string[]>(initialData?.gallery || []);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || "");
  const [warranty, setWarranty] = useState(initialData?.warranty || "");
  const [featured, setFeatured] = useState<boolean>(Boolean(initialData?.featured));
  const [specialOffer, setSpecialOffer] = useState<boolean>(Boolean(initialData?.specialOffer));
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || "");

  // Specifications state: array of { key, value }
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>(() => {
    if (initialData?.specifications && typeof initialData.specifications === "object") {
      return Object.entries(initialData.specifications).map(([key, value]) => ({
        key,
        value: String(value),
      }));
    }
    return [
      { key: "Capacity", value: "" },
      { key: "Color", value: "" },
      { key: "Warranty", value: "" },
    ];
  });

  // Dynamic Categories and Brands
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [brandsList, setBrandsList] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setCategoriesList(d.categories || []))
      .catch(() => {});
    fetch("/api/admin/brands")
      .then((r) => r.json())
      .then((d) => setBrandsList(d.brands || []))
      .catch(() => {});
  }, []);

  // Spec helpers
  const handleAddSpecRow = () => {
    setSpecs([...specs, { key: "", value: "" }]);
  };

  const handleUpdateSpec = (index: number, field: "key" | "value", val: string) => {
    const updated = [...specs];
    updated[index][field] = val;
    setSpecs(updated);
  };

  const handleRemoveSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  // Gallery helpers
  const handleAddGalleryImage = () => {
    if (!newGalleryUrl.trim()) return;
    setGallery([...gallery, newGalleryUrl.trim()]);
    setNewGalleryUrl("");
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGallery(gallery.filter((_, i) => i !== index));
  };

  // File Upload Helper
  const [uploadingImage, setUploadingImage] = useState(false);
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isGallery = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "ah-electronics/products");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        if (isGallery) {
          setGallery([...gallery, data.url]);
        } else {
          setMainImage(data.url);
        }
        toast.success("Image uploaded successfully!");
      } else {
        toast.error(data.error || "Image upload failed. You can paste an image URL instead.");
      }
    } catch {
      toast.error("Upload failed. Ensure Cloudinary credentials are set, or paste a URL.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !model.trim() || !brand.trim() || !category.trim()) {
      toast.error("Please fill in all required fields: Name, Model, Brand, and Category");
      return;
    }

    setSubmitting(true);

    try {
      // Build specs object from key-value pairs
      const specsObject: Record<string, string> = {};
      specs.forEach((item) => {
        if (item.key.trim()) {
          specsObject[item.key.trim()] = item.value.trim();
        }
      });

      const payload = {
        name: name.trim(),
        model: model.trim(),
        brand: brand.trim(),
        category: category.trim(),
        subcategory: subcategory.trim(),
        series: series.trim(),
        price: price && !isNaN(parseFloat(price)) ? parseFloat(price) : null,
        stockStatus,
        mainImage: mainImage.trim() || "/assets/system/product-image-placeholder.webp",
        gallery,
        specifications: specsObject,
        shortDescription: shortDescription.trim(),
        warranty: warranty.trim(),
        availability: stockStatus,
        featured,
        specialOffer,
        seoTitle: seoTitle.trim(),
        seoDescription: seoDescription.trim(),
      };

      const endpoint = isEdit
        ? `/api/admin/products/${initialData.id}`
        : "/api/admin/products";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success(
          isEdit ? "Product updated successfully!" : "Product created successfully!"
        );
        router.push("/admin/products");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to save product");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred while saving product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
      {/* ── TOP ACTION HEADER ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold text-[#2B2B66]">
              {isEdit ? `Edit Product: ${initialData?.name}` : "Add New Product"}
            </h1>
            <p className="text-xs text-slate-500">
              Fill in product details, images, technical specifications and pricing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/admin/products"
            className="flex-1 sm:flex-none text-center px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 sm:flex-none justify-center px-5 py-2 rounded-lg bg-[#62648D] hover:bg-[#0f55bd] text-white text-xs font-bold shadow-sm transition flex items-center gap-2 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEdit ? "Update Product" : "Save Product"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT 2 COLUMNS: MAIN DETAILS ──────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="font-display text-sm font-bold text-[#2B2B66] border-b border-slate-100 pb-2">
              General Information
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Product Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. HSU-18HFP Inverter 1.5 Ton Air Conditioner"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#62648D] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Model Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. HSU-18HFP"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-[#62648D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Brand <span className="text-red-500">*</span>
                </label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:ring-2 focus:ring-[#62648D] focus:outline-none"
                >
                  {brandsList.length > 0 ? (
                    brandsList.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Haier">Haier</option>
                      <option value="Dawlance">Dawlance</option>
                      <option value="Orient">Orient</option>
                      <option value="Canon">Canon</option>
                      <option value="Atlas Honda">Atlas Honda</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:ring-2 focus:ring-[#62648D] focus:outline-none"
                >
                  {categoriesList.length > 0 ? (
                    categoriesList.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Air Conditioners">Air Conditioners</option>
                      <option value="Refrigerators">Refrigerators</option>
                      <option value="Deep Freezers">Deep Freezers</option>
                      <option value="Washing Machines">Washing Machines</option>
                      <option value="LED TVs">LED TVs</option>
                      <option value="Microwave Ovens & Air Fryers">
                        Microwave Ovens & Air Fryers
                      </option>
                      <option value="Water Dispensers">Water Dispensers</option>
                      <option value="Kitchen & Small Appliances">
                        Kitchen & Small Appliances
                      </option>
                      <option value="Motorcycles">Motorcycles</option>
                      <option value="Spare Parts & Accessories">
                        Spare Parts & Accessories
                      </option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Subcategory
                </label>
                <input
                  type="text"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  placeholder="e.g. Inverter Split, Double Door, 70cc"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#62648D] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Short Description
              </label>
              <textarea
                rows={3}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Key selling points, warranty highlights, or power efficiency description..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#62648D] focus:outline-none"
              />
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="font-display text-sm font-bold text-[#2B2B66] border-b border-slate-100 pb-2">
              Pricing & Stock Status
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Price (PKR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">
                    Rs.
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Leave empty for 'Contact for Price'"
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#62648D] focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {price && Number(price) > 0
                    ? `Displays as: PKR ${Number(price).toLocaleString("en-PK")}`
                    : "Will display as: 'Contact for Price' on the website"}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Stock Status
                </label>
                <select
                  value={stockStatus}
                  onChange={(e) => setStockStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:ring-2 focus:ring-[#62648D] focus:outline-none"
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                  <option value="Available on Order">Available on Order</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Warranty Information
                </label>
                <input
                  type="text"
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value)}
                  placeholder="e.g. 10 Years Compressor + 1 Year Parts"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#62648D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Product Series / Tag
                </label>
                <input
                  type="text"
                  value={series}
                  onChange={(e) => setSeries(e.target.value)}
                  placeholder="e.g. Thunder T3, Smart Inverter, Eco Series"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#62648D] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Technical Specifications Key-Value Table */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="font-display text-sm font-bold text-[#2B2B66]">
                  Technical Specifications
                </h3>
                <p className="text-[11px] text-slate-400">
                  Detailed technical attributes shown in the product specifications table
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddSpecRow}
                className="inline-flex items-center gap-1 px-3 py-1 rounded bg-blue-50 text-[#62648D] hover:bg-blue-100 text-xs font-bold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Row</span>
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {specs.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item.key}
                    onChange={(e) => handleUpdateSpec(index, "key", e.target.value)}
                    placeholder="Specification Name (e.g. Capacity)"
                    className="w-1/2 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-[#62648D] focus:outline-none"
                  />
                  <input
                    type="text"
                    value={item.value}
                    onChange={(e) => handleUpdateSpec(index, "value", e.target.value)}
                    placeholder="Value (e.g. 1.5 Ton / 18000 BTU)"
                    className="w-1/2 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-[#62648D] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(index)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                    title="Remove specification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT 1 COLUMN: IMAGERY & PROMOTIONS ───────────────── */}
        <div className="space-y-6">
          {/* Main Product Image */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="font-display text-sm font-bold text-[#2B2B66] border-b border-slate-100 pb-2">
              Main Product Image
            </h3>

            {/* Image Preview Box */}
            <div className="w-full aspect-square rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 flex flex-col items-center justify-center relative group overflow-hidden">
              {mainImage ? (
                <Image
                  src={mainImage}
                  alt="Product preview"
                  fill
                  className="object-contain p-2"
                />
              ) : (
                <div className="text-center text-slate-400">
                  <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No image provided</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Image URL
              </label>
              <input
                type="text"
                value={mainImage}
                onChange={(e) => setMainImage(e.target.value)}
                placeholder="https://... or /assets/..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#62648D] focus:outline-none"
              />
            </div>

            {/* Upload File to Cloudinary Button */}
            <div>
              <label className="w-full py-2 px-3 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100 transition">
                <Upload className="w-4 h-4 text-slate-500" />
                <span>{uploadingImage ? "Uploading..." : "Upload Image File"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, false)}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
              <p className="text-[10px] text-slate-400 mt-1 text-center">
                Supports JPG, PNG, WEBP.
              </p>
            </div>
          </div>

          {/* Gallery Images */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="font-display text-sm font-bold text-[#2B2B66] border-b border-slate-100 pb-2">
              Gallery Images ({gallery.length})
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={newGalleryUrl}
                onChange={(e) => setNewGalleryUrl(e.target.value)}
                placeholder="Paste additional image URL..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#62648D] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddGalleryImage}
                className="px-3 py-1.5 rounded-lg bg-[#2B2B66] text-white text-xs font-bold hover:bg-slate-800 transition"
              >
                Add
              </button>
            </div>

            {/* Gallery Thumbnails List */}
            {gallery.length > 0 && (
              <div className="grid grid-cols-3 gap-2 pt-2">
                {gallery.map((img, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-lg border border-slate-200 bg-slate-50 p-1 group"
                  >
                    <Image
                      src={img}
                      alt={`Gallery ${i}`}
                      fill
                      className="object-contain p-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Promotion Flags & SEO */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="font-display text-sm font-bold text-[#2B2B66] border-b border-slate-100 pb-2">
              Visibility & SEO
            </h3>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded text-[#62648D] focus:ring-0 w-4 h-4"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Featured Product
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Display prominently in the homepage Featured Products grid
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={specialOffer}
                  onChange={(e) => setSpecialOffer(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-0 w-4 h-4"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
                    Special Offer / Discount Deal
                  </p>
                  <p className="text-[11px] text-slate-400">
                    List on the Special Offers page and tag with offer badges
                  </p>
                </div>
              </label>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Custom SEO Title
                </label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Defaults to: Product Name | A H Electronics"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#62648D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  SEO Description
                </label>
                <textarea
                  rows={2}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Brief description for search engines..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#62648D] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

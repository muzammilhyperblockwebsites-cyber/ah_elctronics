"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Sliders,
  Plus,
  Edit,
  Trash2,
  X,
  Loader2,
  AlertTriangle,
  Upload,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminBannersPage() {
  const [slides, setSlides] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalType, setModalType] = useState<"slide" | "banner" | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [badge, setBadge] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaLink, setCtaLink] = useState("");
  const [imageDesktop, setImageDesktop] = useState("");
  const [imageMobile, setImageMobile] = useState("");
  const [active, setActive] = useState(true);

  // Delete state
  const [deleteCandidate, setDeleteCandidate] = useState<{ type: string; item: any } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [uploadingField, setUploadingField] = useState<"desktop" | "mobile" | null>(null);

  const handleBannerUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "desktop" | "mobile"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingField(target);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "ah-electronics/banners");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        if (target === "desktop") setImageDesktop(data.url);
        else setImageMobile(data.url);
        toast.success("Banner image uploaded!");
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch {
      toast.error("Upload failed. You can paste an image URL instead.");
    } finally {
      setUploadingField(null);
    }
  };

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/banners");
      const data = await res.json();
      if (res.ok) {
        setSlides(data.slides || []);
        setBanners(data.banners || []);
      }
    } catch {
      toast.error("Failed to load hero slides and banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openModal = (type: "slide" | "banner", item?: any) => {
    setModalType(type);
    setEditingItem(item || null);
    if (item) {
      setTitle(item.title);
      setSubtitle(item.subtitle || "");
      setDescription(item.description || item.tag || "");
      setBadge(item.badge || item.tag || "");
      setCtaText(item.ctaText || "Order on WhatsApp");
      setCtaLink(item.ctaLink || "/products");
      setImageDesktop(item.imageDesktop || "");
      setImageMobile(item.imageMobile || "");
      setActive(item.active !== undefined ? item.active : true);
    } else {
      setTitle("");
      setSubtitle("");
      setDescription("");
      setBadge("");
      setCtaText(type === "slide" ? "Order on WhatsApp" : "Order via WhatsApp");
      setCtaLink("/products");
      setImageDesktop("");
      setImageMobile("");
      setActive(true);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageDesktop.trim()) {
      toast.error("Title and Desktop Image are required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        type: modalType,
        data: {
          id: editingItem?.id,
          title: title.trim(),
          subtitle: subtitle.trim(),
          description: description.trim(),
          badge: badge.trim(),
          tag: badge.trim(),
          ctaText: ctaText.trim(),
          ctaLink: ctaLink.trim(),
          imageDesktop: imageDesktop.trim(),
          imageMobile: imageMobile.trim() || imageDesktop.trim(),
          active,
        },
      };

      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(
          editingItem
            ? `${modalType === "slide" ? "Hero slide" : "Banner"} updated!`
            : `${modalType === "slide" ? "Hero slide" : "Banner"} created!`
        );
        setModalType(null);
        fetchBanners();
      } else {
        toast.error(data.error || "Failed to save");
      }
    } catch {
      toast.error("Network error while saving");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/admin/banners?type=${deleteCandidate.type}&id=${deleteCandidate.item.id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        toast.success("Item removed successfully");
        setDeleteCandidate(null);
        fetchBanners();
      } else {
        toast.error("Delete failed");
      }
    } catch {
      toast.error("Network error deleting item");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div>
        <h1 className="font-display text-2xl font-bold text-[#2B2B66]">
          Hero Carousel & Promotional Banners
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage the interactive home hero carousel slides and high-impact promo banners
        </p>
      </div>

      {/* ── 1. HERO CAROUSEL SLIDES ─────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-bold text-[#2B2B66]">
              Hero Carousel Slides ({slides.length})
            </h2>
            <p className="text-xs text-slate-400">
              Rotates on the public homepage header with call-to-action buttons
            </p>
          </div>
          <button
            onClick={() => openModal("slide")}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#62648D] hover:bg-[#0f55bd] text-white text-xs font-bold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Slide</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
            >
              <div className="relative aspect-video w-full bg-slate-900">
                <Image
                  src={slide.imageDesktop}
                  alt={slide.title}
                  fill
                  className="object-cover"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-bold">
                  Slide {slide.order + 1}
                </span>
              </div>
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-[#62648D]">{slide.badge || "Featured"}</p>
                  <h3 className="font-bold text-sm text-[#2B2B66] line-clamp-1 mt-0.5">
                    {slide.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {slide.description || slide.subtitle}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium truncate max-w-[180px]">
                    Link: {slide.ctaLink}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openModal("slide", slide)}
                      className="p-1 text-slate-400 hover:text-emerald-600 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteCandidate({ type: "slide", item: slide })}
                      className="p-1 text-slate-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 2. PROMOTIONAL BANNERS ───────────────────────────────── */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-bold text-[#2B2B66]">
              Promotional Banners ({banners.length})
            </h2>
            <p className="text-xs text-slate-400">
              Middle-homepage promotional highlight banners with custom badges
            </p>
          </div>
          <button
            onClick={() => openModal("banner")}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#62648D] hover:bg-[#0f55bd] text-white text-xs font-bold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Banner</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
            >
              <div className="relative aspect-video w-full bg-slate-900">
                <Image
                  src={b.imageDesktop}
                  alt={b.title}
                  fill
                  className="object-cover"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#62648D] text-white text-[10px] font-bold">
                  {b.tag || "Promo"}
                </span>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-sm text-[#2B2B66]">{b.title}</h3>
                <p className="text-xs text-slate-500">{b.subtitle}</p>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">CTA: {b.ctaText}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openModal("banner", b)}
                      className="p-1 text-slate-400 hover:text-emerald-600 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteCandidate({ type: "banner", item: b })}
                      className="p-1 text-slate-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MODAL: ADD / EDIT BANNER OR SLIDE ────────────────────── */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalType(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display text-lg font-bold text-[#2B2B66] mb-4">
              {editingItem
                ? `Edit ${modalType === "slide" ? "Hero Slide" : "Banner"}`
                : `Add ${modalType === "slide" ? "Hero Slide" : "Banner"}`}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Main Headline / Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Smart Cooling Solutions"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#62648D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Subtitle or Tagline
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Up to 65% Energy Savings"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#62648D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Badge / Tag
                </label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="e.g. Authorized Dealer, Summer Special"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#62648D] focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider">
                    Desktop Image URL <span className="text-red-500">*</span>
                  </label>
                  <label className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#62648D] hover:underline cursor-pointer">
                    <Upload className="w-3 h-3" />
                    <span>{uploadingField === "desktop" ? "Uploading..." : "Upload File"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleBannerUpload(e, "desktop")}
                      className="hidden"
                      disabled={uploadingField !== null}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  required
                  value={imageDesktop}
                  onChange={(e) => setImageDesktop(e.target.value)}
                  placeholder="/assets/banners/hero-slide-1-desktop.webp"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#62648D] focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider">
                    Mobile Image URL (Optional)
                  </label>
                  <label className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#62648D] hover:underline cursor-pointer">
                    <Upload className="w-3 h-3" />
                    <span>{uploadingField === "mobile" ? "Uploading..." : "Upload File"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleBannerUpload(e, "mobile")}
                      className="hidden"
                      disabled={uploadingField !== null}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={imageMobile}
                  onChange={(e) => setImageMobile(e.target.value)}
                  placeholder="Defaults to desktop image if empty"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#62648D] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Button CTA Text
                  </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="Order on WhatsApp"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#62648D] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Button Link
                  </label>
                  <input
                    type="text"
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    placeholder="/products"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#62648D] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-[#62648D] hover:bg-[#0f55bd] text-white font-bold transition flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ─────────────────────────────────────────── */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900">
              Delete {deleteCandidate.type === "slide" ? "Slide" : "Banner"}
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Are you sure you want to delete &ldquo;{deleteCandidate.item.title}&rdquo;?
            </p>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteCandidate(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

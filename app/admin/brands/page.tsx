"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Award,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  X,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState("");

  // Delete modal
  const [deleteCandidate, setDeleteCandidate] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/brands");
      const data = await res.json();
      if (res.ok) {
        setBrands(data.brands || []);
      }
    } catch {
      toast.error("Failed to load brands");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const openAddModal = () => {
    setEditingBrand(null);
    setName("");
    setSlug("");
    setDescription("");
    setLogo("");
    setModalOpen(true);
  };

  const openEditModal = (b: any) => {
    setEditingBrand(b);
    setName(b.name);
    setSlug(b.slug);
    setDescription(b.description || "");
    setLogo(b.logo || "");
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Brand name is required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        logo: logo.trim(),
      };

      const endpoint = editingBrand
        ? `/api/admin/brands/${editingBrand.id}`
        : "/api/admin/brands";
      const method = editingBrand ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(editingBrand ? "Brand updated!" : "Brand created successfully!");
        setModalOpen(false);
        fetchBrands();
      } else {
        toast.error(data.error || "Failed to save brand");
      }
    } catch {
      toast.error("An error occurred while saving brand");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/brands/${deleteCandidate.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Brand "${deleteCandidate.name}" deleted`);
        setDeleteCandidate(null);
        fetchBrands();
      } else {
        toast.error(data.error || "Delete failed");
      }
    } catch {
      toast.error("Failed to delete brand");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl font-bold text-[#2B2B66]">
              Brand Partners
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#62648D] text-xs font-bold">
              {brands.length} Brands
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage authorized electronics brands, official logos and brand catalog pages
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#62648D] hover:bg-[#0f55bd] text-white text-xs font-bold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Brand</span>
        </button>
      </div>

      {/* ── BRANDS TABLE ─────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Brand</th>
                <th className="py-3.5 px-4">Slug</th>
                <th className="py-3.5 px-4">Assigned Products</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    Loading brands...
                  </td>
                </tr>
              ) : brands.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    No brands found. Click &ldquo;Add Brand&rdquo; to create one.
                  </td>
                </tr>
              ) : (
                brands.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-10 rounded-lg border border-slate-200 bg-white p-1 flex items-center justify-center shrink-0">
                          {b.logo ? (
                            <Image
                              src={b.logo}
                              alt={b.name}
                              width={40}
                              height={28}
                              className="object-contain max-h-full max-w-full"
                            />
                          ) : (
                            <Award className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <p className="font-bold text-slate-900">{b.name}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{b.slug}</td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/admin/products?brand=${encodeURIComponent(b.name)}`}
                        className="inline-flex items-center gap-1 font-bold text-[#62648D] hover:underline"
                      >
                        <span>{b.productCount} products</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                      {b.description || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(b)}
                          title="Edit Brand"
                          className="p-1.5 text-slate-400 hover:text-emerald-600 rounded transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteCandidate(b)}
                          title="Delete Brand"
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── ADD / EDIT MODAL ──────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display text-lg font-bold text-[#2B2B66] mb-4">
              {editingBrand ? `Edit Brand: ${editingBrand.name}` : "Add New Brand"}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Haier, Dawlance, Orient"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#62648D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  URL Slug (Optional)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. haier, dawlance (auto-generated if empty)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-[#62648D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Logo URL
                </label>
                <input
                  type="text"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="/assets/brands/brand-haier.svg"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#62648D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the brand..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#62648D] focus:outline-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
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
                  <span>{editingBrand ? "Update Brand" : "Create Brand"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ────────────────────────────── */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900">
              Delete Brand
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Are you sure you want to delete brand{" "}
              <span className="font-bold text-slate-800">
                &ldquo;{deleteCandidate.name}&rdquo;
              </span>
              ? If products are currently linked to this brand, deletion will be blocked.
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
                {deleting ? "Deleting..." : "Yes, Delete Brand"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

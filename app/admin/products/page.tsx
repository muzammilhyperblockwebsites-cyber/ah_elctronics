"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  MoreVertical,
  Trash2,
  Edit,
  Eye,
  CheckSquare,
  Square,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  X,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { formatPrice } from "@/lib/products";
import { toast } from "sonner";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [priceStatus, setPriceStatus] = useState("");
  const [stockStatus, setStockStatus] = useState("");
  const [featured, setFeatured] = useState("");
  const [specialOffer, setSpecialOffer] = useState("");
  const [sort, setSort] = useState("newest");

  // Selection
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Modals
  const [previewProduct, setPreviewProduct] = useState<any | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [bulkActionConfirm, setBulkActionConfirm] = useState<string | null>(null);

  // Categories & Brands list for filter dropdowns
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [brandsList, setBrandsList] = useState<any[]>([]);

  // Load filter options
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

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        sort,
      });

      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (brand) params.set("brand", brand);
      if (priceStatus) params.set("priceStatus", priceStatus);
      if (stockStatus) params.set("stockStatus", stockStatus);
      if (featured) params.set("featured", featured);
      if (specialOffer) params.set("specialOffer", specialOffer);

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setProducts(data.products || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
        setSelectedIds([]);
      } else {
        toast.error(data.error || "Failed to load products");
      }
    } catch {
      toast.error("Network error loading products");
    } finally {
      setLoading(false);
    }
  }, [page, search, category, brand, priceStatus, stockStatus, featured, specialOffer, sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle single delete
  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${deleteCandidate.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Deleted "${deleteCandidate.name}" successfully`);
        setDeleteCandidate(null);
        fetchProducts();
      } else {
        toast.error(data.error || "Delete failed");
      }
    } catch {
      toast.error("Network error deleting product");
    } finally {
      setDeleting(false);
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string, value?: boolean) => {
    if (selectedIds.length === 0) return;
    try {
      const res = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids: selectedIds, value }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Bulk action completed");
        setSelectedIds([]);
        setBulkActionConfirm(null);
        fetchProducts();
      } else {
        toast.error(data.error || "Bulk action failed");
      }
    } catch {
      toast.error("Network error executing bulk action");
    }
  };

  // Selection helpers
  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setCategory("");
    setBrand("");
    setPriceStatus("");
    setStockStatus("");
    setFeatured("");
    setSpecialOffer("");
    setSort("newest");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl font-bold text-[#2B2B66]">
              Products Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#62648D] text-xs font-bold">
              {total} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Search, filter, edit, and organize all catalog inventory items
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/products/import-export"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Import / Export</span>
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#62648D] hover:bg-[#0f55bd] text-white text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* ── FILTER TOOLBAR ───────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search name, model, brand..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#62648D]"
            />
          </div>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#62648D]"
          >
            <option value="">All Categories</option>
            {categoriesList.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name} ({c.productCount})
              </option>
            ))}
          </select>

          {/* Brand Filter */}
          <select
            value={brand}
            onChange={(e) => {
              setBrand(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#62648D]"
          >
            <option value="">All Brands</option>
            {brandsList.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name} ({b.productCount})
              </option>
            ))}
          </select>

          {/* Sort Filter */}
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#62648D]"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="price-asc">Sort: Price Low to High</option>
            <option value="price-desc">Sort: Price High to Low</option>
            <option value="name-asc">Sort: Name A to Z</option>
            <option value="name-desc">Sort: Name Z to A</option>
          </select>
        </div>

        {/* Secondary Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Price Status */}
            <select
              value={priceStatus}
              onChange={(e) => {
                setPriceStatus(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-md border border-slate-200 text-xs text-slate-600 bg-slate-50 focus:outline-none"
            >
              <option value="">All Prices</option>
              <option value="has-price">Has Price</option>
              <option value="contact-price">Contact for Price</option>
            </select>

            {/* Featured */}
            <select
              value={featured}
              onChange={(e) => {
                setFeatured(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-md border border-slate-200 text-xs text-slate-600 bg-slate-50 focus:outline-none"
            >
              <option value="">Featured: All</option>
              <option value="true">Featured Only</option>
              <option value="false">Not Featured</option>
            </select>

            {/* Special Offers */}
            <select
              value={specialOffer}
              onChange={(e) => {
                setSpecialOffer(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-md border border-slate-200 text-xs text-slate-600 bg-slate-50 focus:outline-none"
            >
              <option value="">Offers: All</option>
              <option value="true">On Offer</option>
              <option value="false">Standard Price</option>
            </select>

            {/* Stock */}
            <select
              value={stockStatus}
              onChange={(e) => {
                setStockStatus(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-md border border-slate-200 text-xs text-slate-600 bg-slate-50 focus:outline-none"
            >
              <option value="">Stock: All</option>
              <option value="In Stock">In Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>

          <button
            onClick={resetFilters}
            className="text-xs text-slate-500 hover:text-slate-800 underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* ── BULK ACTIONS BAR (Visible when items selected) ───────── */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-blue-900">
            <CheckSquare className="w-4 h-4 text-[#62648D]" />
            <span>{selectedIds.length} products selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkAction("toggle-featured", true)}
              className="px-2.5 py-1.5 rounded bg-white border border-blue-200 text-blue-700 hover:bg-blue-100 font-semibold"
            >
              Feature
            </button>
            <button
              onClick={() => handleBulkAction("toggle-offer", true)}
              className="px-2.5 py-1.5 rounded bg-white border border-blue-200 text-rose-700 hover:bg-rose-50 font-semibold"
            >
              Special Offer
            </button>
            <button
              onClick={() => setBulkActionConfirm("delete")}
              className="px-2.5 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>
          </div>
        </div>
      )}

      {/* ── PRODUCTS TABLE ───────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === products.length}
                    onChange={toggleSelectAll}
                    className="rounded text-[#62648D] focus:ring-0"
                  />
                </th>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Brand</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Badges</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#62648D]" />
                    <p>Loading products catalog...</p>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <p className="font-semibold text-slate-600">No products match your criteria</p>
                    <p className="text-[11px] mt-1">Try clearing filters or search query.</p>
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isSelected = selectedIds.includes(p.id);
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/80 transition ${
                        isSelected ? "bg-blue-50/40" : ""
                      }`}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(p.id)}
                          className="rounded text-[#62648D] focus:ring-0"
                        />
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg border border-slate-200 bg-slate-50 p-1 flex items-center justify-center shrink-0">
                            <Image
                              src={p.mainImage || "/assets/system/product-image-placeholder.webp"}
                              alt={p.name}
                              width={44}
                              height={44}
                              className="object-contain max-h-full max-w-full"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 line-clamp-1 hover:text-[#62648D] transition">
                              {p.name}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Model: <span className="font-mono">{p.model || "N/A"}</span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{p.brand}</td>
                      <td className="py-3 px-4">
                        <span className="text-slate-600 font-medium">{p.category}</span>
                        {p.subcategory && (
                          <p className="text-[10px] text-slate-400">{p.subcategory}</p>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#2B2B66]">
                        {p.price ? (
                          formatPrice(p.price)
                        ) : (
                          <span className="text-[10px] font-normal text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            Contact for Price
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            p.stockStatus === "Out of Stock"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {p.stockStatus || "In Stock"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap items-center gap-1">
                          {p.featured && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold">
                              <Sparkles className="w-2.5 h-2.5" /> Featured
                            </span>
                          )}
                          {p.specialOffer && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-semibold">
                              <TrendingUp className="w-2.5 h-2.5" /> Offer
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setPreviewProduct(p)}
                            title="Quick View"
                            className="p-1.5 text-slate-400 hover:text-[#62648D] hover:bg-blue-50 rounded transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            title="Edit Product"
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteCandidate(p)}
                            title="Delete Product"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* ── PAGINATION CONTROLS ─────────────────────────────────── */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing{" "}
            <span className="font-bold text-slate-700">
              {total === 0 ? 0 : (page - 1) * 20 + 1}
            </span>{" "}
            to{" "}
            <span className="font-bold text-slate-700">
              {Math.min(page * 20, total)}
            </span>{" "}
            of <span className="font-bold text-slate-700">{total}</span> products
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1 || loading}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-semibold text-slate-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages || loading}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── QUICK VIEW MODAL ─────────────────────────────────────── */}
      {previewProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
            <button
              onClick={() => setPreviewProduct(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row items-start gap-4 mb-6 pr-8">
              <div className="w-20 h-20 rounded-xl border border-slate-200 p-2 bg-slate-50 flex items-center justify-center shrink-0">
                <Image
                  src={previewProduct.mainImage || "/assets/system/product-image-placeholder.webp"}
                  alt={previewProduct.name}
                  width={70}
                  height={70}
                  className="object-contain max-h-full max-w-full"
                />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-[#62648D] uppercase">
                  {previewProduct.brand} • {previewProduct.category}
                </span>
                <h3 className="text-lg font-bold text-[#2B2B66] mt-0.5 break-words">
                  {previewProduct.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Model: <span className="font-mono">{previewProduct.model}</span>
                </p>
                <p className="text-base font-extrabold text-[#2B2B66] mt-2">
                  {previewProduct.price ? (
                    formatPrice(previewProduct.price)
                  ) : (
                    <span className="text-amber-600 text-xs font-semibold">
                      Contact for Price
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Gallery */}
            {previewProduct.gallery && previewProduct.gallery.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Image Gallery ({previewProduct.gallery.length})
                </h4>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {previewProduct.gallery.map((img: string, idx: number) => (
                    <div
                      key={idx}
                      className="w-16 h-16 rounded-lg border border-slate-200 bg-slate-50 p-1 shrink-0 flex items-center justify-center"
                    >
                      <Image
                        src={img}
                        alt="Gallery"
                        width={50}
                        height={50}
                        className="object-contain max-h-full max-w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specifications */}
            {previewProduct.specifications &&
              Object.keys(previewProduct.specifications).length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Specifications
                  </h4>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1.5 text-xs max-h-48 overflow-y-auto">
                    {Object.entries(previewProduct.specifications).map(([k, v]) => (
                      <div
                        key={k}
                        className="flex flex-col sm:flex-row sm:justify-between gap-1 py-1.5 border-b border-slate-200/60 last:border-0"
                      >
                        <span className="font-medium text-slate-500 break-words">{k}</span>
                        <span className="font-bold text-slate-800 sm:text-right break-words">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
              <Link
                href={`/products/${previewProduct.slug}`}
                target="_blank"
                className="text-[#62648D] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>View On Public Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <Link
                href={`/admin/products/${previewProduct.id}/edit`}
                className="px-4 py-2 rounded-lg bg-[#62648D] text-white font-bold hover:bg-[#0f55bd] transition"
              >
                Edit Product
              </Link>
            </div>
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
              Confirm Delete Product
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Are you sure you want to delete{" "}
              <span className="font-bold text-slate-800">
                &ldquo;{deleteCandidate.name}&rdquo;
              </span>{" "}
              (Model: {deleteCandidate.model})? This action cannot be undone.
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
                {deleting ? "Deleting..." : "Yes, Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BULK ACTION CONFIRM MODAL ────────────────────────────── */}
      {bulkActionConfirm === "delete" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900">
              Bulk Delete {selectedIds.length} Products
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Are you sure you want to delete all {selectedIds.length} selected products? This action will permanently remove them from the database.
            </p>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setBulkActionConfirm(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBulkAction("delete")}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition"
              >
                Delete {selectedIds.length} Items
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

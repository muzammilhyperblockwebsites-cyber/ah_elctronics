"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  TrendingUp,
  Search,
  Filter,
  Check,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { formatPrice } from "@/lib/products";
import { toast } from "sonner";

export default function AdminOffersPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewFilter, setViewFilter] = useState("all"); // 'all' | 'featured' | 'offers'
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (search) params.set("search", search);
      if (viewFilter === "featured") params.set("featured", "true");
      if (viewFilter === "offers") params.set("specialOffer", "true");

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products || []);
      }
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [search, viewFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleToggle = async (id: number, field: "featured" | "specialOffer", currentVal: boolean) => {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !currentVal }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(
          field === "featured"
            ? !currentVal
              ? "Added to Featured Products!"
              : "Removed from Featured Products"
            : !currentVal
            ? "Added to Special Offers!"
            : "Removed from Special Offers"
        );
        // Update local state instantly
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, [field]: !currentVal } : p))
        );
      } else {
        toast.error(data.error || "Update failed");
      }
    } catch {
      toast.error("Network error updating status");
    } finally {
      setTogglingId(null);
    }
  };

  const featuredCount = products.filter((p) => p.featured).length;
  const offerCount = products.filter((p) => p.specialOffer).length;

  return (
    <div className="space-y-6">
      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#2B2B66]">
            Special Offers & Featured Products
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quickly highlight products on the homepage or mark promotional discount deals
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{featuredCount} Featured on View</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
            <span>{offerCount} Offers on View</span>
          </div>
        </div>
      </div>

      {/* ── SEARCH & FILTER ──────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#62648D] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setViewFilter("all")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              viewFilter === "all"
                ? "bg-[#2B2B66] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Products
          </button>
          <button
            onClick={() => setViewFilter("featured")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 ${
              viewFilter === "featured"
                ? "bg-amber-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Featured Only</span>
          </button>
          <button
            onClick={() => setViewFilter("offers")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 ${
              viewFilter === "offers"
                ? "bg-rose-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            <span>Offers Only</span>
          </button>
        </div>
      </div>

      {/* ── PRODUCTS TOGGLE TABLE ────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Brand</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4 text-center">Featured (Home Grid)</th>
                <th className="py-3.5 px-4 text-center">Special Offer</th>
                <th className="py-3.5 px-4 text-right">Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#62648D]" />
                    <p>Loading products...</p>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md border border-slate-200 bg-slate-50 p-1 flex items-center justify-center shrink-0">
                          <Image
                            src={p.mainImage || "/assets/system/product-image-placeholder.webp"}
                            alt={p.name}
                            width={36}
                            height={36}
                            className="object-contain max-h-full max-w-full"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 line-clamp-1">{p.name}</p>
                          <p className="text-[11px] text-slate-400">Model: {p.model}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{p.brand}</td>
                    <td className="py-3 px-4 font-bold text-[#2B2B66]">
                      {p.price ? (
                        formatPrice(p.price)
                      ) : (
                        <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          Contact for Price
                        </span>
                      )}
                    </td>

                    {/* Featured Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        disabled={togglingId === p.id}
                        onClick={() => handleToggle(p.id, "featured", p.featured)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition ${
                          p.featured
                            ? "bg-amber-100 text-amber-800 border border-amber-300 shadow-xs"
                            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                        }`}
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{p.featured ? "Featured" : "Disabled"}</span>
                      </button>
                    </td>

                    {/* Special Offer Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        disabled={togglingId === p.id}
                        onClick={() => handleToggle(p.id, "specialOffer", p.specialOffer)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition ${
                          p.specialOffer
                            ? "bg-rose-100 text-rose-800 border border-rose-300 shadow-xs"
                            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                        }`}
                      >
                        <TrendingUp className="w-3 h-3" />
                        <span>{p.specialOffer ? "On Offer" : "Standard"}</span>
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/products/${p.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-slate-400 hover:text-[#62648D] font-semibold"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

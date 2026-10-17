"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Layers,
  Award,
  Sparkles,
  AlertCircle,
  ImageOff,
  Plus,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Eye,
  Sliders,
  FileSpreadsheet,
  Settings,
  MessageSquare,
  MessageCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Phone,
  ExternalLink,
} from "lucide-react";
import { formatPrice } from "@/lib/products";

const STATUS_BADGES: Record<string, { bg: string; text: string; border: string }> = {
  "New Lead": { bg: "bg-emerald-500/10", text: "text-emerald-700", border: "border-emerald-200" },
  "WhatsApp Opened": { bg: "bg-blue-500/10", text: "text-blue-700", border: "border-blue-200" },
  "Contacted": { bg: "bg-indigo-500/10", text: "text-indigo-700", border: "border-indigo-200" },
  "Order Confirmed": { bg: "bg-teal-500/10", text: "text-teal-700", border: "border-teal-200" },
  "Completed": { bg: "bg-green-500/10", text: "text-green-800", border: "border-green-200" },
  "Cancelled": { bg: "bg-slate-500/10", text: "text-slate-600", border: "border-slate-200" },
  "No Response": { bg: "bg-amber-500/10", text: "text-amber-700", border: "border-amber-200" },
  "Spam": { bg: "bg-rose-500/10", text: "text-rose-700", border: "border-rose-200" },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (res.ok) {
        setStats(data.stats);
        setRecentProducts(data.recentProducts || []);
        setRecentLeads(data.recentLeads || []);
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const leadCards = [
    {
      label: "New Leads",
      value: stats?.newLeads ?? 0,
      subtext: "Unopened or pending review",
      icon: MessageCircle,
      color: "bg-emerald-600",
      href: "/admin/leads?status=New+Lead",
    },
    {
      label: "Today's Leads",
      value: stats?.todayLeads ?? 0,
      subtext: "Received since midnight",
      icon: Calendar,
      color: "bg-blue-600",
      href: "/admin/leads?dateRange=today",
    },
    {
      label: "Confirmed Orders",
      value: stats?.confirmedOrders ?? 0,
      subtext: "Verified through WhatsApp",
      icon: CheckCircle2,
      color: "bg-teal-600",
      href: "/admin/leads?status=Order+Confirmed",
    },
    {
      label: "Pending Follow-ups",
      value: stats?.pendingFollowUps ?? 0,
      subtext: "Customer follow-ups required",
      icon: Clock,
      color: "bg-amber-600",
      href: "/admin/leads",
    },
  ];

  const statCards = [
    {
      label: "Total Products",
      value: stats?.totalProducts ?? "—",
      subtext: "Across all brands & categories",
      icon: Package,
      color: "bg-blue-500",
      href: "/admin/products",
    },
    {
      label: "Total Brands",
      value: stats?.totalBrands ?? "—",
      subtext: "Haier, Dawlance, Orient, etc.",
      icon: Award,
      color: "bg-indigo-500",
      href: "/admin/brands",
    },
    {
      label: "Categories",
      value: stats?.totalCategories ?? "—",
      subtext: "Appliances, ACs, LED TVs, etc.",
      icon: Layers,
      color: "bg-cyan-500",
      href: "/admin/categories",
    },
    {
      label: "Featured Products",
      value: stats?.featuredProducts ?? "—",
      subtext: "Highlighted on homepage",
      icon: Sparkles,
      color: "bg-amber-500",
      href: "/admin/offers",
    },
    {
      label: "Special Offers",
      value: stats?.specialOffers ?? "—",
      subtext: "Discounted deal items",
      icon: TrendingUp,
      color: "bg-rose-500",
      href: "/admin/offers",
    },
    {
      label: "Missing Prices",
      value: stats?.missingPrices ?? "—",
      subtext: "Shows 'Contact for Price'",
      icon: AlertCircle,
      color: "bg-orange-500",
      href: "/admin/products?priceStatus=contact-price",
    },
    {
      label: "Placeholder Images",
      value: stats?.missingImages ?? "—",
      subtext: "Items needing actual photos",
      icon: ImageOff,
      color: "bg-slate-600",
      href: "/admin/products",
    },
  ];

  const cleanPhoneForWa = (phone: string) => {
    const digits = (phone || "").replace(/\D/g, "");
    if (digits.startsWith("0")) return "92" + digits.slice(1);
    if (digits.startsWith("92")) return digits;
    return "92" + digits;
  };

  return (
    <div className="space-y-8">
      {/* ── HEADER BANNER ──────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#2B2B66] to-[#62648D] rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-blue-200 mb-2 border border-white/10 backdrop-blur-xs">
            Live Store Controller
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold">
            A H Electronics Dashboard
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
            Manage your live electronics inventory, monitor WhatsApp customer leads, adjust product prices, configure banners, and manage store settings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition disabled:opacity-50"
            title="Refresh Stats"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/admin/leads"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition"
          >
            <MessageSquare className="w-4 h-4" />
            <span>View Leads</span>
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-[#2B2B66] text-xs font-bold hover:bg-blue-50 shadow-md hover:shadow-lg transition"
          >
            <Plus className="w-4 h-4 text-[#62648D]" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* ── WHATSAPP LEADS KPI CARDS ──────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-extrabold text-[#2B2B66] uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>WhatsApp Leads Overview</span>
          </h2>
          <Link
            href="/admin/leads"
            className="text-xs font-bold text-[#62648D] hover:underline flex items-center gap-1"
          >
            <span>Manage All Leads</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {leadCards.map((card, i) => (
            <Link
              key={i}
              href={card.href}
              className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition hover:border-[#62648D]/40 group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {card.label}
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#2B2B66] mt-1 group-hover:text-[#62648D] transition-colors">
                    {card.value}
                  </h3>
                </div>
                <div className={`w-11 h-11 rounded-xl ${card.color} text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-110 transition-transform`}>
                  <card.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span>{card.subtext}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#62648D] group-hover:translate-x-1 transition-all" />
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* ── RECENT WHATSAPP LEADS TABLE ───────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-[#2B2B66]">
                Recent WhatsApp Leads
              </h2>
              <p className="text-xs text-slate-400">
                Latest customer inquiries received via website ordering buttons
              </p>
            </div>
          </div>
          <Link
            href="/admin/leads"
            className="text-xs font-bold text-[#62648D] hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Leads</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Ref & Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Price & Qty</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quick Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Loading recent leads...
                  </td>
                </tr>
              ) : recentLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    No WhatsApp leads recorded yet. Try submitting an inquiry on any product!
                  </td>
                </tr>
              ) : (
                recentLeads.map((lead) => {
                  const badge = STATUS_BADGES[lead.status] || {
                    bg: "bg-slate-100",
                    text: "text-slate-700",
                    border: "border-slate-200",
                  };
                  const dateStr = new Date(lead.createdAt).toLocaleString("en-PK", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const cleanPhone = cleanPhoneForWa(lead.phone);

                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-[#2B2B66]">
                          {lead.refNumber}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">{dateStr}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-800">{lead.customerName}</p>
                        <p className="text-[11px] font-mono text-slate-500">{lead.phone}</p>
                        {lead.city && (
                          <span className="text-[10px] text-slate-400">📍 {lead.city}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-semibold text-slate-800 line-clamp-1">
                          {lead.productName}
                        </p>
                        {lead.productModel && (
                          <p className="text-[10px] font-mono text-slate-400">
                            Model: {lead.productModel}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-[#2B2B66]">
                          {formatPrice(lead.productPrice)}
                        </p>
                        <p className="text-[10px] text-slate-400">Qty: {lead.quantity}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`tel:${(lead.phone || "").replace(/\s+/g, "")}`}
                            title="Call Customer"
                            className="p-1.5 rounded-md bg-blue-50 text-[#62648D] hover:bg-blue-100"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={`https://wa.me/${cleanPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open WhatsApp Chat"
                            className="p-1.5 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                          <Link
                            href="/admin/leads"
                            title="View in Leads Manager"
                            className="p-1.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── STORE INVENTORY & CATALOG STATS ─────────────────────── */}
      <div>
        <h2 className="text-sm font-extrabold text-[#2B2B66] uppercase tracking-wider mb-3">
          Product Catalog & Inventory
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, i) => (
            <Link
              key={i}
              href={card.href}
              className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition hover:border-[#62648D]/40 group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {card.label}
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#2B2B66] mt-1 group-hover:text-[#62648D] transition-colors">
                    {card.value}
                  </h3>
                </div>
                <div
                  className={`w-10 h-10 rounded-lg ${card.color} text-white flex items-center justify-center shadow-xs shrink-0`}
                >
                  <card.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span>{card.subtext}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#62648D] group-hover:translate-x-0.5 transition-all" />
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* ── QUICK MANAGEMENT ACTIONS ────────────────────────────── */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80">
        <h2 className="font-display text-base font-bold text-[#2B2B66] mb-4">
          Quick Management Shortcuts
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            href="/admin/products/new"
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-[#62648D] shadow-xs hover:shadow-sm transition flex items-center gap-3.5 group"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#62648D] flex items-center justify-center font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 group-hover:text-[#62648D]">
                Add New Product
              </p>
              <p className="text-[11px] text-slate-400">Add models, specs, gallery</p>
            </div>
          </Link>

          <Link
            href="/admin/products/import-export"
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-[#62648D] shadow-xs hover:shadow-sm transition flex items-center gap-3.5 group"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 group-hover:text-[#62648D]">
                Import / Export
              </p>
              <p className="text-[11px] text-slate-400">Bulk upload or download CSV</p>
            </div>
          </Link>

          <Link
            href="/admin/banners"
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-[#62648D] shadow-xs hover:shadow-sm transition flex items-center gap-3.5 group"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 group-hover:text-[#62648D]">
                Hero & Banners
              </p>
              <p className="text-[11px] text-slate-400">Update homepage sliders</p>
            </div>
          </Link>

          <Link
            href="/admin/settings"
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-[#62648D] shadow-xs hover:shadow-sm transition flex items-center gap-3.5 group"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 group-hover:text-[#62648D]">
                Store Settings
              </p>
              <p className="text-[11px] text-slate-400">Phone, WhatsApp, address, email</p>
            </div>
          </Link>
        </div>
      </div>

      {/* ── RECENTLY UPDATED PRODUCTS ───────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-bold text-[#2B2B66]">
              Recently Updated Products
            </h2>
            <p className="text-xs text-slate-400">
              Latest items modified in the catalog database
            </p>
          </div>
          <Link
            href="/admin/products"
            className="text-xs font-bold text-[#62648D] hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Loading recent products...
                  </td>
                </tr>
              ) : recentProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    No products found.
                  </td>
                </tr>
              ) : (
                recentProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
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
                          <p className="font-bold text-slate-800 line-clamp-1">{p.name}</p>
                          <p className="text-[10px] text-slate-400">Model: {p.model || "N/A"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-600">{p.brand}</td>
                    <td className="py-3 px-4 text-slate-500">{p.category}</td>
                    <td className="py-3 px-4 font-bold text-[#2B2B66]">
                      {p.price ? (
                        formatPrice(p.price)
                      ) : (
                        <span className="text-[11px] font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          Contact for Price
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {p.stockStatus || "In Stock"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#62648D] hover:underline"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Edit</span>
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

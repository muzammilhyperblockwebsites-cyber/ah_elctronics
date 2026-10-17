"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  Filter,
  Download,
  Phone,
  MessageCircle,
  ExternalLink,
  Trash2,
  FileText,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Plus,
  Send,
  Loader2,
  X,
  Eye,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/products";

const STATUS_LIST = [
  "All",
  "New Lead",
  "WhatsApp Opened",
  "Contacted",
  "Order Confirmed",
  "Completed",
  "Cancelled",
  "No Response",
  "Spam",
];

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

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  // Filters
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [dateRange, setDateRange] = useState("");
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  // Active Lead Details / Notes Modal
  const [activeLead, setActiveLead] = useState<any | null>(null);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // Delete modal
  const [leadToDelete, setLeadToDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchLeads = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      if (search.trim()) params.set("search", search.trim());
      if (selectedStatus && selectedStatus !== "All") params.set("status", selectedStatus);
      if (dateRange) params.set("dateRange", dateRange);

      const res = await fetch(`/api/admin/leads?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load leads");
      const data = await res.json();
      setLeads(data.leads || []);
      setPagination(data.pagination || { total: 0, page: 1, limit: 20, totalPages: 1 });
      setStatusCounts(data.statusCounts || {});
    } catch (err: any) {
      toast.error(err.message || "Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus, dateRange]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads(1);
  };

  const handleStatusChange = async (leadId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success(`Status updated to "${newStatus}"`);
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
      );
      if (activeLead && activeLead.id === leadId) {
        setActiveLead((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err: any) {
      toast.error(err.message || "Status update failed");
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim() || !activeLead) return;

    setSavingNote(true);
    try {
      const res = await fetch(`/api/admin/leads/${activeLead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteText: noteText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save note");

      toast.success("Internal note added");
      setNoteText("");
      setActiveLead(data.lead);
      setLeads((prev) =>
        prev.map((l) => (l.id === activeLead.id ? data.lead : l))
      );
    } catch (err: any) {
      toast.error(err.message || "Could not save note");
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteLead = async () => {
    if (!leadToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/leads/${leadToDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete lead");
      toast.success(`Lead #${leadToDelete.refNumber} deleted`);
      setLeads((prev) => prev.filter((l) => l.id !== leadToDelete.id));
      setLeadToDelete(null);
      if (activeLead && activeLead.id === leadToDelete.id) {
        setActiveLead(null);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete lead");
    } finally {
      setDeleting(false);
    }
  };

  const copyRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(ref);
    toast.success(`Copied ${ref}`);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  const cleanPhoneForWa = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    if (digits.startsWith("0")) return "92" + digits.slice(1);
    if (digits.startsWith("92")) return digits;
    return "92" + digits;
  };

  // Helper for parsing notes
  const getNotesArray = (notesStr: string) => {
    try {
      return JSON.parse(notesStr || "[]");
    } catch {
      return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#2B2B66] flex items-center gap-2.5">
            <MessageSquare className="w-7 h-7 text-emerald-600" />
            <span>WhatsApp Leads</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Capture, track, and manage all customer product inquiries and WhatsApp orders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`/api/admin/leads/export${selectedStatus !== "All" ? `?status=${selectedStatus}` : ""}`}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition"
          >
            <Download className="w-4 h-4 text-[#62648D]" />
            <span>Export CSV</span>
          </a>
          <button
            onClick={() => fetchLeads(pagination.page)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#2B2B66] text-white text-xs font-bold hover:bg-[#17212B] transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">New Leads</p>
            <p className="text-2xl font-black text-[#2B2B66]">
              {(statusCounts["New Lead"] || 0) + (statusCounts["WhatsApp Opened"] || 0)}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#62648D] flex items-center justify-center border border-blue-100 shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Contacted</p>
            <p className="text-2xl font-black text-[#2B2B66]">{statusCounts["Contacted"] || 0}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Confirmed Orders</p>
            <p className="text-2xl font-black text-[#2B2B66]">{statusCounts["Order Confirmed"] || 0}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Follow-Ups</p>
            <p className="text-2xl font-black text-[#2B2B66]">{statusCounts["No Response"] || 0}</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference (#AH-10001), customer name, phone, city, product, model..."
              className="w-full pl-9 pr-20 py-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#62648D]/20 focus:border-[#62648D]"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-md bg-[#2B2B66] text-white text-xs font-semibold hover:bg-slate-800"
            >
              Search
            </button>
          </form>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:border-[#62648D]"
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none text-xs">
          {STATUS_LIST.map((st) => {
            const count = st === "All" ? pagination.total : statusCounts[st] || 0;
            const isSelected = selectedStatus === st;
            return (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#62648D] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>{st}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? "bg-white/25 text-white" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Leads Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Ref & Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Product / Details</th>
                <th className="py-3 px-4">Price & Qty</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#62648D]" />
                    <p>Loading WhatsApp leads...</p>
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600 text-sm">No leads found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      No leads matching your current search or status filter.
                    </p>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const badgeStyle = STATUS_BADGES[lead.status] || {
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
                  const notesList = getNotesArray(lead.notes);

                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/70 transition">
                      {/* Ref & Date */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[#2B2B66]">
                            {lead.refNumber}
                          </span>
                          <button
                            onClick={() => copyRef(lead.refNumber)}
                            className="text-slate-400 hover:text-slate-600"
                            title="Copy reference number"
                          >
                            {copiedRef === lead.refNumber ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{dateStr}</p>
                        <span className="inline-block mt-1 text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded truncate max-w-[130px]">
                          {lead.sourcePage || "Store"}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4 align-top">
                        <p className="font-bold text-[#17212B]">{lead.customerName}</p>
                        <p className="text-[11px] font-mono text-slate-500">{lead.phone}</p>
                        {lead.city && (
                          <p className="text-[11px] text-slate-400 mt-0.5">📍 {lead.city}</p>
                        )}
                        {lead.message && (
                          <p className="text-[11px] text-slate-500 italic mt-1 line-clamp-1 bg-slate-50 p-1 rounded border border-slate-100">
                            "{lead.message}"
                          </p>
                        )}
                      </td>

                      {/* Product */}
                      <td className="py-3.5 px-4 align-top max-w-xs">
                        <p className="font-semibold text-slate-800 line-clamp-1">{lead.productName}</p>
                        {lead.productModel && (
                          <p className="text-[11px] font-mono text-slate-500">
                            Model: {lead.productModel}
                          </p>
                        )}
                        {lead.productUrl && (
                          <Link
                            href={lead.productUrl}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-[10px] text-[#62648D] hover:underline mt-0.5"
                          >
                            <span>View Product Page</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        )}
                      </td>

                      {/* Price & Quantity */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <p className="font-extrabold text-[#2B2B66]">
                          {formatPrice(lead.productPrice)}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Qty: <span className="font-bold text-slate-700">{lead.quantity}</span>
                        </p>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4 align-top">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          className={`px-2 py-1 rounded-md text-[11px] font-bold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border} focus:outline-none cursor-pointer`}
                        >
                          {STATUS_LIST.filter((s) => s !== "All").map((st) => (
                            <option key={st} value={st} className="bg-white text-slate-800">
                              {st}
                            </option>
                          ))}
                        </select>

                        {notesList.length > 0 && (
                          <p className="text-[10px] text-indigo-600 font-semibold mt-1">
                            💬 {notesList.length} note{notesList.length > 1 ? "s" : ""}
                          </p>
                        )}
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3.5 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Call Button */}
                          <a
                            href={`tel:${lead.phone.replace(/\s+/g, "")}`}
                            title="Call Customer"
                            className="p-1.5 rounded-lg bg-blue-50 text-[#62648D] hover:bg-blue-100 transition"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>

                          {/* WhatsApp Chat Button */}
                          <a
                            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                              `Assalam-o-Alaikum ${lead.customerName}, regarding your A H Electronics inquiry #${lead.refNumber} for ${lead.productName}:`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open WhatsApp Chat"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>

                          {/* Notes / Details Button */}
                          <button
                            onClick={() => setActiveLead(lead)}
                            title="View Details & Add Internal Notes"
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Spam Lead */}
                          <button
                            onClick={() => setLeadToDelete(lead)}
                            title="Delete Lead"
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing {leads.length} of {pagination.total} leads (Page {pagination.page} of{" "}
              {pagination.totalPages})
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchLeads(pagination.page - 1)}
                className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-slate-800">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchLeads(pagination.page + 1)}
                className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── DETAILS & INTERNAL NOTES MODAL ────────────────────────────────────── */}
      {activeLead && (
        <div className="fixed inset-0 z-50 bg-[#2B2B66]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-[#62648D] border border-blue-100">
                    #{activeLead.refNumber}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                      STATUS_BADGES[activeLead.status]?.bg || "bg-slate-100"
                    } ${STATUS_BADGES[activeLead.status]?.text || "text-slate-700"} ${
                      STATUS_BADGES[activeLead.status]?.border || "border-slate-200"
                    }`}
                  >
                    {activeLead.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#2B2B66] mt-1">
                  Lead Details & Internal Notes
                </h3>
              </div>
              <button
                onClick={() => setActiveLead(null)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              {/* Customer & Product Card */}
              <div className="p-3.5 rounded-xl bg-[#F6F8FB] border border-slate-200 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Customer</span>
                    <p className="font-bold text-[#17212B] text-sm">{activeLead.customerName}</p>
                    <p className="font-mono text-slate-600">{activeLead.phone}</p>
                    {activeLead.city && <p className="text-slate-500">City: {activeLead.city}</p>}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Product</span>
                    <p className="font-bold text-[#17212B] text-sm">{activeLead.productName}</p>
                    {activeLead.productModel && (
                      <p className="font-mono text-slate-600">Model: {activeLead.productModel}</p>
                    )}
                    <p className="font-extrabold text-[#2B2B66]">
                      {formatPrice(activeLead.productPrice)} × {activeLead.quantity}
                    </p>
                  </div>
                </div>

                {activeLead.message && (
                  <div className="pt-2 border-t border-slate-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Customer Note / Message:
                    </span>
                    <p className="text-slate-700 bg-white p-2 rounded-lg border border-slate-200 mt-1">
                      {activeLead.message}
                    </p>
                  </div>
                )}
              </div>

              {/* Status Selector in Modal */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-700">Update Status:</span>
                <select
                  value={activeLead.status}
                  onChange={(e) => handleStatusChange(activeLead.id, e.target.value)}
                  className="px-2.5 py-1.5 rounded-md border border-slate-300 text-xs font-bold bg-white focus:outline-none"
                >
                  {STATUS_LIST.filter((s) => s !== "All").map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes Timeline */}
              <div>
                <h4 className="font-bold text-[#2B2B66] mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#62648D]" />
                  <span>Internal Team Notes ({getNotesArray(activeLead.notes).length})</span>
                </h4>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {getNotesArray(activeLead.notes).length === 0 ? (
                    <p className="text-slate-400 italic p-2 bg-slate-50 rounded">
                      No internal notes yet.
                    </p>
                  ) : (
                    getNotesArray(activeLead.notes).map((note: any) => (
                      <div
                        key={note.id}
                        className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                      >
                        <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                          <span className="font-bold text-slate-600">{note.author || "Admin"}</span>
                          <span>
                            {new Date(note.createdAt).toLocaleString("en-PK", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-slate-700 whitespace-pre-wrap">{note.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add Note Input */}
              <form onSubmit={handleAddNote} className="space-y-2 pt-2 border-t border-slate-100">
                <label className="font-bold text-slate-700 block">Add New Internal Note:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="e.g. Customer requested call back at 5 PM on Saturday..."
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#62648D]/20 focus:border-[#62648D]"
                  />
                  <button
                    type="submit"
                    disabled={savingNote || !noteText.trim()}
                    className="px-3.5 py-2 rounded-lg bg-[#62648D] hover:bg-[#0f55bd] text-white font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    {savingNote ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Save Note</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setLeadToDelete(activeLead)}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Lead</span>
              </button>
              <button
                onClick={() => setActiveLead(null)}
                className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE SPAM CONFIRMATION DIALOG ────────────────────────────────────── */}
      {leadToDelete && (
        <div className="fixed inset-0 z-50 bg-[#2B2B66]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-[#2B2B66]">Delete WhatsApp Lead?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete lead{" "}
                <span className="font-bold text-slate-800">#{leadToDelete.refNumber}</span> ({leadToDelete.customerName})? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setLeadToDelete(null)}
                className="flex-1 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteLead}
                className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Delete Lead</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

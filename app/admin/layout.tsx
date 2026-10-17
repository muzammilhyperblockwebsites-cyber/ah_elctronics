"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Package,
  Layers,
  Award,
  Sparkles,
  Sliders,
  Settings,
  FileSpreadsheet,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/leads", label: "WhatsApp Leads", icon: MessageSquare, badge: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/products/import-export", label: "Import / Export", icon: FileSpreadsheet },
  { href: "/admin/categories", label: "Categories", icon: Layers },
  { href: "/admin/brands", label: "Brands", icon: Award },
  { href: "/admin/offers", label: "Offers & Featured", icon: Sparkles },
  { href: "/admin/banners", label: "Hero & Banners", icon: Sliders },
  { href: "/admin/settings", label: "Site Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [newLeadsCount, setNewLeadsCount] = useState(0);
  const [adminUser, setAdminUser] = useState<{ name: string; email: string; role?: string } | null>(null);
  const [storeName, setStoreName] = useState("A H Electronics");

  useEffect(() => {
    if (pathname === "/admin/login" || pathname === "/admin-login") return;

    fetch("/api/admin/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.user) setAdminUser(d.user);
      })
      .catch(() => {});

    fetch("/api/admin/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.settings?.businessName) setStoreName(d.settings.businessName);
      })
      .catch(() => {});

    const fetchLeadBadge = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setNewLeadsCount(data.stats?.newLeads || 0);
        }
      } catch {
        // silent
      }
    };
    fetchLeadBadge();
    const interval = setInterval(fetchLeadBadge, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [pathname]);

  // If on login page, render children cleanly without layout sidebar
  if (pathname === "/admin/login" || pathname === "/admin-login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await fetch("/api/admin/logout", { method: "POST" });
      toast.success("Logged out successfully");
      router.push("/admin-login");
      router.refresh();
    } catch {
      toast.error("Logout failed");
    } finally {
      setLoggingOut(false);
    }
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const initials = (adminUser?.name || storeName)
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#F6F8FB] flex flex-col lg:flex-row">
      {/* ── DESKTOP SIDEBAR ─────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#2B2B66] text-white shrink-0 border-r border-slate-800 fixed inset-y-0 z-30">
        {/* Brand Logo Header */}
        <div className="h-16 px-4 flex items-center border-b border-white/10 bg-[#2B2B66]">
          <Link href="/admin" className="inline-flex items-center rounded-md bg-white px-2 py-1">
            <Image
              src="/assets/branding/ah-footer-transparent.svg"
              alt={storeName}
              width={160}
              height={38}
              className="h-8 w-auto object-contain"
              unoptimized
              priority
            />
          </Link>
        </div>

        {/* Admin Badge */}
        <div className="px-5 py-3.5 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#62648D] text-white font-bold flex items-center justify-center text-xs shadow shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white leading-tight truncate">
                {adminUser?.name || "Super Admin"}
              </p>
              <p className="text-[10px] text-slate-400 leading-tight truncate">
                {adminUser?.email || "Active Session"}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
            Online
          </span>
        </div>

        {/* Navigation Menu Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
                  active
                    ? "bg-[#62648D] text-white shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <item.icon className={`w-4 h-4 shrink-0 ${active ? "text-white" : "text-slate-400"}`} />
                <span className="flex-1">{item.label}</span>
                {item.badge && newLeadsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-xs animate-pulse">
                    {newLeadsCount}
                  </span>
                )}
                {active && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer (View Store & Logout) */}
        <div className="p-3 border-t border-slate-800/80 bg-[#081828] space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
          >
            <ExternalLink className="w-4 h-4 text-[#28A8EA]" />
            <span>View Public Store</span>
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition disabled:opacity-50"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>{loggingOut ? "Signing Out..." : "Sign Out"}</span>
          </button>
        </div>
      </aside>

      {/* ── MOBILE & TABLET HEADER ──────────────────────────────── */}
      <header className="lg:hidden h-16 bg-[#2B2B66] text-white px-4 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <Link href="/admin" className="inline-flex items-center rounded-md bg-white px-2 py-1">
          <Image
            src="/assets/branding/ah-footer-transparent.svg"
            alt={storeName}
            width={140}
            height={32}
            className="h-7 w-auto object-contain"
            unoptimized
          />
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="p-2 text-slate-300 hover:text-white"
            title="View Public Store"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white focus:outline-none"
            aria-label="Toggle navigation drawer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* ── MOBILE & TABLET DRAWER OVERLAY ──────────────────────── */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 flex">
          <div className="w-72 max-w-[85vw] bg-[#2B2B66] text-white flex flex-col h-full shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="inline-flex items-center rounded-md bg-white px-2 py-1">
                <Image
                  src="/assets/branding/ah-footer-transparent.svg"
                  alt={storeName}
                  width={140}
                  height={32}
                  className="h-7 w-auto object-contain"
                  unoptimized
                />
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
                      active ? "bg-[#62648D] text-white" : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && newLeadsCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-xs">
                        {newLeadsCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-800 bg-[#081828] space-y-2">
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800"
              >
                <ExternalLink className="w-4 h-4 text-[#28A8EA]" />
                <span>View Public Store</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* ── MAIN CONTENT WRAPPER ─────────────────────────────────── */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Desktop Top Header Bar */}
        <header className="hidden lg:flex h-16 bg-white border-b border-slate-200 px-8 items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="text-slate-400">Admin</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#2B2B66] font-bold capitalize">
              {pathname === "/admin"
                ? "Dashboard"
                : pathname.replace("/admin/", "").replace(/-/g, " ")}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <span>View Store</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <div className="h-6 w-px bg-slate-200" />

            <div className="flex items-center gap-2 text-xs">
              <div className="w-7 h-7 rounded-full bg-[#2B2B66] text-white flex items-center justify-center font-bold text-[11px]">
                {initials}
              </div>
              <span className="font-semibold text-slate-700">{storeName}</span>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

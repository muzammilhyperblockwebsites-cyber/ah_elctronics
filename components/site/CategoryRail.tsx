"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Refrigerator,
  Wind,
  WashingMachine,
  Tv,
  Snowflake,
  GlassWater,
  CookingPot,
  ChefHat,
  Bike,
  Wrench,
  Package,
  type LucideIcon,
} from "lucide-react";
import type { CategoryMenu } from "@/lib/categoryMenus";
import { SearchBar } from "./SearchBar";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  Refrigerator,
  Wind,
  WashingMachine,
  Tv,
  Snowflake,
  GlassWater,
  CookingPot,
  ChefHat,
  Bike,
  Wrench,
  Package,
};

const infoLinks = [
  { label: "Home", href: "/" },
  { label: "All products", href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "Offers", href: "/offers" },
  { label: "About", href: "/about" },
  { label: "Warranty", href: "/warranty-services" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] || Package;
  return <Icon className={className} strokeWidth={1.75} />;
}

export function CategoryRail({
  menus,
  brands = [],
  settings = siteConfig as any,
  mobileOpen,
  onMobileClose,
}: {
  menus: CategoryMenu[];
  brands?: { name: string; slug: string; productCount?: number }[];
  settings?: typeof siteConfig | any;
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const pathname = usePathname();
  const shellRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [panelTop, setPanelTop] = useState(88);
  const [mobileSection, setMobileSection] = useState<string | null>(menus[0]?.slug || null);

  const activeBrands =
    brands && brands.length > 0 ? brands : siteConfig.brands;

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const closeDesktop = useCallback(() => {
    cancelClose();
    setExpanded(false);
    setActiveSlug(null);
  }, [cancelClose]);

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => {
      setActiveSlug(null);
    }, 220);
  };

  useEffect(() => {
    closeDesktop();
    onMobileClose();
  }, [pathname, closeDesktop, onMobileClose]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDesktop();
        onMobileClose();
      }
    };
    const onPointer = (event: MouseEvent) => {
      if (!shellRef.current?.contains(event.target as Node)) {
        closeDesktop();
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
      cancelClose();
    };
  }, [onMobileClose, closeDesktop, cancelClose]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const active = menus.find((menu) => menu.slug === activeSlug) || null;

  const openCategory = (slug: string, top: number) => {
    cancelClose();
    setExpanded(true);
    setActiveSlug(slug);
    const estimated = 420;
    const nextTop = Math.max(12, Math.min(top - 12, window.innerHeight - estimated - 12));
    setPanelTop(nextTop);
  };

  return (
    <>
      <div
        ref={shellRef}
        className="hidden lg:block"
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
      >
        <aside
          className={cn(
            "fixed bottom-0 left-0 top-0 z-40 flex flex-col border-r border-[#E6E8ED] bg-white",
            expanded ? "w-[272px] shadow-xl" : "w-[72px]"
          )}
          aria-label="Product categories"
        >
          <div className="flex h-[76px] items-center px-3">
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls="category-mega-menu"
              onClick={() => {
                if (expanded) closeDesktop();
                else {
                  setExpanded(true);
                  setActiveSlug(menus[0]?.slug || null);
                }
              }}
              className={cn(
                "flex h-12 items-center justify-center gap-2 rounded-full bg-[#89393B] text-sm font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2B2B66]",
                expanded ? "w-full px-4" : "w-12"
              )}
            >
              {expanded ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              {expanded && <span>Categories</span>}
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto pb-4" aria-label="Categories">
            {menus.map((menu) => {
              const selected = expanded && activeSlug === menu.slug;
              return (
                <Link
                  key={menu.slug}
                  href={menu.href}
                  title={menu.name}
                  onMouseEnter={(event) => openCategory(menu.slug, event.currentTarget.getBoundingClientRect().top)}
                  onFocus={(event) => openCategory(menu.slug, event.currentTarget.getBoundingClientRect().top)}
                  className={cn(
                    "flex h-12 w-full items-center border-b border-[#F1F2F4] text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#2B2B66]",
                    expanded ? "gap-3 px-4" : "justify-center",
                    selected ? "bg-[#89393B] text-white" : "text-[#AE6965] hover:bg-[#F3EEEE]"
                  )}
                >
                  <CategoryIcon name={menu.icon} className={cn("h-5 w-5 shrink-0", selected ? "text-white" : "text-[#AE6965]")} />
                  {expanded && (
                    <>
                      <span className={cn("min-w-0 flex-1 truncate text-sm font-semibold", selected ? "text-white" : "text-[#17212B]")}>
                        {menu.name}
                      </span>
                      <ChevronRight className={cn("h-4 w-4 shrink-0", selected ? "text-white" : "text-[#8A93A0]")} />
                    </>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        {expanded && active && (
          <div
            id="category-mega-menu"
            role="region"
            aria-label={`${active.name} categories`}
            className="fixed z-40 w-[min(920px,calc(100vw-288px))] overflow-hidden rounded-xl border border-[#E6E8ED] bg-white shadow-2xl"
            style={{ left: 272, top: panelTop, maxHeight: "min(520px, calc(100vh - 24px))" }}
            onMouseEnter={cancelClose}
          >
            <div className="grid max-h-[inherit] grid-cols-[minmax(0,1fr)_210px] gap-5 overflow-y-auto p-5">
              <div
                className={cn(
                  "grid content-start gap-5",
                  active.columns.length <= 1 && "grid-cols-1",
                  active.columns.length === 2 && "grid-cols-2",
                  active.columns.length === 3 && "grid-cols-2 xl:grid-cols-3",
                  active.columns.length >= 4 && "grid-cols-2 xl:grid-cols-4"
                )}
              >
                {active.columns.map((column) => (
                  <div key={column.title}>
                    <h3 className="text-sm font-bold text-[#17212B]">{column.title}</h3>
                    <ul className="mt-2 space-y-1.5">
                      {column.links.map((link) => (
                        <li key={`${column.title}-${link.label}`}>
                          <Link
                            href={link.href}
                            className="text-[13px] text-[#5E6976] hover:text-[#62648D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2B2B66]"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <Link href={active.href} className="group block overflow-hidden rounded-lg bg-[#F7F8FA]">
                <div className="relative h-40">
                  <Image src={active.promoImage} alt="" fill className="object-cover" sizes="210px" />
                </div>
                <div className="p-3">
                  <p className="text-sm font-bold text-[#2B2B66] group-hover:text-[#62648D]">{active.promoTitle}</p>
                  <p className="mt-1 text-xs leading-5 text-[#5E6976]">{active.promoText}</p>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button type="button" className="absolute inset-0 bg-[#2B2B66]/50" aria-label="Close categories" onClick={onMobileClose} />
          <div role="dialog" aria-modal="true" aria-label="Categories" className="absolute inset-y-0 left-0 flex w-[min(100%,340px)] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-[#89393B] px-4 py-3 text-white">
              <p className="text-sm font-bold">Browse {settings.name}</p>
              <button type="button" onClick={onMobileClose} aria-label="Close menu" className="rounded-full p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="border-b border-[#E6E8ED] p-3">
              <SearchBar onCloseMobile={onMobileClose} />
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="px-4 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-[#8A93A0]">
                Categories
              </div>
              {menus.map((menu) => {
                const open = mobileSection === menu.slug;
                return (
                  <div key={menu.slug} className="border-b border-[#F1F2F4]">
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setMobileSection(open ? null : menu.slug)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left"
                    >
                      <CategoryIcon name={menu.icon} className="h-5 w-5 shrink-0 text-[#AE6965]" />
                      <span className="flex-1 text-sm font-semibold text-[#17212B]">{menu.name}</span>
                      <ChevronDown className={cn("h-4 w-4 shrink-0 text-[#8A93A0] transition-transform", open && "rotate-180")} />
                    </button>
                    {open && (
                      <div className="space-y-3 px-4 pb-4">
                        <Link href={menu.href} className="block text-sm font-semibold text-[#AE6965]" onClick={onMobileClose}>
                          View all {menu.name}
                        </Link>
                        {menu.columns.map((column) => (
                          <div key={column.title}>
                            <p className="text-xs font-bold uppercase tracking-wide text-[#2B2B66]">{column.title}</p>
                            <ul className="mt-1 space-y-1">
                              {column.links.map((link) => (
                                <li key={`${column.title}-${link.label}`}>
                                  <Link href={link.href} className="text-sm text-[#5E6976]" onClick={onMobileClose}>
                                    {link.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {activeBrands.length > 0 && (
                <div className="border-t border-[#E6E8ED] px-4 py-3">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#8A93A0]">
                    Shop by Brand
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {activeBrands.map((brand) => (
                      <Link
                        key={brand.slug}
                        href={`/brand/${brand.slug}`}
                        onClick={onMobileClose}
                        className="rounded-full border border-[#E6E8ED] bg-[#F7F8FA] px-3 py-1.5 text-xs font-semibold text-[#2B2B66] hover:border-[#AE6965]"
                      >
                        {brand.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2 border-t border-[#E6E8ED] px-4 py-3 text-sm font-semibold">
                <a href={`https://wa.me/${settings.contact.whatsappClean}`} className="block text-[#25D366]">WhatsApp {settings.contact.whatsapp}</a>
                <a href={`tel:${settings.contact.phoneCall}`} className="block text-[#2B2B66]">Phone {settings.contact.phone}</a>
                <a href={`tel:${settings.contact.mobileCall}`} className="block text-[#2B2B66]">Mobile {settings.contact.mobile}</a>
                <p className="text-xs font-medium leading-5 text-[#5E6976]">{settings.contact.address}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 p-4">
                {infoLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={onMobileClose} className="rounded-md bg-[#F7F8FA] px-3 py-2 text-sm font-semibold text-[#2B2B66]">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

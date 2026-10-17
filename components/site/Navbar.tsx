"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, Phone, ShoppingBag } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";
import type { DbBrand, DynamicSiteSettings } from "@/lib/db";
import { cn } from "@/lib/utils";
import { SearchBar } from "./SearchBar";
import { BrandLogo } from "./BrandLogo";
import { useOrderList } from "@/lib/orderListContext";
import { useMobileMenu } from "./SiteChrome";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "All Products", href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "Offers", href: "/offers" },
  { label: "About", href: "/about" },
  { label: "Warranty", href: "/warranty-services" },
  { label: "Contact", href: "/contact" },
];

export function Navbar({
  brands = [],
  settings = siteConfig as unknown as DynamicSiteSettings,
}: {
  brands?: DbBrand[];
  settings?: DynamicSiteSettings;
}) {
  const { totalItems, setIsOpen: setIsOrderListOpen } = useOrderList();
  const { openMobileMenu } = useMobileMenu();
  const [brandsOpen, setBrandsOpen] = useState(false);
  const [announcementIdx, setAnnouncementIdx] = useState(0);
  const pathname = usePathname();
  const closeTimer = useRef<number | null>(null);

  const activeBrands =
    brands && brands.length > 0
      ? brands
      : siteConfig.brands.map((b) => ({ ...b, id: b.slug, description: "", productCount: 0 }));

  const announcements =
    settings.announcements && settings.announcements.length > 0
      ? settings.announcements
      : siteConfig.announcements;

  const cancelClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setBrandsOpen(false), 220);
  };

  useEffect(() => {
    setBrandsOpen(false);
  }, [pathname]);

  useEffect(() => () => cancelClose(), []);

  useEffect(() => {
    if (announcements.length <= 1) return;
    const timer = window.setInterval(() => {
      setAnnouncementIdx((prev) => (prev + 1) % announcements.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [announcements.length]);

  return (
    <header className="sticky top-0 z-30">
      <div className="bg-[#2B2B66] text-white">
        <div className="section-container flex h-8 items-center justify-between gap-3 text-[11px] sm:text-xs">
          <a
            href={`https://wa.me/${settings.contact.whatsappClean}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 font-medium hover:text-[#25D366]"
          >
            WhatsApp {settings.contact.whatsapp}
          </a>
          <p className="hidden truncate text-center text-white/85 sm:block">
            {announcements[announcementIdx % announcements.length]}
          </p>
          <p className="hidden truncate text-white/75 xl:block">{settings.contact.address}</p>
        </div>
      </div>

      <div className="border-b-[3px] border-[#AE6965] bg-[#2B2B66] text-white">
        <div className="section-container flex items-center justify-between gap-2 py-3 sm:gap-5">
          <Link
            href="/"
            aria-label={settings.name}
            className="shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <BrandLogo priority />
          </Link>

          <div className="hidden min-w-0 flex-1 md:block">
            <SearchBar variant="header" />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-3 md:ml-0">
            <a
              href={`tel:${settings.contact.phoneCall}`}
              className="hidden items-center gap-2 rounded-full px-2 py-1 text-left hover:bg-white/10 xl:flex"
            >
              <Phone className="h-5 w-5 shrink-0 text-[#AE6965]" />
              <span>
                <span className="block text-sm font-bold leading-tight">{settings.contact.phone}</span>
                <span className="block text-xs font-semibold leading-tight text-white/80">{settings.contact.mobile}</span>
              </span>
            </a>

            <button
              type="button"
              onClick={() => setIsOrderListOpen(true)}
              className="relative inline-flex h-10 sm:h-11 items-center gap-2 rounded-full px-2.5 text-sm font-semibold hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              aria-label="Open order list"
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="hidden sm:inline">Order List</span>
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#89393B] px-1 text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              type="button"
              className="inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-[#89393B] text-white lg:hidden"
              aria-label="Open categories"
              onClick={openMobileMenu}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="section-container pb-3 md:hidden">
          <SearchBar variant="header" />
        </div>
      </div>

      <div className="hidden border-b border-[#E6E8ED] bg-white lg:block">
        <div className="section-container flex h-12 items-center justify-between gap-4">
          <nav className="flex h-full items-center gap-5" aria-label="Primary">
            {navLinks.slice(0, 3).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-[13px] font-bold uppercase tracking-wide focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2B2B66]",
                  pathname === link.href ? "text-[#62648D]" : "text-[#17212B] hover:text-[#62648D]"
                )}
              >
                {link.label}
              </Link>
            ))}

            <div className="relative h-full" onMouseEnter={() => { cancelClose(); setBrandsOpen(true); }} onMouseLeave={scheduleClose}>
              <button
                type="button"
                aria-expanded={brandsOpen}
                className="inline-flex h-full items-center gap-1 text-[13px] font-bold uppercase tracking-wide text-[#17212B] hover:text-[#62648D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2B2B66]"
                onClick={() => setBrandsOpen((open) => !open)}
              >
                Brands
                <ChevronDown className={cn("h-4 w-4 transition-transform", brandsOpen && "rotate-180")} />
              </button>
              <div className={cn("absolute left-0 top-full z-20 w-56 pt-2", brandsOpen ? "visible" : "invisible pointer-events-none")}>
                <div className="rounded-lg border border-[#E6E8ED] bg-white py-2 shadow-lg">
                  {activeBrands.map((brand) => (
                    <Link
                      key={brand.slug}
                      href={`/brand/${brand.slug}`}
                      className="flex items-center justify-between px-4 py-2 text-sm font-semibold text-[#17212B] hover:bg-[#F3EEEE] hover:text-[#62648D]"
                    >
                      <span>{brand.name}</span>
                      {brand.productCount > 0 && (
                        <span className="text-xs font-normal text-[#8A93A0]">{brand.productCount}</span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {navLinks.slice(3).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-[13px] font-bold uppercase tracking-wide focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2B2B66]",
                  pathname === link.href ? "text-[#62648D]" : "text-[#17212B] hover:text-[#62648D]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 text-sm font-bold text-[#AE6965]">
            <a href={`tel:${settings.contact.phoneCall}`} className="inline-flex items-center gap-2 hover:underline">
              <Phone className="h-4 w-4 shrink-0" />
              {settings.contact.phone}
            </a>
            <a href={`tel:${settings.contact.mobileCall}`} className="inline-flex items-center gap-2 hover:underline">
              {settings.contact.mobile}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

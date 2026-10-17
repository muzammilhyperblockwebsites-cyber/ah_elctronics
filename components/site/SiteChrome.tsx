"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { CategoryMenu } from "@/lib/categoryMenus";
import type { DbBrand, DbCategory, DynamicSiteSettings } from "@/lib/db";
import { siteConfig } from "@/lib/siteConfig";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { CategoryRail } from "./CategoryRail";
import { FloatingButtons } from "./FloatingButtons";
import { OrderListDrawer } from "./OrderListDrawer";

interface SiteContextValue {
  openMobileMenu: () => void;
  settings: DynamicSiteSettings;
  categories: DbCategory[];
  brands: DbBrand[];
}

const MenuContext = createContext<SiteContextValue>({
  openMobileMenu: () => {},
  settings: siteConfig as unknown as DynamicSiteSettings,
  categories: [],
  brands: [],
});

export function useMobileMenu() {
  return useContext(MenuContext);
}

export function useSiteSettings() {
  return useContext(MenuContext);
}

export function SiteChrome({
  menus,
  categories = [],
  brands = [],
  settings = siteConfig as unknown as DynamicSiteSettings,
  children,
}: {
  menus: CategoryMenu[];
  categories?: DbCategory[];
  brands?: DbBrand[];
  settings?: DynamicSiteSettings;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const value = useMemo(
    () => ({
      openMobileMenu: () => setMobileOpen(true),
      settings,
      categories,
      brands,
    }),
    [settings, categories, brands]
  );

  return (
    <MenuContext.Provider value={value}>
      <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-[#F7F8FA] lg:pl-[72px]">
        <CategoryRail
          menus={menus}
          brands={brands}
          settings={settings}
          mobileOpen={mobileOpen}
          onMobileClose={closeMobile}
        />
        <Navbar brands={brands} settings={settings} />
        <main className="flex min-w-0 flex-grow flex-col">{children}</main>
        <Footer categories={categories} settings={settings} />
        <FloatingButtons />
        <OrderListDrawer />
      </div>
    </MenuContext.Provider>
  );
}

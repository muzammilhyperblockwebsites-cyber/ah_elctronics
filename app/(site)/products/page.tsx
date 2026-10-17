import { getAllProducts, getSiteSettings } from "@/lib/db";
import { ProductsCatalogClient } from "@/components/site/ProductsCatalogClient";
import { Metadata } from "next";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `All Products | ${settings.name}`,
    description: `Explore our complete catalog of certified electronics, air conditioners, LED TVs, refrigerators, and appliances at ${settings.name}.`,
  };
}

export default async function ProductsPage() {
  const products = await getAllProducts();
  return (
    <Suspense fallback={<div className="section-container py-16 text-center text-slate-500">Loading catalog...</div>}>
      <ProductsCatalogClient initialProducts={products} />
    </Suspense>
  );
}

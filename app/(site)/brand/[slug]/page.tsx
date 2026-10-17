import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getBrands, getAllProducts, getSiteSettings } from "@/lib/db";
import { ChevronRight } from "lucide-react";
import { Suspense } from "react";
import BrandClient from "./BrandClient";

export const dynamic = "force-dynamic";

interface BrandPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const [brands, settings] = await Promise.all([
    getBrands(),
    getSiteSettings(),
  ]);
  const brand = brands.find((b) => b.slug === params.slug);
  
  if (!brand) {
    return { title: "Brand Not Found" };
  }

  return {
    title: `${brand.name} | ${settings.name}`,
    description: brand.description || `Shop the latest ${brand.name} products at ${settings.name}. Find great deals on top brands.`,
  };
}

export default async function BrandPage({ params }: BrandPageProps) {
  const brands = await getBrands();
  const brand = brands.find((b) => b.slug === params.slug);
  
  if (!brand) {
    notFound();
  }

  const allProducts = await getAllProducts();
  // Pre-filter products for this brand
  const brandProducts = allProducts.filter(
    (p) => p.brand.toLowerCase() === brand.name.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-[#F7F8FA] pb-12">
      <div className="border-b border-[#E6E8ED] bg-white">
        <div className="section-container py-5">
          <nav className="mb-2 flex items-center text-xs text-[#5E6976]" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[#2B2B66]">Home</Link>
            <ChevronRight className="mx-1 h-3.5 w-3.5" />
            <span className="font-medium text-[#17212B]">{brand.name}</span>
          </nav>
          <h1 className="font-display text-2xl font-bold text-[#2B2B66] sm:text-3xl">{brand.name}</h1>
          {brand.description && (
            <p className="mt-1.5 max-w-3xl text-sm text-[#5E6976]">{brand.description}</p>
          )}
          <p className="mt-1 text-sm text-[#5E6976]">
            {brandProducts.length} {brandProducts.length === 1 ? "product" : "products"}
          </p>
        </div>
      </div>
      <div className="section-container mt-6">
        <Suspense fallback={<p className="py-8 text-sm text-[#5E6976]">Loading products...</p>}>
          <BrandClient initialProducts={brandProducts} brandName={brand.name} />
        </Suspense>
      </div>
    </div>
  );
}

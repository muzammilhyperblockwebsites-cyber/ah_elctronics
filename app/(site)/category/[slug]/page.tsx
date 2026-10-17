import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategories, getAllProducts, getSiteSettings } from "@/lib/db";
import { ChevronRight } from "lucide-react";
import { Suspense } from "react";
import CategoryClient from "./CategoryClient";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

// SEO: Generate metadata
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const [categories, settings] = await Promise.all([
    getCategories(),
    getSiteSettings(),
  ]);
  const category = categories.find((c) => c.slug === params.slug);
  
  if (!category) {
    return { title: "Category Not Found" };
  }

  return {
    title: category.seoTitle || category.name,
    description: category.seoDescription || `Shop the best ${category.name.toLowerCase()} at ${settings.name}. Find great deals on top brands.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === params.slug);
  
  if (!category) {
    notFound();
  }

  const allProducts = await getAllProducts();
  // Pre-filter products for this category based on name
  const categoryProducts = allProducts.filter(
    (p) => p.category.toLowerCase() === category.name.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-[#F7F8FA] pb-12">
      <div className="border-b border-[#E6E8ED] bg-white">
        <div className="section-container py-5">
          <nav className="mb-2 flex items-center text-xs text-[#5E6976]" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[#2B2B66]">Home</Link>
            <ChevronRight className="mx-1 h-3.5 w-3.5" />
            <Link href="/categories" className="hover:text-[#2B2B66]">Categories</Link>
            <ChevronRight className="mx-1 h-3.5 w-3.5" />
            <span className="font-medium text-[#17212B]">{category.name}</span>
          </nav>
          <h1 className="font-display text-2xl font-bold text-[#2B2B66] sm:text-3xl">{category.name}</h1>
          <p className="mt-1 text-sm text-[#5E6976]">
            {categoryProducts.length} {categoryProducts.length === 1 ? "product" : "products"}
          </p>
        </div>
      </div>

      <div className="section-container mt-6">
        <Suspense fallback={<p className="py-8 text-sm text-[#5E6976]">Loading products...</p>}>
          <CategoryClient initialProducts={categoryProducts} categoryName={category.name} />
        </Suspense>
      </div>
    </div>
  );
}

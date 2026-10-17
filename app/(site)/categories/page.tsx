import Link from "next/link";
import Image from "next/image";
import { getDisplayImageUrl, hasValidProductImage } from "@/lib/products";
import { getCategories, getAllProducts, getSiteSettings } from "@/lib/db";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `Browse All Categories | ${settings.name}`,
    description: `Explore all electronics categories at ${settings.name}. Refrigerators, Air Conditioners, Washing Machines, LED TVs, and more.`,
  };
}

export default async function CategoriesPage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getAllProducts(),
  ]);

  const categoryCounts = categories.map((cat) => {
    const count = products.filter(
      (p) => p.category.toLowerCase() === cat.name.toLowerCase()
    ).length;
    return {
      ...cat,
      count,
    };
  });

  return (
    <div className="min-h-screen bg-[#F6F8FB] py-8 md:py-12">
      <div className="section-container">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-[#667085]">
          <Link href="/" className="hover:text-[#62648D]">Home</Link>
          <span>/</span>
          <span className="font-medium text-[#17212B]">Categories</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="font-display text-2xl font-bold text-[#2B2B66] md:text-4xl">
            Browse by Category
          </h1>
          <p className="mt-2 text-sm text-[#667085] md:text-base">
            Find the right appliance for your home from our wide selection of certified brand products.
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-6">
          {categoryCounts.map((cat) => {
            const categoryImage =
              cat.image ||
              products.find(
                (product) =>
                  product.category.toLowerCase() === cat.name.toLowerCase() &&
                  hasValidProductImage(product)
              )?.mainImage ||
              "/assets/system/product-image-placeholder.svg";
            return (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-[#E3E8EF] bg-white transition-all duration-200 hover:-translate-y-1 hover:border-[#62648D]/30 hover:shadow-lg"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-white">
                  <Image
                    src={getDisplayImageUrl(categoryImage)}
                    alt={cat.name}
                    fill
                    className="object-contain p-4"
                    unoptimized
                    sizes="(max-width: 640px) 50vw, 20vw"
                  />
                </div>
              <div className="flex flex-1 flex-col justify-between p-4">
                <div>
                  <h2 className="font-display text-base font-bold text-[#17212B] group-hover:text-[#2B2B66] transition-colors">
                    {cat.name}
                  </h2>
                  <p className="mt-1 text-xs text-[#667085]">
                    {cat.count} {cat.count === 1 ? "Product" : "Products"}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#AE6965]">
                  <span>Explore</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

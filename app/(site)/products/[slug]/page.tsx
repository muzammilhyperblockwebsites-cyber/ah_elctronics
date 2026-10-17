import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import {
  ChevronRight,
  MessageCircle,
  Check,
  Info,
  Phone,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";

import { getProductBySlug, getAllProducts, getSiteSettings } from "@/lib/db";
import {
  formatPrice,
  getProductImage,
  getCategorySlug,
} from "@/lib/products";
import { siteConfig } from "@/lib/siteConfig";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductGallery } from "@/components/site/ProductGallery";
import { WhatsAppOrderModal } from "@/components/site/WhatsAppOrderModal";
import {
  ProductStructuredData,
  BreadcrumbStructuredData,
} from "@/components/seo/structured-data";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const [product, settings] = await Promise.all([
    getProductBySlug(params.slug),
    getSiteSettings(),
  ]);

  if (!product) {
    return { title: "Product Not Found" };
  }

  const title = product.seoTitle || `${product.name} | ${product.brand} - ${settings.name}`;
  const description =
    product.seoDescription ||
    product.shortDescription ||
    `${product.name} (${product.model}) by ${product.brand}. View specifications, price, and order directly on WhatsApp with ${settings.name}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [getProductImage(product)],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const [product, allProducts, settings] = await Promise.all([
    getProductBySlug(params.slug),
    getAllProducts(),
    getSiteSettings(),
  ]);

  if (!product) {
    notFound();
  }

  const categorySlug = getCategorySlug(product.category);

  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 4);

  const allImages = [
    getProductImage(product),
    ...(product.gallery || []).filter((img) => img !== getProductImage(product)),
  ];

  return (
    <>
      <ProductStructuredData product={product} />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: `${siteConfig.seo.siteUrl}/` },
          {
            name: product.category,
            url: `${siteConfig.seo.siteUrl}/category/${categorySlug}`,
          },
          {
            name: product.name,
            url: `${siteConfig.seo.siteUrl}/products/${product.slug}`,
          },
        ]}
      />

      <div className="min-h-screen bg-[#F6F8FB] py-6 sm:py-10 pb-24 md:pb-12">
        <div className="section-container">
          {/* Breadcrumbs */}
          <nav
            className="flex items-center text-xs sm:text-sm text-[#667085] mb-6 overflow-x-auto whitespace-nowrap"
            aria-label="Breadcrumb"
          >
            <ol className="flex items-center space-x-1.5 sm:space-x-2">
              <li>
                <Link href="/" className="hover:text-[#2B2B66]">
                  Home
                </Link>
              </li>
              <li>
                <ChevronRight className="w-3.5 h-3.5" />
              </li>
              <li>
                <Link
                  href={`/category/${categorySlug}`}
                  className="hover:text-[#2B2B66]"
                >
                  {product.category}
                </Link>
              </li>
              <li>
                <ChevronRight className="w-3.5 h-3.5" />
              </li>
              <li className="text-[#17212B] font-semibold truncate max-w-[200px] sm:max-w-md">
                {product.name}
              </li>
            </ol>
          </nav>

          {/* Product Details Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white rounded-3xl p-5 sm:p-8 lg:p-10 border border-[#E3E8EF] shadow-xs">
            {/* Left: Product Gallery (5 cols) */}
            <div className="lg:col-span-5">
              <ProductGallery
                images={allImages}
                productName={product.name}
              />
            </div>

            {/* Right: Product Info & Actions (7 cols) */}
            <div className="lg:col-span-7 flex flex-col">
              {/* Brand & Series Header */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Link
                  href={`/brand/${getCategorySlug(product.brand)}`}
                  className="inline-block bg-[#F6F8FB] hover:bg-[#E3E8EF] border border-[#E3E8EF] text-[#2B2B66] text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider transition-colors"
                >
                  {product.brand}
                </Link>
                {product.series && (
                  <span className="text-xs text-[#667085] bg-slate-50 px-2 py-1 rounded-md border border-[#E3E8EF]">
                    Series: {product.series}
                  </span>
                )}
                {product.subcategory && (
                  <span className="text-xs text-[#667085] bg-slate-50 px-2 py-1 rounded-md border border-[#E3E8EF]">
                    {product.subcategory}
                  </span>
                )}
              </div>

              {/* Product Title */}
              <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-extrabold text-[#2B2B66] mb-2 leading-snug">
                {product.name}
              </h1>

              {/* Model Number */}
              <p className="text-xs sm:text-sm text-[#667085] font-mono mb-4">
                Model:{" "}
                <span className="text-[#17212B] font-bold">
                  {product.model || "N/A"}
                </span>
              </p>

              {/* Price & Availability Bar */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F6F8FB] border border-[#E3E8EF] mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider block mb-0.5">
                    Price
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#2B2B66]">
                    {formatPrice(product.price)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{product.availability || "Confirm via WhatsApp"}</span>
                </div>
              </div>

              {/* Pricing Notice */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 sm:p-4 flex gap-3 text-amber-900 text-xs sm:text-sm mb-6">
                <Info className="w-5 h-5 flex-shrink-0 text-amber-700 mt-0.5" />
                <p className="leading-relaxed">
                  Prices and availability may change. Please confirm the latest price and stock status on WhatsApp before placing your order.
                </p>
              </div>

              {/* Primary & Secondary Actions */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex-1">
                  <WhatsAppOrderModal
                    product={product}
                    trigger={
                      <button
                        type="button"
                        className="w-full flex items-center justify-center gap-2 bg-whatsapp hover:bg-whatsapp/90 text-white py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                      >
                        <ShoppingBag className="w-5 h-5" />
                        <span>Order on WhatsApp</span>
                      </button>
                    }
                  />
                </div>

                <div className="flex-1">
                  <WhatsAppOrderModal
                    product={product}
                    trigger={
                      <button
                        type="button"
                        className="w-full flex items-center justify-center gap-2 bg-[#F6F8FB] hover:bg-[#E3E8EF] text-[#2B2B66] border border-[#2B2B66]/30 py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base transition-colors"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>Ask About This Product</span>
                      </button>
                    }
                  />
                </div>
              </div>

              {/* Quick Contact & Share row */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#E3E8EF] text-xs text-[#667085]">
                <a
                  href={`tel:${settings.contact.phoneCall}`}
                  className="inline-flex items-center gap-1.5 hover:text-[#2B2B66] transition-colors font-medium"
                >
                  <Phone className="w-3.5 h-3.5 text-[#2B2B66]" />
                  <span>Call: {settings.contact.phone}</span>
                </a>

                {product.warranty ? (
                  <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                    <ShieldCheck className="w-4 h-4 text-[#2B2B66]" />
                    <span>{product.warranty}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                    <ShieldCheck className="w-4 h-4 text-[#2B2B66]" />
                    <span>Manufacturer Warranty Applicable</span>
                  </span>
                )}
              </div>

              {/* Short Description */}
              {product.shortDescription && (
                <div className="mt-6 pt-6 border-t border-[#E3E8EF]">
                  <h2 className="font-display text-sm font-bold text-[#2B2B66] mb-2 uppercase tracking-wider">
                    Overview
                  </h2>
                  <p className="text-sm text-[#667085] leading-relaxed whitespace-pre-line">
                    {product.shortDescription}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Specifications Table */}
          {product.specifications &&
            Object.keys(product.specifications).length > 0 && (
              <div className="mt-10 bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-[#E3E8EF] shadow-xs">
                <h2 className="text-xl sm:text-2xl font-display font-extrabold text-[#2B2B66] mb-4">
                  Product Specifications
                </h2>
                <p className="text-xs sm:text-sm text-[#667085] mb-6">
                  Official specifications as supplied for model {product.model || product.name}.
                </p>

                <div className="border border-[#E3E8EF] rounded-2xl overflow-hidden overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm text-left divide-y divide-[#E3E8EF]">
                    <tbody>
                      {Object.entries(product.specifications).map(
                        ([key, value], idx) => (
                          <tr
                            key={key}
                            className={
                              idx % 2 === 0 ? "bg-[#F6F8FB]/60" : "bg-white"
                            }
                          >
                            <th className="py-3 px-4 sm:px-6 font-semibold text-[#17212B] w-1/3 sm:w-1/4 align-top break-words">
                              {key}
                            </th>
                            <td className="py-3 px-4 sm:px-6 text-[#667085] leading-relaxed break-words">
                              {value}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-12 sm:mt-16">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-display font-extrabold text-[#2B2B66]">
                    Related Products
                  </h2>
                  <p className="text-xs sm:text-sm text-[#667085] mt-1">
                    Similar models in {product.category}
                  </p>
                </div>
                <Link
                  href={`/category/${categorySlug}`}
                  className="text-xs sm:text-sm font-bold text-[#2B2B66] hover:underline"
                >
                  View All &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Mobile WhatsApp CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-3.5 bg-white/95 backdrop-blur-md border-t border-[#E3E8EF] shadow-lg md:hidden z-40">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#17212B] truncate">
              {product.name}
            </p>
            <p className="text-xs font-bold text-[#2B2B66]">
              {formatPrice(product.price)}
            </p>
          </div>
          <div className="flex-shrink-0">
            <WhatsAppOrderModal
              product={product}
              trigger={
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 bg-whatsapp hover:bg-whatsapp/90 text-white py-2.5 px-4 rounded-xl font-bold text-xs shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Order on WhatsApp</span>
                </button>
              }
            />
          </div>
        </div>
      </div>
    </>
  );
}

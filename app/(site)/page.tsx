import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";
import {
  getAllProducts,
  getBrands,
  getCategories,
  getHeroSlides,
  getPromoBanners,
  getSiteSettings,
} from "@/lib/db";
import { Product, hasValidProductImage, getDisplayImageUrl, isDirectImage } from "@/lib/products";
import { brandsForCategory } from "@/lib/categoryMenus";
import { HomeHero } from "@/components/site/HomeHero";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductRow } from "@/components/site/ProductRow";
import { CategoryCircle, HomeFaq } from "@/components/site/HomeExtras";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { Award, MessageCircle, Package, Phone, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

const FALLBACK_CATEGORY_IMAGES: Record<string, string> = {
  refrigerators: "/assets/banners/hero-refrigerator.jpg",
  "air-conditioners": "/assets/banners/promo-cooling.jpg",
  "washing-machines": "/assets/banners/hero-washer.jpg",
  "led-tvs": "/assets/banners/hero-led-tv.jpg",
  "deep-freezers": "/assets/banners/mega-freezer.jpg",
  "water-dispensers": "/assets/banners/mega-water.jpg",
  "kitchen-small-appliances": "/assets/banners/hero-kitchen.jpg",
  motorcycles: "/assets/banners/promo-motorcycle.jpg",
  "microwave-ovens-air-fryers": "/assets/banners/mega-microwave.jpg",
  "spare-parts-accessories": "/assets/banners/mega-parts.jpg",
};

const BRAND_LOGOS: Record<string, string> = {
  haier: "/assets/branding/brand-haier.svg",
  dawlance: "/assets/branding/brand-dawlance.svg",
  orient: "/assets/branding/brand-orient.svg",
  canon: "/assets/branding/brand-canon.svg",
  "atlas-honda": "/assets/branding/brand-atlas-honda.svg",
};

function hasPhoto(product: Product) {
  return hasValidProductImage(product.mainImage);
}

function categoryProducts(categoryName: string, products: Product[]) {
  return products.filter(
    (product) => product.category.toLowerCase() === categoryName.toLowerCase() && hasPhoto(product)
  );
}

function PromoBand({
  href,
  image,
  kicker,
  title,
  subtitle,
  cta,
  external = false,
}: {
  href: string;
  image: string;
  kicker: string;
  title: string;
  subtitle?: string;
  cta: string;
  external?: boolean;
}) {
  const imgSrc = getDisplayImageUrl(image || "/assets/banners/promo-cooling.jpg");
  return (
    <div className="section-container">
      <Link
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="relative block min-h-[148px] overflow-hidden rounded-2xl sm:min-h-[168px]"
      >
        <Image
          src={imgSrc}
          alt={title}
          fill
          unoptimized={isDirectImage(imgSrc)}
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2B2B66]/90 via-[#2B2B66]/55 to-transparent" />
        <div className="relative flex h-full min-h-[148px] sm:min-h-[168px] flex-col justify-center px-5 py-4 sm:px-10">
          {kicker && (
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/75">{kicker}</p>
          )}
          <h2 className="mt-1 font-display text-xl font-bold text-white sm:text-3xl">{title}</h2>
          {subtitle && (
            <p className="mt-1 max-w-xl text-xs sm:text-sm text-white/85 line-clamp-2">{subtitle}</p>
          )}
          <span className="mt-3 inline-flex h-9 w-fit items-center rounded-full bg-white px-4 text-xs sm:text-sm font-bold text-[#2B2B66]">
            {cta}
          </span>
        </div>
      </Link>
    </div>
  );
}

export default async function HomePage() {
  const [products, categories, brands, heroSlides, promoBanners, settings] = await Promise.all([
    getAllProducts(),
    getCategories(),
    getBrands(),
    getHeroSlides(),
    getPromoBanners(),
    getSiteSettings(),
  ]);

  const activeCategories =
    categories && categories.length > 0
      ? categories
      : siteConfig.categories.map((c, idx) => ({
          id: c.slug,
          name: c.name,
          slug: c.slug,
          description: "",
          image: c.image,
          icon: c.icon,
          subcategories: "subcategories" in c ? [...c.subcategories] : [],
          productCount: 0,
          order: idx,
        }));

  const pictured = products.filter(hasPhoto);
  const featured = pictured.filter((product) => product.featured);
  const popular = (featured.length >= 8 ? featured : pictured).slice(0, 12);
  const popularIds = new Set(popular.map((product) => product.id));
  const specialPool = pictured.filter((product) => !popularIds.has(product.id));
  const specialPicks = (specialPool.length >= 12 ? specialPool : pictured).slice(0, 12);
  const offers = pictured.filter((product) => product.specialOffer).slice(0, 12);

  const rows = activeCategories
    .map((category) => {
      const items = categoryProducts(category.name, products).slice(0, 10);
      if (items.length === 0) return null;
      return { category, items };
    })
    .filter((item): item is { category: (typeof activeCategories)[number]; items: Product[] } => Boolean(item))
    .slice(0, 6);

  const resolveBannerHref = (ctaLink?: string) => {
    if (!ctaLink || ctaLink === "whatsapp") {
      return {
        href: getWhatsAppUrl(
          `Hello ${settings.name}, I would like help choosing a product.`,
          settings.contact.whatsappClean
        ),
        external: true,
      };
    }
    return { href: ctaLink, external: ctaLink.startsWith("http") };
  };

  const primaryPromo = promoBanners[0] || {
    heading: "Cooling for every room",
    subheading: "Explore inverter and split air conditioners from leading brands.",
    tag: "Air conditioners",
    ctaText: "Shop air conditioners",
    ctaLink: "/category/air-conditioners",
    desktopImage: "/assets/banners/promo-cooling.jpg",
    mobileImage: "/assets/banners/promo-cooling.jpg",
  };

  const secondaryPromo = promoBanners[1] || {
    heading: "Atlas Honda motorcycles",
    subheading: "Browse motorcycles and mobility options in our catalog.",
    tag: "Motorcycles",
    ctaText: "View motorcycles",
    ctaLink: "/category/motorcycles",
    desktopImage: "/assets/banners/promo-motorcycle.jpg",
    mobileImage: "/assets/banners/promo-motorcycle.jpg",
  };

  const extraPromos = promoBanners.slice(2);

  const services = [
    { icon: Package, title: siteConfig.benefits[0].title, text: siteConfig.benefits[0].description },
    { icon: Award, title: siteConfig.benefits[1].title, text: siteConfig.benefits[1].description },
    { icon: MessageCircle, title: siteConfig.benefits[2].title, text: siteConfig.benefits[2].description },
  ];

  const primaryPromoLink = resolveBannerHref(primaryPromo.ctaLink);
  const secondaryPromoLink = resolveBannerHref(secondaryPromo.ctaLink);

  return (
    <div className="bg-[#F7F8FA] pb-8">
      <HomeHero slides={heroSlides} />

      <section className="bg-[#F7F8FA] py-5" aria-label="Shop by category">
        <div className="section-container flex gap-4 overflow-x-auto pb-1 hide-scrollbar">
          {activeCategories.map((category) => {
            const fallback =
              FALLBACK_CATEGORY_IMAGES[category.slug] ||
              category.image ||
              "/assets/banners/hero-kitchen.jpg";
            const productPhoto = categoryProducts(category.name, products)[0]?.mainImage;
            const circleImage =
              (category.image && hasValidProductImage(category.image) ? category.image : "") ||
              productPhoto ||
              fallback;
            return (
              <CategoryCircle
                key={category.slug}
                href={`/category/${category.slug}`}
                name={category.name}
                image={circleImage}
                fallback={fallback}
              />
            );
          })}
        </div>
      </section>

      {popular.length > 0 && (
        <section className="py-6">
          <div className="section-container">
            <div className="mb-3 flex items-end justify-between gap-3">
              <h2 className="font-display text-2xl font-bold text-[#62648D]">
                {offers.length > 0 ? "Offers" : "Popular Products"}
              </h2>
              <Link href={offers.length > 0 ? "/offers" : "/products"} className="text-sm font-semibold text-[#5E6976] hover:text-[#62648D]">
                View all
              </Link>
            </div>
            <ProductRow products={offers.length > 0 ? offers : popular} />
          </div>
        </section>
      )}

      <section className="pb-6">
        <PromoBand
          href={primaryPromoLink.href}
          external={primaryPromoLink.external}
          image={primaryPromo.desktopImage}
          kicker={primaryPromo.tag || "Featured"}
          title={primaryPromo.heading}
          subtitle={primaryPromo.subheading}
          cta={primaryPromo.ctaText || "Shop now"}
        />
      </section>

      {specialPicks.length > 0 && (
        <section className="pb-8">
          <div className="section-container">
            <div className="mb-3 flex items-end justify-between gap-3">
              <h2 className="font-display text-2xl font-bold text-[#17212B]">Special Picks</h2>
              <Link href="/products" className="text-sm font-semibold text-[#5E6976] hover:text-[#62648D]">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {specialPicks.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {rows.map(({ category, items }, index) => (
        <section key={category.slug} className="pb-8">
          <div className="section-container">
            <div className="mb-3 flex items-end justify-between gap-3">
              <h2 className="font-display text-xl font-bold text-[#17212B]">{category.name}</h2>
              <Link href={`/category/${category.slug}`} className="text-sm font-semibold text-[#5E6976] hover:text-[#62648D]">
                View all
              </Link>
            </div>
            <ProductRow products={items} />
          </div>
          {index === 0 && (
            <div className="mt-8">
              <PromoBand
                href={secondaryPromoLink.href}
                external={secondaryPromoLink.external}
                image={secondaryPromo.desktopImage}
                kicker={secondaryPromo.tag || "Special"}
                title={secondaryPromo.heading}
                subtitle={secondaryPromo.subheading}
                cta={secondaryPromo.ctaText || "Explore now"}
              />
            </div>
          )}
        </section>
      ))}

      {extraPromos.length > 0 && (
        <section className="pb-8 space-y-4">
          {extraPromos.map((promo) => {
            const linkInfo = resolveBannerHref(promo.ctaLink);
            return (
              <PromoBand
                key={promo.id}
                href={linkInfo.href}
                external={linkInfo.external}
                image={promo.desktopImage}
                kicker={promo.tag || "Promotion"}
                title={promo.heading}
                subtitle={promo.subheading}
                cta={promo.ctaText || "Learn more"}
              />
            );
          })}
        </section>
      )}

      <section className="pb-8">
        <div className="section-container">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="font-display text-xl font-bold text-[#17212B]">
              Featured Brands
              <span className="mt-1 block h-0.5 w-10 bg-[#89393B]" />
            </h2>
            <Link href="/products" className="text-sm font-semibold text-[#5E6976] hover:text-[#62648D]">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {brands.map((brand) => {
              const logo =
                (brand.logo && (brand.logo.startsWith("http") || brand.logo.startsWith("/"))
                  ? brand.logo
                  : "") || BRAND_LOGOS[brand.slug] || "";
              return (
                <Link
                  key={brand.slug}
                  href={`/brand/${brand.slug}`}
                  className="flex h-[88px] items-center justify-center rounded-xl border border-[#E6E8ED] bg-white px-4 hover:border-[#AE6965]/40"
                >
                  {logo ? (
                    <Image
                      src={getDisplayImageUrl(logo)}
                      alt={brand.name}
                      width={180}
                      height={48}
                      className="max-h-12 w-auto object-contain"
                      unoptimized={isDirectImage(logo)}
                    />
                  ) : (
                    <span className="text-sm font-bold text-[#2B2B66]">{brand.name}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-[#E6E8ED] bg-white py-6">
        <div className="section-container grid gap-4 md:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div key={service.title} className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F3EEEE] text-[#AE6965]">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#17212B]">{service.title}</h3>
                  <p className="mt-1 text-sm leading-5 text-[#5E6976]">{service.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="py-8">
        <div className="section-container grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="mb-3 font-display text-xl font-bold text-[#17212B]">Shop by category</h2>
            <div className="overflow-hidden rounded-xl border border-[#E6E8ED] bg-white">
              {activeCategories.map((category) => {
                const names = brandsForCategory(products, category.name);
                return (
                  <div key={category.slug} className="flex flex-col gap-2 border-b border-[#F1F2F4] px-4 py-3 last:border-b-0 sm:flex-row sm:items-center">
                    <Link href={`/category/${category.slug}`} className="w-48 shrink-0 text-sm font-bold text-[#17212B] hover:text-[#62648D]">
                      {category.name}
                    </Link>
                    <div className="flex flex-wrap gap-2">
                      {names.map((name) => (
                        <Link
                          key={name}
                          href={`/category/${category.slug}?brand=${encodeURIComponent(name)}`}
                          className="rounded-full border border-[#E6E8ED] px-3 py-1 text-xs font-semibold text-[#5E6976] hover:border-[#AE6965] hover:text-[#62648D]"
                        >
                          {name}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <h2 className="mb-3 font-display text-xl font-bold text-[#17212B]">FAQ</h2>
            <HomeFaq items={siteConfig.faq.slice(0, 6).map((item) => ({ question: item.question, answer: item.answer }))} />
          </div>
        </div>
      </section>

      <section className="pb-4">
        <div className="section-container">
          <div className="rounded-2xl bg-[#F7F8FA] px-4 py-8 text-center sm:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8A93A0]">Help centre</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-[#17212B]">Online support</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <a href={`tel:${settings.contact.phoneCall}`} className="flex items-center gap-3 rounded-2xl sm:rounded-full bg-white px-4 py-3 text-left shadow-sm">
                <Phone className="h-5 w-5 shrink-0 text-[#AE6965]" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-[#17212B]">Call us</span>
                  <span className="block truncate text-xs text-[#5E6976]">{settings.contact.phone} · {settings.contact.mobile}</span>
                </span>
              </a>
              <a
                href={getWhatsAppUrl(`Hello ${settings.name}, I would like help choosing a product.`, settings.contact.whatsappClean)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl sm:rounded-full bg-white px-4 py-3 text-left shadow-sm"
              >
                <MessageCircle className="h-5 w-5 shrink-0 text-[#25D366]" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-[#17212B]">WhatsApp</span>
                  <span className="block truncate text-xs text-[#5E6976]">{settings.contact.whatsapp}</span>
                </span>
              </a>
              <a href={`mailto:${settings.contact.email}`} className="flex items-center gap-3 rounded-2xl sm:rounded-full bg-white px-4 py-3 text-left shadow-sm sm:col-span-2 lg:col-span-1">
                <Mail className="h-5 w-5 shrink-0 text-[#AE6965]" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-[#17212B]">Email us</span>
                  <span className="block truncate text-xs text-[#5E6976]">{settings.contact.email}</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

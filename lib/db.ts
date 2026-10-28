import { prisma } from "./prisma";
import { Product } from "./products";
import { siteConfig } from "./siteConfig";
import productsCatalogJson from "@/data/products.json";

const AI_IMAGE_OVERRIDE_BY_SLUG = new Map<string, string>();
for (const item of productsCatalogJson as Array<{ slug?: string; mainImage?: string }>) {
  if (item.slug && item.mainImage && item.mainImage.startsWith("/assets/products/ai/")) {
    AI_IMAGE_OVERRIDE_BY_SLUG.set(item.slug, item.mainImage);
  }
}

function transformProduct(p: any): Product {
  let gallery: string[] = [];
  let specifications: Record<string, string> = {};

  try {
    gallery = typeof p.gallery === "string" ? JSON.parse(p.gallery) : p.gallery || [];
  } catch {
    gallery = [];
  }

  try {
    specifications =
      typeof p.specifications === "string"
        ? JSON.parse(p.specifications)
        : p.specifications || {};
  } catch {
    specifications = {};
  }

  const aiOverride = p.slug ? AI_IMAGE_OVERRIDE_BY_SLUG.get(p.slug) : undefined;
  const rawMain = p.mainImage || "";
  const needsAiOverride =
    Boolean(aiOverride) &&
    (!rawMain ||
      rawMain.includes("placeholder") ||
      rawMain.includes("/medias/") ||
      rawMain.includes("cdn.shopify.com") ||
      rawMain.startsWith("/assets/products/ai/"));

  const resolvedMainImage = needsAiOverride
    ? aiOverride!
    : rawMain || "/assets/system/product-image-placeholder.svg";

  if (needsAiOverride && aiOverride) {
    gallery = [aiOverride];
  }

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    model: p.model,
    category: p.category,
    subcategory: p.subcategory || "",
    series: p.series || "",
    price: p.price !== null && p.price > 0 ? p.price : null,
    priceSource: (p.priceSource as any) || (p.price ? "json" : "none"),
    mainImage: resolvedMainImage,
    gallery,
    specifications,
    shortDescription: p.shortDescription || "",
    warranty: p.warranty || "",
    availability: p.availability || p.stockStatus || "In Stock",
    stockStatus: p.stockStatus || p.availability || "In Stock",
    featured: Boolean(p.featured),
    specialOffer: Boolean(p.specialOffer),
    sourceUrl: p.sourceUrl || "",
    seoTitle: p.seoTitle || "",
    seoDescription: p.seoDescription || "",
  };
}

/**
 * Fetch all products from MongoDB.
 */
export async function getAllProducts(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      orderBy: { id: "asc" },
    });
    if (products && products.length > 0) {
      return products.map(transformProduct);
    }
  } catch (err) {
    console.error("Failed to load products from MongoDB:", err);
    throw err;
  }
  return [];
}

/**
 * Fetch a single product by slug from MongoDB.
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
    });
    if (product) {
      return transformProduct(product);
    }
  } catch (err) {
    console.error("Database lookup error for slug:", slug, err);
    throw err;
  }
  return null;
}

/**
 * Fetch featured products for homepage
 */
export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: { featured: true },
      take: limit,
      orderBy: { updatedAt: "desc" },
    });
    if (products && products.length > 0) {
      return products.map(transformProduct);
    }
  } catch (err) {
    console.error("Failed to load featured products from MongoDB:", err);
    throw err;
  }
  return [];
}

/**
 * Fetch special offers
 */
export async function getSpecialOffers(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: { specialOffer: true },
      orderBy: { updatedAt: "desc" },
    });
    if (products && products.length > 0) {
      return products.map(transformProduct);
    }
  } catch (err) {
    console.error("Failed to load special offers from MongoDB:", err);
    throw err;
  }
  return [];
}

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  subcategories: string[];
  productCount: number;
  seoTitle?: string;
  seoDescription?: string;
}

export interface DbBrand {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  productCount: number;
}

export interface DbHeroSlide {
  id: string;
  heading: string;
  subheading: string;
  text: string;
  badge: string;
  ctaText: string;
  ctaLink: string;
  desktopImage: string;
  mobileImage: string;
}

export interface DbPromoBanner {
  id: string;
  heading: string;
  subheading: string;
  tag: string;
  ctaText: string;
  ctaLink: string;
  desktopImage: string;
  mobileImage: string;
}

/**
 * Fetch categories from database with product count
 */
export async function getCategories(): Promise<DbCategory[]> {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
    });
    if (categories && categories.length > 0) {
      return Promise.all(
        categories.map(async (c) => {
          const productCount = await prisma.product.count({
            where: { category: c.name },
          });
          let subcategories: string[] = [];
          try {
            subcategories = JSON.parse(c.subcategories || "[]");
          } catch {}
          return {
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description,
            image: c.image,
            icon: c.icon,
            subcategories,
            productCount,
            seoTitle: c.seoTitle || `${c.name} | ${siteConfig.name}`,
            seoDescription: c.seoDescription || `Browse ${c.name} at ${siteConfig.name}.`,
          };
        })
      );
    }
  } catch (err) {
    console.error("Failed to load categories from MongoDB:", err);
    throw err;
  }
  return [];
}

/**
 * Fetch brands from database with product count
 */
export async function getBrands(): Promise<DbBrand[]> {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { order: "asc" },
    });
    if (brands && brands.length > 0) {
      return Promise.all(
        brands.map(async (b) => {
          const productCount = await prisma.product.count({
            where: { brand: b.name },
          });
          return {
            id: b.id,
            name: b.name,
            slug: b.slug,
            description: b.description,
            logo: b.logo,
            productCount,
          };
        })
      );
    }
  } catch (err) {
    console.error("Failed to load brands from MongoDB:", err);
    throw err;
  }
  return [];
}

/**
 * Fetch hero slides
 */
export async function getHeroSlides(): Promise<DbHeroSlide[]> {
  try {
    const slides = await prisma.heroSlide.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });
    if (slides && slides.length > 0) {
      return slides.map((s) => ({
        id: s.id,
        heading: s.title,
        subheading: s.subtitle,
        text: s.description,
        badge: s.badge,
        ctaText: s.ctaText,
        ctaLink: s.ctaLink,
        desktopImage: s.imageDesktop,
        mobileImage: s.imageMobile || s.imageDesktop,
      }));
    }
  } catch (err) {
    console.error("Failed to load hero slides from MongoDB:", err);
    throw err;
  }
  return [];
}

/**
 * Fetch promo banners
 */
export async function getPromoBanners(): Promise<DbPromoBanner[]> {
  try {
    const banners = await prisma.promoBanner.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });
    if (banners && banners.length > 0) {
      return banners.map((b) => ({
        id: b.id,
        heading: b.title,
        subheading: b.subtitle,
        tag: b.tag,
        ctaText: b.ctaText,
        ctaLink: b.ctaLink,
        desktopImage: b.imageDesktop,
        mobileImage: b.imageMobile || b.imageDesktop,
      }));
    }
  } catch (err) {
    console.error("Failed to load promo banners from MongoDB:", err);
    throw err;
  }
  return [];
}

/**
 * Fetch live website settings merged with default siteConfig
 */
export async function getSiteSettings() {
  try {
    const settingsList = await prisma.siteSetting.findMany();
    if (settingsList && settingsList.length > 0) {
      const map: Record<string, any> = {};
      settingsList.forEach((s) => {
        const trimmed = (s.value || "").trim();
        if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
          try {
            map[s.key] = JSON.parse(trimmed);
          } catch {
            map[s.key] = s.value;
          }
        } else {
          map[s.key] = s.value;
        }
      });

      const parsedHours =
        map.businessHours && typeof map.businessHours === "object"
          ? map.businessHours
          : {};

      const parsedSocial =
        map.social && typeof map.social === "object" ? map.social : {};

      return {
        ...siteConfig,
        name: String(map.businessName || siteConfig.name),
        tagline: String(map.tagline || siteConfig.tagline),
        description: String(map.description || siteConfig.description),
        shortDescription: String(map.description || siteConfig.shortDescription),
        contact: {
          ...siteConfig.contact,
          phone: String(map.phone || siteConfig.contact.phone),
          mobile: String(map.mobile || siteConfig.contact.mobile),
          whatsapp: String(map.whatsapp || siteConfig.contact.whatsapp),
          phoneCall: String(map.phoneCall || siteConfig.contact.phoneCall),
          mobileCall: String(map.mobileCall || siteConfig.contact.mobileCall),
          whatsappClean: String(map.whatsappClean || siteConfig.contact.whatsappClean),
          whatsappIntl: String(map.whatsappIntl || siteConfig.contact.whatsappIntl),
          email: String(map.email || siteConfig.contact.email),
          address: String(map.address || siteConfig.contact.address),
        },
        businessHours: {
          ...siteConfig.businessHours,
          weekdays: String(parsedHours.weekdays || siteConfig.businessHours.weekdays),
          weekends: String(parsedHours.weekends || siteConfig.businessHours.weekends),
          note: String(parsedHours.note || siteConfig.businessHours.note),
        },
        social: {
          ...siteConfig.social,
          ...parsedSocial,
        },
        announcements: Array.isArray(map.announcements) && map.announcements.length > 0
          ? map.announcements
          : siteConfig.announcements,
      };
    }
  } catch (err) {
    console.error("Failed to load site settings from MongoDB:", err);
  }

  return siteConfig;
}

export type DynamicSiteSettings = Awaited<ReturnType<typeof getSiteSettings>>;

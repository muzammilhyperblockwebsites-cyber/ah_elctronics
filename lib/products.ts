// ============================================================
// A H Electronics — Product Types, Normalization & Utilities
// ============================================================

// ── Product Type ─────────────────────────────────────────────

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  subcategory: string;
  series: string;
  price: number | null;
  priceSource: "price-list" | "json" | "none";
  mainImage: string;
  gallery: string[];
  specifications: Record<string, string>;
  shortDescription: string;
  warranty: string;
  availability: string;
  featured: boolean;
  specialOffer: boolean;
  sourceUrl: string;
  stockStatus?: string;
  seoTitle?: string;
  seoDescription?: string;
}

// ── Price Formatting ─────────────────────────────────────────

export function formatPrice(price: number | null): string {
  if (!price || price <= 0 || !isFinite(price)) return "Contact for Price";
  return `PKR ${price.toLocaleString("en-PK")}`;
}

export function isPriceAvailable(price: number | null): boolean {
  return price !== null && price > 0 && isFinite(price);
}

// ── Slug Generation ──────────────────────────────────────────

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

// ── Category Normalization Map ───────────────────────────────

const CATEGORY_MAP: Record<string, { category: string; subcategory: string }> = {
  // Air Conditioners
  "air conditioner": { category: "Air Conditioners", subcategory: "" },
  "air conditioners": { category: "Air Conditioners", subcategory: "" },
  "split air conditioners": { category: "Air Conditioners", subcategory: "Split" },
  "inverter split ac": { category: "Air Conditioners", subcategory: "Inverter Split" },
  "inverter floor standing ac": { category: "Air Conditioners", subcategory: "Floor Standing" },
  "summer": { category: "Air Conditioners", subcategory: "" }, // Canon campaign

  // Refrigerators
  "refrigerator": { category: "Refrigerators", subcategory: "" },
  "refrigerators": { category: "Refrigerators", subcategory: "" },
  "refrigerators and freezers": { category: "Refrigerators", subcategory: "" },
  "double door refrigerator": { category: "Refrigerators", subcategory: "Double Door" },
  "single door refrigerator": { category: "Refrigerators", subcategory: "Single Door" },
  "multi door refrigerator": { category: "Refrigerators", subcategory: "Multi Door" },
  "no frost refrigerator": { category: "Refrigerators", subcategory: "No Frost" },

  // Deep Freezers
  "deep freezer": { category: "Deep Freezers", subcategory: "" },
  "single door freezer": { category: "Deep Freezers", subcategory: "Single Door" },
  "twin door freezer": { category: "Deep Freezers", subcategory: "Twin Door" },
  "vertical freezer": { category: "Deep Freezers", subcategory: "Vertical" },
  "no frost vertical freezer": { category: "Deep Freezers", subcategory: "No Frost Vertical" },

  // LED TVs
  "led tv": { category: "LED TVs", subcategory: "" },
  "led tvs": { category: "LED TVs", subcategory: "" },
  "tvs": { category: "LED TVs", subcategory: "" },
  "skyworth tvs": { category: "LED TVs", subcategory: "Skyworth" },
  "hd tv": { category: "LED TVs", subcategory: "HD" },
  "2k fhd": { category: "LED TVs", subcategory: "2K FHD" },
  "2k hd": { category: "LED TVs", subcategory: "2K HD" },
  "4k uhd": { category: "LED TVs", subcategory: "4K UHD" },

  // Washing Machines
  "washing machine": { category: "Washing Machines", subcategory: "" },
  "washing machines": { category: "Washing Machines", subcategory: "" },
  "front load washing machine": { category: "Washing Machines", subcategory: "Front Load" },
  "top load washing machine": { category: "Washing Machines", subcategory: "Top Load" },
  "twin tub washing machine": { category: "Washing Machines", subcategory: "Twin Tub" },
  "single tub washer": { category: "Washing Machines", subcategory: "Single Tub" },
  "spinner dryer": { category: "Washing Machines", subcategory: "Spinner Dryer" },

  // Water Dispensers
  "water dispenser": { category: "Water Dispensers", subcategory: "" },
  "water dispensers": { category: "Water Dispensers", subcategory: "" },
  "bottom load water dispensers": { category: "Water Dispensers", subcategory: "Bottom Load" },
  "with refrigerator": { category: "Water Dispensers", subcategory: "With Refrigerator" },
  "without refrigerator": { category: "Water Dispensers", subcategory: "Without Refrigerator" },
  "domestic water cooler": { category: "Water Dispensers", subcategory: "Domestic Cooler" },
  "industrial water cooler": { category: "Water Dispensers", subcategory: "Industrial Cooler" },
  "wintry mix": { category: "Water Dispensers", subcategory: "Water Heater" }, // Canon campaign

  // Microwave Ovens & Air Fryers
  "microwave oven & air fryer": { category: "Microwave Ovens & Air Fryers", subcategory: "" },
  "microwave ovens": { category: "Microwave Ovens & Air Fryers", subcategory: "" },
  "air fryer microwave oven": { category: "Microwave Ovens & Air Fryers", subcategory: "Air Fryer" },
  "baking microwave oven": { category: "Microwave Ovens & Air Fryers", subcategory: "Baking" },
  "grilling microwave oven": { category: "Microwave Ovens & Air Fryers", subcategory: "Grill" },
  "heating microwave oven": { category: "Microwave Ovens & Air Fryers", subcategory: "Heating" },
  "built in microwave oven": { category: "Microwave Ovens & Air Fryers", subcategory: "Built-In" },

  // Kitchen & Small Appliances
  "kitchen appliance": { category: "Kitchen & Small Appliances", subcategory: "" },
  "kitchen appliances": { category: "Kitchen & Small Appliances", subcategory: "" },
  "cooking appliances": { category: "Kitchen & Small Appliances", subcategory: "Cooking Appliances" },
  "home appliances": { category: "Kitchen & Small Appliances", subcategory: "" },
  "air fryer": { category: "Kitchen & Small Appliances", subcategory: "Air Fryer" },
  "blender": { category: "Kitchen & Small Appliances", subcategory: "Blender" },
  "built in hob": { category: "Kitchen & Small Appliances", subcategory: "Built-In Hob" },
  "built in hood": { category: "Kitchen & Small Appliances", subcategory: "Built-In Hood" },
  "built in oven": { category: "Kitchen & Small Appliances", subcategory: "Built-In Oven" },
  "coffee machines": { category: "Kitchen & Small Appliances", subcategory: "Coffee Machine" },
  "electric kettle": { category: "Kitchen & Small Appliances", subcategory: "Kettle" },
  "food processor": { category: "Kitchen & Small Appliances", subcategory: "Food Processor" },
  "hot plate": { category: "Kitchen & Small Appliances", subcategory: "Hot Plate" },
  "juicer": { category: "Kitchen & Small Appliances", subcategory: "Juicer" },
  "meat mincer": { category: "Kitchen & Small Appliances", subcategory: "Meat Mincer" },
  "mini oven": { category: "Kitchen & Small Appliances", subcategory: "Mini Oven" },
  "multi cooker": { category: "Kitchen & Small Appliances", subcategory: "Multi Cooker" },
  "sandwich maker": { category: "Kitchen & Small Appliances", subcategory: "Sandwich Maker" },
  "toaster": { category: "Kitchen & Small Appliances", subcategory: "Toaster" },
  "dishwasher": { category: "Kitchen & Small Appliances", subcategory: "Dishwasher" },
  "inverter dishwasher": { category: "Kitchen & Small Appliances", subcategory: "Dishwasher" },
  "dry iron": { category: "Kitchen & Small Appliances", subcategory: "Iron" },
  "steam iron": { category: "Kitchen & Small Appliances", subcategory: "Iron" },
  "garment steamer": { category: "Kitchen & Small Appliances", subcategory: "Garment Steamer" },
  "vacuum cleaner": { category: "Kitchen & Small Appliances", subcategory: "Vacuum Cleaner" },
  "hair dryer": { category: "Kitchen & Small Appliances", subcategory: "Hair Dryer" },
  "hair straightener": { category: "Kitchen & Small Appliances", subcategory: "Hair Straightener" },
  "grooming kit": { category: "Kitchen & Small Appliances", subcategory: "Grooming" },
  "shaver": { category: "Kitchen & Small Appliances", subcategory: "Grooming" },
  "trimmer": { category: "Kitchen & Small Appliances", subcategory: "Grooming" },

  // Motorcycles
  "motorcycles": { category: "Motorcycles", subcategory: "" },
  "ev": { category: "Motorcycles", subcategory: "Electric" },

  // Spare Parts & Accessories
  "spare parts": { category: "Spare Parts & Accessories", subcategory: "" },
  "spare parts & accessories": { category: "Spare Parts & Accessories", subcategory: "" },

  // Fallback
  "all products": { category: "Kitchen & Small Appliances", subcategory: "" },
  "missing category": { category: "Kitchen & Small Appliances", subcategory: "" },
};

export function normalizeCategory(raw: string, name = ""): { category: string; subcategory: string } {
  const key = raw.toLowerCase().trim();
  const mapped = CATEGORY_MAP[key] || { category: "Kitchen & Small Appliances", subcategory: "" };
  return refineMisfiledCategory(name, mapped.category, mapped.subcategory);
}

/** "All Products" was mapped to kitchen, which pulled TVs and dispensers into that row. */
export function refineMisfiledCategory(
  name: string,
  category: string,
  subcategory: string
): { category: string; subcategory: string } {
  if (category !== "Kitchen & Small Appliances") return { category, subcategory };
  const n = name.toLowerCase();
  if (/hood|htv|cnk-/.test(n)) return { category, subcategory };
  if (/\b(4k|uhd|smart tv|led tv)\b/.test(n) || /(?<![a-z])tv\b/.test(n)) {
    return { category: "LED TVs", subcategory: /4k|uhd/.test(n) ? "4K UHD" : "" };
  }
  if (n.includes("water dispenser") || n.includes("water cooler")) {
    return { category: "Water Dispensers", subcategory: "" };
  }
  if (n.includes("microwave")) {
    return { category: "Microwave Ovens & Air Fryers", subcategory: n.includes("built") ? "Built-In" : "" };
  }
  return { category, subcategory };
}

// ── Brand Normalization ──────────────────────────────────────

export function normalizeBrand(raw: string, company: string): string {
  const lower = raw.toLowerCase().trim();
  if (lower.includes("haier")) return "Haier";
  if (lower.includes("dawlance")) return "Dawlance";
  if (lower.includes("orient")) return "Orient";
  if (lower.includes("canon")) return "Canon";
  if (lower.includes("atlas") || lower.includes("honda")) return "Atlas Honda";
  // Fallback to company field
  const compLower = company.toLowerCase().trim();
  if (compLower.includes("haier")) return "Haier";
  if (compLower.includes("dawlance")) return "Dawlance";
  if (compLower.includes("orient")) return "Orient";
  if (compLower.includes("canon")) return "Canon";
  if (compLower.includes("atlas") || compLower.includes("honda")) return "Atlas Honda";
  return raw || company || "Unknown";
}

// ── Model Extraction ─────────────────────────────────────────

export function extractModel(product: Record<string, unknown>): string {
  // Priority: explicit model → sku → handle → slug → name-derived
  if (product.model && typeof product.model === "string") return product.model.trim();
  if (product.sku && typeof product.sku === "string") {
    return (product.sku as string).replace(/-/g, " ").replace(/\s+/g, " ").trim().toUpperCase();
  }
  if (product.handle && typeof product.handle === "string") {
    return (product.handle as string).replace(/-/g, " ").trim();
  }
  if (product.slug && typeof product.slug === "string") {
    return (product.slug as string).replace(/-/g, " ").trim();
  }
  if (product.name && typeof product.name === "string") return (product.name as string).trim();
  return "";
}

// ── Search Helpers ───────────────────────────────────────────

export function searchProducts(products: Product[], query: string): Product[] {
  const q = query.toLowerCase().trim();
  if (!q) return products;

  return products.filter((p) => {
    return (
      p.name.toLowerCase().includes(q) ||
      p.model.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.subcategory.toLowerCase().includes(q) ||
      p.series.toLowerCase().includes(q)
    );
  });
}

// ── Filter Types ─────────────────────────────────────────────

export interface ProductFilters {
  category?: string;
  brand?: string;
  subcategory?: string;
  priceMin?: number;
  priceMax?: number;
  availability?: string;
  series?: string;
  search?: string;
}

export function filterProducts(
  products: Product[],
  filters: ProductFilters
): Product[] {
  let result = [...products];

  if (filters.search) {
    result = searchProducts(result, filters.search);
  }
  if (filters.category) {
    result = result.filter(
      (p) => p.category.toLowerCase() === filters.category!.toLowerCase()
    );
  }
  if (filters.brand) {
    result = result.filter(
      (p) => p.brand.toLowerCase() === filters.brand!.toLowerCase()
    );
  }
  if (filters.subcategory) {
    result = result.filter(
      (p) => p.subcategory.toLowerCase() === filters.subcategory!.toLowerCase()
    );
  }
  if (filters.priceMin !== undefined) {
    result = result.filter(
      (p) => p.price !== null && p.price >= filters.priceMin!
    );
  }
  if (filters.priceMax !== undefined) {
    result = result.filter(
      (p) => p.price !== null && p.price <= filters.priceMax!
    );
  }
  if (filters.availability) {
    result = result.filter(
      (p) =>
        p.availability.toLowerCase() === filters.availability!.toLowerCase()
    );
  }
  if (filters.series) {
    result = result.filter(
      (p) => p.series.toLowerCase() === filters.series!.toLowerCase()
    );
  }

  return result;
}

// ── Sort Types ───────────────────────────────────────────────

export type SortOption =
  | "recommended"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc";

export function sortProducts(
  products: Product[],
  sort: SortOption
): Product[] {
  const sorted = [...products];

  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => {
        if (a.price === null) return 1;
        if (b.price === null) return 1;
        return a.price - b.price;
      });
    case "price-desc":
      return sorted.sort((a, b) => {
        if (a.price === null) return 1;
        if (b.price === null) return 1;
        return b.price - a.price;
      });
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case "recommended":
    default:
      // Featured first, then with price, then by name
      return sorted.sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        if ((a.price !== null) !== (b.price !== null))
          return a.price !== null ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  }
}

// ── Category Slug Mapping ────────────────────────────────────

export function getCategorySlug(category: string): string {
  return generateSlug(category);
}

export function getBrandSlug(brand: string): string {
  return generateSlug(brand);
}

// ── Product Image Helpers ────────────────────────────────────

export const PLACEHOLDER_IMAGE = "/assets/system/product-image-placeholder.svg";

const PROXIED_MANUFACTURER_HOSTS = new Set([
  "image.haier.com",
  "www.haier.com",
  "www.dawlance.com.pk",
  "www.orient.com.pk",
  "cdn.shopify.com",
  "www.atlashonda.com.pk",
  "canonappliances.com.pk",
  "canonpk.com",
]);

/**
 * Third-party images should bypass the Next optimizer. A stale or protected
 * remote URL must be handled by the browser's image error fallback instead of
 * producing an optimizer 404 on the server.
 */
export function isDirectImage(src: string): boolean {
  return (
    src.endsWith(".svg") ||
    src.startsWith("/assets/products/ai/") ||
    /^https?:\/\//i.test(src) ||
    src.startsWith("/api/image")
  );
}

export function getDisplayImageUrl(src: string): string {
  if (!src) return PLACEHOLDER_IMAGE;
  if (!/^https?:\/\//i.test(src)) return src;
  try {
    const parsed = new URL(src);
    if (PROXIED_MANUFACTURER_HOSTS.has(parsed.hostname)) {
      return `/api/image?url=${encodeURIComponent(src)}`;
    }
  } catch {
    return PLACEHOLDER_IMAGE;
  }
  return src;
}

export function hasValidProductImage(input?: Product | string | null): boolean {
  if (!input) return false;
  if (typeof input === "object") {
    return (
      hasValidProductImage(input.mainImage) ||
      input.gallery.some((img) => hasValidProductImage(img))
    );
  }
  const clean = input.trim();
  if (!clean || clean.includes("product-image-placeholder")) return false;
  return clean.startsWith("http") || clean.startsWith("/");
}

export function getProductImage(product: Product): string {
  if (hasValidProductImage(product.mainImage)) {
    return product.mainImage;
  }
  const firstValidGallery = product.gallery.find((img) => hasValidProductImage(img));
  if (firstValidGallery) {
    return firstValidGallery;
  }
  return PLACEHOLDER_IMAGE;
}

// ── Unique filter values extraction ──────────────────────────

export function getUniqueValues(
  products: Product[],
  key: keyof Product
): string[] {
  const values = new Set<string>();
  products.forEach((p) => {
    const val = p[key];
    if (typeof val === "string" && val.trim()) {
      values.add(val.trim());
    }
  });
  return Array.from(values).sort();
}

export function getPriceRange(products: Product[]): { min: number; max: number } {
  const prices = products
    .map((p) => p.price)
    .filter((p): p is number => p !== null && p > 0);
  if (prices.length === 0) return { min: 0, max: 0 };
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export const PRICE_BANDS = [
  { id: "0-50000", label: "Under PKR 50,000", min: 0, max: 50000 },
  { id: "50000-100000", label: "PKR 50,000 – 99,999", min: 50000, max: 100000 },
  { id: "100000-200000", label: "PKR 100,000 – 199,999", min: 100000, max: 200000 },
  { id: "200000+", label: "PKR 200,000 and above", min: 200000, max: Number.POSITIVE_INFINITY },
] as const;

export type PriceBandId = (typeof PRICE_BANDS)[number]["id"];

export function availablePriceBands(products: Product[]) {
  return PRICE_BANDS.filter((band) =>
    products.some(
      (product) =>
        product.price !== null &&
        product.price > 0 &&
        product.price >= band.min &&
        product.price < band.max
    )
  );
}

export function productMatchesPriceBand(
  product: Product,
  bandId: string
): boolean {
  const band = PRICE_BANDS.find((item) => item.id === bandId);
  if (!band || product.price === null || product.price <= 0) return false;
  return product.price >= band.min && product.price < band.max;
}

export function priceBandLabel(bandId: string): string {
  return PRICE_BANDS.find((band) => band.id === bandId)?.label || bandId;
}

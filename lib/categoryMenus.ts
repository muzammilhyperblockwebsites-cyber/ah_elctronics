import { siteConfig } from "@/lib/siteConfig";
import type { Product } from "@/lib/products";
import type { DbCategory } from "@/lib/db";

export type MenuLink = { label: string; href: string };
export type MenuColumn = { title: string; links: MenuLink[] };

export type CategoryMenu = {
  name: string;
  slug: string;
  href: string;
  icon: string;
  columns: MenuColumn[];
  promoTitle: string;
  promoText: string;
  promoImage: string;
};

const PROMOS: Record<string, { title: string; text: string; image: string }> = {
  refrigerators: {
    title: "Refrigerators",
    text: "Single door, double door and no-frost models.",
    image: "/assets/banners/hero-refrigerator.jpg",
  },
  "air-conditioners": {
    title: "Air Conditioners",
    text: "Split and floor-standing units in the catalog.",
    image: "/assets/banners/promo-cooling.jpg",
  },
  "washing-machines": {
    title: "Washing Machines",
    text: "Top load, front load and twin tub.",
    image: "/assets/banners/hero-washer.jpg",
  },
  "led-tvs": {
    title: "LED TVs",
    text: "HD, Full HD and 4K models.",
    image: "/assets/banners/hero-led-tv.jpg",
  },
  "deep-freezers": {
    title: "Deep Freezers",
    text: "Chest and vertical freezers.",
    image: "/assets/banners/mega-freezer.jpg",
  },
  "water-dispensers": {
    title: "Water Dispensers",
    text: "Hot, cold and cooler models.",
    image: "/assets/banners/mega-water.jpg",
  },
  "microwave-ovens-air-fryers": {
    title: "Microwaves & Air Fryers",
    text: "Solo, grill and air-fryer ovens.",
    image: "/assets/banners/mega-microwave.jpg",
  },
  "kitchen-small-appliances": {
    title: "Kitchen Appliances",
    text: "Blenders, kettles, irons and more.",
    image: "/assets/banners/hero-kitchen.jpg",
  },
  motorcycles: {
    title: "Motorcycles",
    text: "Atlas Honda models in the catalog.",
    image: "/assets/banners/promo-motorcycle.jpg",
  },
  "spare-parts-accessories": {
    title: "Spare Parts",
    text: "Parts and accessories currently listed.",
    image: "/assets/banners/mega-parts.jpg",
  },
};

function categoryHref(slug: string, params: Record<string, string>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const text = query.toString();
  return text ? `/category/${slug}?${text}` : `/category/${slug}`;
}

function ranked(values: string[], limit: number) {
  const counts = new Map<string, number>();
  values.forEach((value) => {
    const key = value.trim();
    if (!key) return;
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([name]) => name);
}

function chunk<T>(items: T[], size: number) {
  const groups: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    groups.push(items.slice(index, index + size));
  }
  return groups;
}

export function buildCategoryMenus(
  products: Product[],
  dbCategories?: DbCategory[]
): CategoryMenu[] {
  const sourceCategories =
    dbCategories && dbCategories.length > 0
      ? dbCategories
      : siteConfig.categories.map((c) => ({
          name: c.name,
          slug: c.slug,
          icon: c.icon,
          image: c.image,
          description: "",
          subcategories: [] as string[],
        }));

  return sourceCategories.map((category) => {
    const items = products.filter(
      (product) => product.category.toLowerCase() === category.name.toLowerCase()
    );
    const productSubcategories = ranked(
      items.map((product) => product.subcategory),
      24
    );
    const subcategories: string[] =
      productSubcategories.length > 0
        ? productSubcategories
        : (category.subcategories || []).filter(Boolean);

    const brands = ranked(
      items.map((product) => product.brand),
      8
    );
    const series = ranked(
      items.map((product) => product.series),
      8
    );
    const columns: MenuColumn[] = [];

    if (subcategories.length > 0 && subcategories.length <= 3) {
      subcategories.forEach((subcategory) => {
        const subBrands = ranked(
          items
            .filter((product) => product.subcategory === subcategory)
            .map((product) => product.brand),
          6
        );
        const links = subBrands.map((brand) => ({
          label: brand,
          href: categoryHref(category.slug, { subcategory, brand }),
        }));
        links.push({
          label: `All ${subcategory}`,
          href: categoryHref(category.slug, { subcategory }),
        });
        columns.push({ title: subcategory, links });
      });
    } else if (subcategories.length > 3) {
      chunk(subcategories, 8)
        .slice(0, 2)
        .forEach((group, index) => {
          columns.push({
            title: index === 0 ? "Shop by type" : "More types",
            links: group.map((subcategory) => ({
              label: subcategory,
              href: categoryHref(category.slug, { subcategory }),
            })),
          });
        });
    }

    if (brands.length > 0) {
      columns.push({
        title: "Brands",
        links: brands.map((brand) => ({
          label: brand,
          href: categoryHref(category.slug, { brand }),
        })),
      });
    }

    if (series.length > 1 && columns.length < 4) {
      columns.push({
        title: "Ranges",
        links: series.map((item) => ({
          label: item,
          href: categoryHref(category.slug, { series: item }),
        })),
      });
    }

    if (columns.length === 0) {
      columns.push({
        title: category.name,
        links: [{ label: `View all ${category.name}`, href: `/category/${category.slug}` }],
      });
    }

    const fallbackPromo = PROMOS[category.slug] || {
      title: category.name,
      text: `Browse ${category.name}.`,
      image: "/assets/banners/hero-kitchen.jpg",
    };

    return {
      name: category.name,
      slug: category.slug,
      href: `/category/${category.slug}`,
      icon: category.icon || "Package",
      columns: columns.slice(0, 4),
      promoTitle: fallbackPromo.title || category.name,
      promoText: category.description || fallbackPromo.text,
      promoImage: fallbackPromo.image || category.image || "/assets/banners/hero-kitchen.jpg",
    };
  });
}

export function brandsForCategory(products: Product[], categoryName: string) {
  return ranked(
    products
      .filter((product) => product.category.toLowerCase() === categoryName.toLowerCase())
      .map((product) => product.brand),
    8
  );
}

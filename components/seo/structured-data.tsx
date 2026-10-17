import { Product } from "@/lib/products";
import { siteConfig } from "@/lib/siteConfig";

export function ProductStructuredData({ product }: { product: Product }) {
  const imageList =
    product.gallery && product.gallery.length > 0
      ? product.gallery
      : [product.mainImage || `${siteConfig.seo.siteUrl}${siteConfig.seo.ogImage}`];

  const structuredData: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: imageList,
    description: product.shortDescription || `${product.name} from ${product.brand} available at ${siteConfig.name}.`,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    ...(product.model && {
      model: product.model,
      sku: product.model,
    }),
  };

  // Only include offer price if a verified numeric price exists
  if (product.price && product.price > 0 && isFinite(product.price)) {
    structuredData.offers = {
      "@type": "Offer",
      url: `${siteConfig.seo.siteUrl}/products/${product.slug}`,
      priceCurrency: "PKR",
      price: product.price,
      itemCondition: "https://schema.org/NewCondition",
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function BreadcrumbStructuredData({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

import { Metadata } from "next";
import { getSpecialOffers, getSiteSettings } from "@/lib/db";
import { ProductCard } from "@/components/site/ProductCard";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { Tag, MessageCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `Special Offers | ${settings.name}`,
    description: `Explore our latest special offers, discounts, and promotions on home appliances and electronics at ${settings.name}.`,
  };
}

export default async function OffersPage() {
  const [offerProducts, settings] = await Promise.all([
    getSpecialOffers(),
    getSiteSettings(),
  ]);

  return (
    <div className="bg-bg min-h-screen py-8 sm:py-12">
      <div className="section-container">
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-red-100 text-red-600 rounded-full mb-5">
            <Tag className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-display text-navy mb-3">Special Offers</h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Products currently marked as special offers in the {settings.name} catalog. Prices shown are the catalog prices.
          </p>
        </div>

        {offerProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6">
            {offerProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-border p-6 sm:p-12 text-center max-w-2xl mx-auto shadow-sm">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
              <Tag className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-navy mb-3">No Special Offers Right Now</h2>
            <p className="text-muted-foreground mb-8 text-sm sm:text-lg">
              There are no products marked as special offers right now. Please check back later, or message us on WhatsApp about a product you are considering.
            </p>
            <a
              href={getWhatsAppUrl("Hello, do you have any special offers or discounts available right now?", settings.contact.whatsappClean)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-whatsapp hover:bg-green-600 text-white px-5 py-3.5 sm:px-8 sm:py-4 rounded-xl font-bold text-sm sm:text-lg transition-all"
            >
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
              <span>Ask About Offers on WhatsApp</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

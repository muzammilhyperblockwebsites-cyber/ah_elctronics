import { Metadata } from "next";
import { siteConfig } from "@/lib/siteConfig";
import { getSiteSettings } from "@/lib/db";
import { getWhatsAppUrl, buildContactMessage } from "@/lib/whatsapp";
import { ShieldCheck, MessageCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `Warranty & Services | ${settings.name}`,
    description: `Learn about product warranties, installation, and after-sales support at ${settings.name}.`,
  };
}

export default async function WarrantyPage() {
  const settings = await getSiteSettings();
  const contactMessage = buildContactMessage({
    message: "I have a question about warranty and services.",
    businessName: settings.name,
  });

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
      <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 shrink-0" />
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold text-navy text-center">
          {siteConfig.warranty.heading}
        </h1>
      </div>
      
      <div className="space-y-6 sm:space-y-8 mb-10 sm:mb-12">
        {siteConfig.warranty.sections.map((section, idx) => (
          <section key={idx} className="bg-white rounded-2xl p-5 sm:p-6 md:p-8 border border-border shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold text-navy mb-3 sm:mb-4">{section.title}</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {section.content}
            </p>
          </section>
        ))}
      </div>

      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 sm:p-8 text-center flex flex-col items-center">
        <h2 className="text-xl sm:text-2xl font-bold text-navy mb-3">Need Warranty Support?</h2>
        <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-lg">
          For any questions about your product after purchase, including warranty claims or service needs, please contact us.
        </p>
        <a
          href={getWhatsAppUrl(contactMessage, settings.contact.whatsappClean)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white py-3 px-6 sm:px-8 rounded-xl font-bold text-sm sm:text-base transition-all hover:shadow-lg shadow-md"
        >
          <MessageCircle className="w-5 h-5 shrink-0" />
          <span>Contact Support on WhatsApp</span>
        </a>
      </div>
    </div>
  );
}

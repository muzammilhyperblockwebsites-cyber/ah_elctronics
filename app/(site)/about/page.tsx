import Image from "next/image";
import { Metadata } from "next";
import { siteConfig } from "@/lib/siteConfig";
import { getSiteSettings } from "@/lib/db";
import { getWhatsAppUrl, buildContactMessage } from "@/lib/whatsapp";
import { MessageCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `About Us | ${settings.name}`,
    description: `Learn more about ${settings.name}, your trusted electronics retailer in Lahore, Pakistan.`,
  };
}

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const contactMessage = buildContactMessage({
    message: "I have an enquiry after reading the About Us page.",
    businessName: settings.name,
  });

  const paragraphs = siteConfig.about.paragraphs.map((p, idx) =>
    idx === 0 && settings.description ? settings.description : p
  );

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
      <h1 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold text-navy mb-6 sm:mb-8 text-center">
        About {settings.name}
      </h1>
      
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-8 sm:mb-12 shadow-lg">
        <Image 
          src={siteConfig.about.image} 
          alt={`${settings.name} Showroom`} 
          fill 
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 1024px"
          priority
        />
      </div>

      <div className="prose prose-lg max-w-none text-muted-foreground space-y-6 mb-10 sm:mb-12">
        {paragraphs.map((paragraph, idx) => (
          <p key={idx} className="leading-relaxed text-sm sm:text-base">{paragraph}</p>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 sm:p-8 text-center flex flex-col items-center">
        <h2 className="text-xl sm:text-2xl font-bold text-navy mb-3">Have questions?</h2>
        <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-lg">
          Our team is ready to assist you with product selection, pricing confirmation, and delivery arrangements.
        </p>
        <a
          href={getWhatsAppUrl(contactMessage, settings.contact.whatsappClean)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white py-3 px-6 sm:px-8 rounded-xl font-bold text-sm sm:text-base transition-all hover:shadow-lg shadow-md"
        >
          <MessageCircle className="w-5 h-5 shrink-0" />
          <span>Chat with us on WhatsApp</span>
        </a>
      </div>
    </div>
  );
}

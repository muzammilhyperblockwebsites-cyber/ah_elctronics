import Link from "next/link";
import { getSiteSettings } from "@/lib/db";
import { getWhatsAppUrl, buildContactMessage } from "@/lib/whatsapp";
import { MessageCircle, Home, Search } from "lucide-react";

export default async function NotFound() {
  const settings = await getSiteSettings();
  const contactMessage = buildContactMessage({
    message: "I couldn't find a page I was looking for.",
    businessName: settings.name,
  });

  return (
    <div className="container mx-auto px-4 py-16 sm:py-20 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-6xl sm:text-8xl font-display font-black text-navy mb-4">404</h1>
      <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 sm:mb-6">Page Not Found</h2>
      
      <p className="text-base sm:text-lg text-muted-foreground max-w-lg mb-8 sm:mb-10">
        Sorry, the page you are looking for doesn&apos;t exist or has been moved. 
        Let&apos;s get you back on track.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-10 sm:mb-12 w-full max-w-md">
        <Link 
          href="/" 
          className="flex-1 flex items-center justify-center gap-2 bg-navy hover:bg-navy/90 text-white py-3 px-6 rounded-xl font-medium transition-all"
        >
          <Home className="w-5 h-5" />
          Back to Home
        </Link>
        <Link 
          href="/products" 
          className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-foreground py-3 px-6 rounded-xl font-medium transition-all"
        >
          <Search className="w-5 h-5" />
          Browse Products
        </Link>
      </div>

      <div className="bg-blue-50 rounded-2xl p-6 w-full max-w-2xl border border-blue-100">
        <h3 className="text-lg font-semibold text-navy mb-2">Can&apos;t find what you&apos;re looking for?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Our team is here to help. Send us a message and we&apos;ll assist you right away.
        </p>
        <a
          href={getWhatsAppUrl(contactMessage, settings.contact.whatsappClean)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white py-2.5 px-6 rounded-lg font-medium transition-all"
        >
          <MessageCircle className="w-4 h-4 shrink-0" />
          Chat on WhatsApp
        </a>
      </div>
    </div>
  );
}

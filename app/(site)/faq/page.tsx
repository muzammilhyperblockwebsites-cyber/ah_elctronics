import { Metadata } from "next";
import { siteConfig } from "@/lib/siteConfig";
import { getSiteSettings } from "@/lib/db";
import { getWhatsAppUrl, buildContactMessage } from "@/lib/whatsapp";
import { MessageCircle, HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `FAQ | ${settings.name}`,
    description: `Frequently Asked Questions about ${settings.name} products, ordering, and warranties.`,
  };
}

export default async function FAQPage() {
  const settings = await getSiteSettings();
  const contactMessage = buildContactMessage({
    message: "I have a question that was not answered in the FAQ.",
    businessName: settings.name,
  });

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
      <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <HelpCircle className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 shrink-0" />
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold text-navy text-center">
          Frequently Asked Questions
        </h1>
      </div>

      <div className="bg-white rounded-2xl p-5 sm:p-6 md:p-8 border border-border shadow-sm mb-10 sm:mb-12">
        <Accordion type="single" collapsible className="w-full">
          {siteConfig.faq.map((item, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`}>
              <AccordionTrigger className="text-left text-navy font-semibold text-base sm:text-lg py-4">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm sm:text-base leading-relaxed pb-4">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="bg-sky-50 border border-sky-100 rounded-2xl p-6 sm:p-8 text-center flex flex-col items-center">
        <h2 className="text-xl sm:text-2xl font-bold text-navy mb-3">Still have questions?</h2>
        <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-lg">
          If you couldn&apos;t find the answer you were looking for, please don&apos;t hesitate to contact us. Our team is always ready to help.
        </p>
        <a
          href={getWhatsAppUrl(contactMessage, settings.contact.whatsappClean)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white py-3 px-6 sm:px-8 rounded-xl font-bold text-sm sm:text-base transition-all hover:shadow-lg shadow-md"
        >
          <MessageCircle className="w-5 h-5 shrink-0" />
          <span>Ask on WhatsApp</span>
        </a>
      </div>
    </div>
  );
}

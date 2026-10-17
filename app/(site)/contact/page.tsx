import { Metadata } from "next";
import { getSiteSettings } from "@/lib/db";
import { ContactForm } from "@/components/site/ContactForm";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { getWhatsAppUrl, buildContactMessage } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `Contact Us | ${settings.name}`,
    description: `Get in touch with ${settings.name} for inquiries, orders, and support.`,
  };
}

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const generalContactMessage = buildContactMessage({
    message: "Hello, I would like to get in touch.",
    businessName: settings.name,
  });

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-5xl">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold text-navy mb-3 sm:mb-4">
          Contact Us
        </h1>
        <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          Have a question or need assistance? We&apos;re here to help. Reach out to us through any of the channels below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Contact Info */}
        <div className="flex flex-col gap-8">
          <div className="bg-white rounded-2xl p-5 sm:p-8 border border-border shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-navy mb-6">Get In Touch</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-[#F3EEEE] p-3 rounded-full text-[#AE6965] shrink-0">
                  <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-navy">Phone, mobile and WhatsApp</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-1">Phone {settings.contact.phone}</p>
                  {settings.contact.mobile && (
                    <p className="text-sm sm:text-base text-muted-foreground mb-1">Mobile {settings.contact.mobile}</p>
                  )}
                  <p className="text-sm sm:text-base text-muted-foreground mb-1">WhatsApp {settings.contact.whatsapp}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <a
                      href={`tel:${settings.contact.phoneCall}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-[#62648D] hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Call {settings.contact.phone}
                    </a>
                    {settings.contact.mobile && (
                      <a
                        href={`tel:${settings.contact.mobileCall}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-[#62648D] hover:underline"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Call {settings.contact.mobile}
                      </a>
                    )}
                    <span className="text-[#667085] hidden sm:inline">•</span>
                    <a
                      href={getWhatsAppUrl(generalContactMessage, settings.contact.whatsappClean)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-[#25D366] hover:underline"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Chat on WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-[#F3EEEE] p-3 rounded-full text-[#AE6965] shrink-0">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-navy">Email</h3>
                  <a href={`mailto:${settings.contact.email}`} className="text-sm sm:text-base text-muted-foreground hover:text-blue-600 transition-colors break-all">
                    {settings.contact.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-[#F3EEEE] p-3 rounded-full text-[#AE6965] shrink-0">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-navy">Address</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {settings.contact.address}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-[#F3EEEE] p-3 rounded-full text-[#AE6965] shrink-0">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-navy">Business Hours</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {settings.businessHours.weekdays}
                  </p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    {settings.businessHours.weekends}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-2xl p-5 sm:p-8 border border-border shadow-sm">
          <h2 className="text-xl sm:text-2xl font-bold text-navy mb-2">Send us a Message</h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6">
            Fill out the form below and we&apos;ll reply to you on WhatsApp.
          </p>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}

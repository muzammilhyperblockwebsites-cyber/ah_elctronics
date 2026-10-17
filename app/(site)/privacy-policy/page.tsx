import { Metadata } from "next";
import { siteConfig } from "@/lib/siteConfig";
import { getSiteSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `Privacy Policy | ${settings.name}`,
    description: `Privacy Policy and data handling practices at ${settings.name}.`,
  };
}

export default async function PrivacyPolicyPage() {
  const settings = await getSiteSettings();

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
      <h1 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold text-navy mb-4 text-center">
        {siteConfig.privacyPolicy.heading}
      </h1>
      
      <p className="text-center text-sm text-muted-foreground mb-8 sm:mb-12">
        Last Updated: {siteConfig.privacyPolicy.lastUpdated}
      </p>
      
      <div className="space-y-6 sm:space-y-8 bg-white p-5 sm:p-6 md:p-10 rounded-2xl border border-border shadow-sm">
        {siteConfig.privacyPolicy.sections.map((section, idx) => (
          <section key={idx}>
            <h2 className="text-lg sm:text-xl font-bold text-navy mb-2 sm:mb-3">{section.title}</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {section.content.replace(/A H Electronics/g, settings.name)}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}

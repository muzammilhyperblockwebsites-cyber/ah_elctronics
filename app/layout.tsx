import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/siteConfig";
import { getSiteSettings } from "@/lib/db";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const defaultTitle = `${settings.name} — ${settings.tagline || "Quality Home Appliances & Electronics"}`;
  const defaultDescription = settings.description || siteConfig.seo.defaultDescription;

  return {
    title: {
      default: defaultTitle,
      template: `%s | ${settings.name}`,
    },
    description: defaultDescription,
    metadataBase: new URL(siteConfig.seo.siteUrl),
    openGraph: {
      type: "website",
      locale: siteConfig.seo.locale,
      siteName: settings.name,
      title: defaultTitle,
      description: defaultDescription,
      images: [{ url: siteConfig.seo.ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description: defaultDescription,
      images: [siteConfig.seo.ogImage],
    },
    robots: { index: true, follow: true },
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon.ico", sizes: "32x32" },
      ],
      apple: "/apple-touch-icon.png",
      shortcut: "/favicon.ico",
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: settings.name,
              description: settings.description,
              url: siteConfig.seo.siteUrl,
              telephone: settings.contact.phone,
              email: settings.contact.email,
              address: {
                "@type": "PostalAddress",
                streetAddress: settings.contact.address,
                addressCountry: "PK",
              },
              image: `${siteConfig.seo.siteUrl}${siteConfig.seo.ogImage}`,
            }),
          }}
        />
      </head>
      <body className="font-sans">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}

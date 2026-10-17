import Link from 'next/link';
import { MessageCircle, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { siteConfig } from '@/lib/siteConfig';
import type { DbCategory, DynamicSiteSettings } from '@/lib/db';
import { BrandLogo } from './BrandLogo';

export function Footer({
  categories = [],
  settings = siteConfig as unknown as DynamicSiteSettings,
}: {
  categories?: DbCategory[];
  settings?: DynamicSiteSettings;
}) {
  const currentYear = new Date().getFullYear();
  const activeCategories =
    categories && categories.length > 0 ? categories : siteConfig.categories;

  const socialLinks = [
    { label: 'Facebook', href: settings.social?.facebook },
    { label: 'Instagram', href: settings.social?.instagram },
    { label: 'YouTube', href: settings.social?.youtube },
    { label: 'TikTok', href: settings.social?.tiktok },
  ].filter((item) => Boolean(item.href && item.href.trim()));

  return (
    <footer className="mt-auto border-t border-[#E6E8ED] bg-white text-[#17212B]">
      <div className="section-container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Link href="/" className="inline-flex" aria-label={settings.name}>
            <BrandLogo variant="footer" />
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-[#5E6976]">
            {settings.tagline || settings.shortDescription || siteConfig.shortDescription}
          </p>
          {socialLinks.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-[#E6E8ED] bg-[#F7F8FA] px-3 py-1 text-xs font-semibold text-[#2B2B66] hover:border-[#AE6965] hover:text-[#62648D]"
                >
                  {social.label}
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#2B2B66]">Shop</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/products" className="text-[#5E6976] hover:text-[#2B2B66]">All Products</Link></li>
            <li><Link href="/categories" className="text-[#5E6976] hover:text-[#2B2B66]">Categories</Link></li>
            <li><Link href="/offers" className="text-[#AE6965] hover:underline">Offers</Link></li>
            {activeCategories.slice(0, 5).map((category) => (
              <li key={category.slug}>
                <Link href={`/category/${category.slug}`} className="text-[#5E6976] hover:text-[#2B2B66]">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#2B2B66]">Information</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[...siteConfig.quickLinks, ...siteConfig.supportLinks].filter(
              (link, index, list) => list.findIndex((item) => item.href === link.href) === index
            ).map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-[#5E6976] hover:text-[#2B2B66]">{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#2B2B66]">Contact</h2>
          <ul className="mt-4 space-y-3 text-sm text-[#5E6976]">
            <li>
              <a href={`https://wa.me/${settings.contact.whatsappClean}`} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 hover:text-[#2B2B66]">
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#25D366]" />
                <span>WhatsApp {settings.contact.whatsapp}</span>
              </a>
            </li>
            <li>
              <a href={`tel:${settings.contact.phoneCall}`} className="flex items-start gap-2 hover:text-[#2B2B66]">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#2B2B66]" />
                <span>Phone {settings.contact.phone}</span>
              </a>
            </li>
            <li>
              <a href={`tel:${settings.contact.mobileCall}`} className="flex items-start gap-2 hover:text-[#2B2B66]">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#AE6965]" />
                <span>Mobile {settings.contact.mobile}</span>
              </a>
            </li>
            <li>
              <a href={`mailto:${settings.contact.email}`} className="flex items-start gap-2 hover:text-[#2B2B66]">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#2B2B66]" />
                <span className="break-all sm:break-normal">{settings.contact.email}</span>
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#2B2B66]" />
              <span>{settings.contact.address}</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#2B2B66]" />
              <span>
                {settings.businessHours.weekdays}
                <span className="mt-1 block">{settings.businessHours.weekends}</span>
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-[#2B2B66] text-white">
        <div className="section-container flex flex-col items-center justify-between gap-2 py-4 text-center text-xs text-white/75 sm:flex-row sm:text-left">
          <p>© {currentYear} {settings.name}. Prices and availability are confirmed on WhatsApp.</p>
          <p>{settings.businessHours.note}</p>
        </div>
      </div>
    </footer>
  );
}

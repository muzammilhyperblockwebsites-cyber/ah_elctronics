import Image from "next/image";
import Link from "next/link";
import type { DbHeroSlide } from "@/lib/db";
import { getDisplayImageUrl, isDirectImage } from "@/lib/products";

type Banner = {
  id?: string;
  href: string;
  image: string;
  mobileImage?: string;
  kicker: string;
  title: string;
  text: string;
  cta: string;
  className?: string;
};

const defaultBanners: Banner[] = [
  {
    href: "/category/led-tvs",
    image: "/assets/banners/hero-led-tv.jpg",
    kicker: "LED TVs",
    title: "A clearer way to watch",
    text: "Browse the LED TVs listed at A H Electronics.",
    cta: "Shop LED TVs",
  },
  {
    href: "/category/refrigerators",
    image: "/assets/banners/hero-refrigerator.jpg",
    kicker: "Refrigerators",
    title: "Fresh storage for the home",
    text: "Single door, double door and no-frost models.",
    cta: "Shop refrigerators",
  },
  {
    href: "/category/washing-machines",
    image: "/assets/banners/hero-washer.jpg",
    kicker: "Washing Machines",
    title: "Everyday laundry",
    text: "Top load, front load and twin tub.",
    cta: "Shop now",
  },
  {
    href: "/category/kitchen-small-appliances",
    image: "/assets/banners/hero-kitchen.jpg",
    kicker: "Kitchen",
    title: "Small appliances",
    text: "Blenders, kettles, air fryers and more.",
    cta: "Shop now",
  },
];

function Panel({
  banner,
  priority = false,
  className,
  sizes,
}: {
  banner: Banner;
  priority?: boolean;
  className?: string;
  sizes: string;
}) {
  const imgSrc = getDisplayImageUrl(banner.image || "/assets/banners/hero-led-tv.jpg");
  return (
    <Link
      href={banner.href || "/products"}
      className={`group relative block min-h-[180px] overflow-hidden rounded-2xl bg-[#2B2B66] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2B2B66] ${className || ""}`}
    >
      <Image
        src={imgSrc}
        alt={banner.title}
        fill
        priority={priority}
        unoptimized={isDirectImage(imgSrc)}
        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        sizes={sizes}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#2B2B66]/90 via-[#2B2B66]/35 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        {banner.kicker && (
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/80">
            {banner.kicker}
          </p>
        )}
        <h2 className="mt-1 font-display text-lg font-bold leading-tight text-white sm:text-2xl">
          {banner.title}
        </h2>
        {banner.text && (
          <p className="mt-1 line-clamp-2 hidden text-sm text-white/85 sm:block">
            {banner.text}
          </p>
        )}
        <span className="mt-3 inline-flex h-9 items-center rounded-full bg-white px-4 text-xs sm:text-sm font-bold text-[#2B2B66]">
          {banner.cta || "Shop now"}
        </span>
      </div>
    </Link>
  );
}

export function HomeHero({ slides = [] }: { slides?: DbHeroSlide[] }) {
  const banners: Banner[] =
    slides && slides.length > 0
      ? slides.map((s) => ({
          id: s.id,
          href: s.ctaLink || "/products",
          image: s.desktopImage || "/assets/banners/hero-led-tv.jpg",
          mobileImage: s.mobileImage || s.desktopImage,
          kicker: s.badge || s.subheading || "Featured",
          title: s.heading,
          text: s.text || s.subheading || "",
          cta: s.ctaText || "Shop now",
        }))
      : defaultBanners;

  if (banners.length === 1) {
    return (
      <section className="bg-[#F7F8FA] pb-2 pt-4" aria-label="Featured promotions">
        <div className="section-container">
          <Panel
            banner={banners[0]}
            priority
            className="min-h-[260px] sm:min-h-[360px] lg:min-h-[440px]"
            sizes="100vw"
          />
        </div>
      </section>
    );
  }

  if (banners.length === 2) {
    return (
      <section className="bg-[#F7F8FA] pb-2 pt-4" aria-label="Featured promotions">
        <div className="section-container grid gap-3 sm:grid-cols-2">
          <Panel
            banner={banners[0]}
            priority
            className="min-h-[240px] sm:min-h-[320px] lg:min-h-[420px]"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
          <Panel
            banner={banners[1]}
            className="min-h-[240px] sm:min-h-[320px] lg:min-h-[420px]"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        </div>
      </section>
    );
  }

  if (banners.length === 3) {
    return (
      <section className="bg-[#F7F8FA] pb-2 pt-4" aria-label="Featured promotions">
        <div className="section-container grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.25fr_0.9fr] lg:grid-rows-[1fr_1fr]">
          <Panel
            banner={banners[0]}
            priority
            className="min-h-[240px] sm:col-span-2 lg:col-span-1 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:min-h-[440px]"
            sizes="(max-width: 1024px) 100vw, 58vw"
          />
          <Panel
            banner={banners[1]}
            className="min-h-[200px] lg:col-start-2 lg:row-start-1"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 42vw"
          />
          <Panel
            banner={banners[2]}
            className="min-h-[200px] lg:col-start-2 lg:row-start-2"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 42vw"
          />
        </div>
      </section>
    );
  }

  const extraBanners = banners.slice(4);

  return (
    <section className="bg-[#F7F8FA] pb-2 pt-4 space-y-3" aria-label="Featured categories">
      <div className="section-container grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.15fr_0.78fr_0.78fr] lg:grid-rows-[1fr_1fr]">
        <Panel
          banner={banners[0]}
          priority
          className="min-h-[240px] sm:min-h-[260px] lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:min-h-[460px]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 46vw"
        />
        <Panel
          banner={banners[1]}
          className="min-h-[240px] sm:min-h-[260px] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:min-h-[460px]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 28vw"
        />
        <Panel
          banner={banners[2]}
          className="min-h-[180px] sm:min-h-[200px] lg:col-start-3 lg:row-start-1"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 28vw"
        />
        <Panel
          banner={banners[3]}
          className="min-h-[180px] sm:min-h-[200px] lg:col-start-3 lg:row-start-2"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 28vw"
        />
      </div>
      {extraBanners.length > 0 && (
        <div className="section-container grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {extraBanners.map((b, idx) => (
            <Panel
              key={b.id || idx}
              banner={b}
              className="min-h-[180px]"
              sizes="(max-width: 640px) 100vw, 33vw"
            />
          ))}
        </div>
      )}
    </section>
  );
}

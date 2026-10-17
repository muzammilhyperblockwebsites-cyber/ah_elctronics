'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { siteConfig } from '@/lib/siteConfig';
import { cn } from '@/lib/utils';

export function HeroSlider({ slides }: { slides?: readonly any[] | any[] }) {
  const items = slides && slides.length > 0 ? slides : siteConfig.heroSlides;
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 6000, stopOnInteraction: true }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  if (!items || items.length === 0) return null;

  return (
    <div className="relative group w-full bg-[#2B2B66] overflow-hidden">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {items.map((slide: any, index: number) => (
            <div
              key={slide.id || index}
              className="relative flex-[0_0_100%] min-w-0 h-[380px] sm:h-[440px] md:h-[520px] lg:h-[600px] w-full"
            >
              {/* Responsive Background Picture */}
              <picture>
                <source media="(min-width: 768px)" srcSet={slide.desktopImage} />
                <img
                  src={slide.mobileImage}
                  alt={slide.heading}
                  className="w-full h-full object-cover object-center"
                />
              </picture>

              {/* Gradient Overlay & HTML Content */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#2B2B66]/90 via-[#2B2B66]/60 to-transparent flex items-center">
                <div className="section-container w-full">
                  <div className="max-w-xl text-white">
                    <span className="inline-block px-3 py-1 rounded-full bg-[#62648D]/80 text-xs sm:text-sm font-semibold mb-3 tracking-wide backdrop-blur-sm">
                      {slide.badge || siteConfig.name}
                    </span>
                    <h1 className="font-display text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold mb-3 sm:mb-4 leading-tight">
                      {slide.heading}
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg text-slate-200 mb-6 sm:mb-8 max-w-lg leading-relaxed">
                      {slide.text}
                    </p>
                    <Link
                      href={slide.ctaLink || '/products'}
                      className="inline-flex items-center gap-2 bg-[#62648D] hover:bg-[#0f57be] text-white px-6 py-3 sm:px-8 sm:py-3.5 rounded-lg font-bold text-sm sm:text-base transition-all duration-200 shadow-lg hover:shadow-[#62648D]/30 hover:scale-[1.02]"
                    >
                      <span>{slide.ctaText || slide.cta || 'Shop Now'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="hidden sm:flex absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={scrollNext}
        className="hidden sm:flex absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
        {items.map((_: any, index: number) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={cn(
              "h-2 sm:h-2.5 rounded-full transition-all duration-300",
              selectedIndex === index ? "w-8 bg-[#62648D]" : "w-2.5 bg-white/50 hover:bg-white/80"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

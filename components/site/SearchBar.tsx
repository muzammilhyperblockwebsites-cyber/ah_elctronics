'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Product, formatPrice, getDisplayImageUrl, isDirectImage } from '@/lib/products';

export function SearchBar({
  onCloseMobile,
  variant = "default",
}: {
  onCloseMobile?: () => void;
  variant?: "default" | "header";
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search logic querying live search API
  useEffect(() => {
    const timer = setTimeout(async () => {
      const q = query.trim().toLowerCase();
      if (q.length > 1) {
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
          if (res.ok) {
            const data = await res.json();
            setResults(data.results || []);
            setIsOpen(true);
            return;
          }
        } catch (error) {
          console.error("Search request failed:", error);
        }

        setResults([]);
        setIsOpen(false);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (slug: string) => {
    setIsOpen(false);
    setQuery('');
    if (onCloseMobile) onCloseMobile();
    router.push(`/products/${slug}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      if (onCloseMobile) onCloseMobile();
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="flex w-full items-stretch">
        <div className="relative min-w-0 flex-1">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            placeholder="Search Products"
            aria-label="Search products"
            className={
              variant === "header"
                ? "h-11 w-full rounded-full border-0 bg-white pl-11 pr-10 text-sm text-[#17212B] focus:outline-none focus:ring-2 focus:ring-white/70"
                : "h-11 w-full rounded-l-md border border-r-0 border-[#E6E8ED] bg-[#F7F8FA] pl-10 pr-9 text-sm text-[#17212B] focus:border-[#2B2B66] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2B2B66]/15"
            }
          />
          <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[#5E6976]" />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults([]);
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-2.5 p-1 text-[#5E6976] hover:text-[#17212B]"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {variant !== "header" && (
          <button
            type="submit"
            className="h-11 shrink-0 rounded-r-md bg-[#2B2B66] px-4 text-sm font-semibold text-white hover:bg-[#2B2B66] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2B2B66]"
          >
            Search
          </button>
        )}
      </form>

      {/* Dropdown Suggestions */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-[#E3E8EF] overflow-hidden z-50">
          <div className="px-4 py-2 border-b border-[#E3E8EF] bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-semibold text-[#667085] uppercase tracking-wider">
              Suggestions ({results.length})
            </span>
            <button
              onClick={handleSubmit}
              className="text-xs font-medium text-[#2B2B66] hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <ul className="max-h-80 overflow-y-auto py-1 divide-y divide-[#E3E8EF]/50">
            {results.map((product) => (
              <li key={product.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(product.slug)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#F6F8FB] transition-colors text-left group"
                >
                  <div className="relative w-12 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-[#E3E8EF] p-1">
                    <Image
                      src={getDisplayImageUrl(product.mainImage || '/assets/system/product-image-placeholder.svg')}
                      unoptimized={isDirectImage(product.mainImage || '')}
                      alt={product.name}
                      fill
                      className="object-contain"
                      sizes="48px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#5E6976] uppercase tracking-wide">
                      {product.brand}
                    </p>
                    <p className="text-sm font-medium text-[#17212B] truncate group-hover:text-[#2B2B66] transition-colors">
                      {product.name}
                    </p>
                    <p className="text-xs text-[#667085] truncate font-mono">
                      Model: {product.model || 'N/A'}
                    </p>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-[#2B2B66] whitespace-nowrap pl-2 text-right">
                    {formatPrice(product.price)}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

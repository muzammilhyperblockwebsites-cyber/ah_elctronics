"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Product,
  sortProducts,
  SortOption,
  getUniqueValues,
  availablePriceBands,
  productMatchesPriceBand,
  priceBandLabel,
} from "@/lib/products";
import { ProductCard } from "@/components/site/ProductCard";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandClientProps {
  initialProducts: Product[];
  brandName: string;
}

const PRODUCTS_PER_PAGE = 12;
const SORTS: SortOption[] = ["recommended", "price-asc", "price-desc", "name-asc", "name-desc"];

export default function BrandClient({ initialProducts, brandName }: BrandClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialSort = SORTS.includes(searchParams.get("sort") as SortOption)
    ? (searchParams.get("sort") as SortOption)
    : "recommended";

  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [priceBand, setPriceBand] = useState(searchParams.get("price") || "");
  const [sort, setSort] = useState<SortOption>(initialSort);
  const [page, setPage] = useState(Math.max(1, Number(searchParams.get("page")) || 1));
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const mounted = useRef(false);

  const categories = useMemo(() => getUniqueValues(initialProducts, "category"), [initialProducts]);
  const priceBands = useMemo(() => availablePriceBands(initialProducts), [initialProducts]);
  const hasSidebarFilters = categories.length > 1 || priceBands.length > 0;

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    setPage(1);
  }, [selectedCategory, priceBand, sort]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (priceBand) params.set("price", priceBand);
    if (sort !== "recommended") params.set("sort", sort);
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [selectedCategory, priceBand, sort, page, pathname, router]);

  const filteredProducts = useMemo(() => {
    let result = initialProducts;
    if (selectedCategory) {
      result = result.filter((product) => product.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (priceBand) {
      result = result.filter((product) => productMatchesPriceBand(product, priceBand));
    }
    return sortProducts(result, sort);
  }, [initialProducts, selectedCategory, priceBand, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (safePage - 1) * PRODUCTS_PER_PAGE,
    safePage * PRODUCTS_PER_PAGE
  );
  const hasActiveFilters = Boolean(selectedCategory || priceBand);

  const clearAllFilters = () => {
    setSelectedCategory("");
    setPriceBand("");
    setSort("recommended");
    setPage(1);
  };

  const filters = (
    <div className="space-y-6">
      {categories.length > 1 && (
        <fieldset>
          <legend className="mb-2 text-xs font-bold uppercase tracking-wide text-[#5E6976]">Category</legend>
          <div className="space-y-1">
            <label className="flex items-center gap-2 py-1 text-sm">
              <input type="radio" name="brand-category" checked={selectedCategory === ""} onChange={() => setSelectedCategory("")} />
              All
            </label>
            {categories.map((category) => (
              <label key={category} className="flex items-center gap-2 py-1 text-sm">
                <input type="radio" name="brand-category" checked={selectedCategory === category} onChange={() => setSelectedCategory(category)} />
                {category}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {priceBands.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-xs font-bold uppercase tracking-wide text-[#5E6976]">Price</legend>
          <div className="space-y-1">
            <label className="flex items-center gap-2 py-1 text-sm">
              <input type="radio" name="brand-price" checked={priceBand === ""} onChange={() => setPriceBand("")} />
              All prices
            </label>
            {priceBands.map((band) => (
              <label key={band.id} className="flex items-center gap-2 py-1 text-sm">
                <input type="radio" name="brand-price" checked={priceBand === band.id} onChange={() => setPriceBand(band.id)} />
                {band.label}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {hasActiveFilters && (
        <button type="button" onClick={clearAllFilters} className="text-sm font-semibold text-[#AE6965] hover:underline">
          Clear filters
        </button>
      )}
    </div>
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[#2B2B66]">
          {filteredProducts.length} {brandName} {filteredProducts.length === 1 ? "product" : "products"}
        </p>
        <div className="flex items-center gap-2">
          {hasSidebarFilters && (
            <button
              type="button"
              onClick={() => setIsMobileFiltersOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-[#E6E8ED] bg-white px-3 text-sm font-semibold lg:hidden"
            >
              <Filter size={15} />
              Filters
            </button>
          )}
          <label htmlFor="brand-sort" className="text-xs font-semibold text-[#5E6976]">Sort</label>
          <select
            id="brand-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOption)}
            className="h-10 rounded-md border border-[#E6E8ED] bg-white px-3 text-sm font-semibold"
          >
            <option value="recommended">Recommended</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mb-4 flex flex-wrap gap-2">
          {selectedCategory && (
            <button type="button" onClick={() => setSelectedCategory("")} className="inline-flex items-center gap-1 rounded-full border bg-white px-2.5 py-1 text-xs font-semibold">
              {selectedCategory} <X size={12} />
            </button>
          )}
          {priceBand && (
            <button type="button" onClick={() => setPriceBand("")} className="inline-flex items-center gap-1 rounded-full border bg-white px-2.5 py-1 text-xs font-semibold">
              {priceBandLabel(priceBand)} <X size={12} />
            </button>
          )}
          <button type="button" onClick={clearAllFilters} className="text-xs font-semibold text-[#AE6965]">Clear all</button>
        </div>
      )}

      <div className={cn(hasSidebarFilters && "lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-6")}>
        {hasSidebarFilters && (
          <aside className="hidden rounded-lg border border-[#E6E8ED] bg-white p-4 lg:block">{filters}</aside>
        )}
        <div>
          {paginatedProducts.length > 0 ? (
            <>
              <div className={cn(
                "grid grid-cols-2 gap-3 sm:grid-cols-3",
                hasSidebarFilters ? "xl:grid-cols-4 2xl:grid-cols-5" : "xl:grid-cols-5 2xl:grid-cols-6"
              )}>
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold">
                  <button type="button" disabled={safePage === 1} onClick={() => setPage(safePage - 1)} className="h-9 rounded-md border bg-white px-3 disabled:opacity-40">Previous</button>
                  <span>Page {safePage} of {totalPages}</span>
                  <button type="button" disabled={safePage === totalPages} onClick={() => setPage(safePage + 1)} className="h-9 rounded-md border bg-white px-3 disabled:opacity-40">Next</button>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-lg border bg-white p-10 text-center">
              <p className="font-semibold text-[#2B2B66]">No matching products</p>
              <button type="button" onClick={clearAllFilters} className="mt-3 text-sm font-semibold text-[#AE6965]">Clear filters</button>
            </div>
          )}
        </div>
      </div>

      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button type="button" className="absolute inset-0 bg-[#2B2B66]/50" aria-label="Close filters" onClick={() => setIsMobileFiltersOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[min(100%,340px)] flex-col bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-[#2B2B66]">Filters</h2>
              <button type="button" onClick={() => setIsMobileFiltersOpen(false)} aria-label="Close filters"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto">{filters}</div>
            <button type="button" onClick={() => setIsMobileFiltersOpen(false)} className="mt-4 h-10 w-full rounded-md bg-[#2B2B66] text-sm font-semibold text-white">
              Show {filteredProducts.length} products
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

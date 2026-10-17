"use client";

import { useState, useMemo, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Product, 
  filterProducts, 
  sortProducts, 
  SortOption, 
  getUniqueValues, 
  availablePriceBands,
  priceBandLabel,
} from "@/lib/products";
import Link from "next/link";
import { ProductCard } from "@/components/site/ProductCard";
import { Filter, X, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const PRODUCTS_PER_PAGE = 12;

function ProductsContent({ initialProducts }: { initialProducts: Product[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const products = initialProducts;

  // Filter States
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get("brand") || "");
  const [selectedAvailability, setSelectedAvailability] = useState(searchParams.get("availability") || "");
  const [priceBand, setPriceBand] = useState(searchParams.get("price") || "");
  
  const [sort, setSort] = useState<SortOption>((searchParams.get("sort") as SortOption) || "recommended");
  
  const [page, setPage] = useState(Math.max(1, Number(searchParams.get("page")) || 1));
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const mounted = useRef(false);

  // Derive filter options dynamically from data
  const categories = useMemo(() => getUniqueValues(products, "category"), [products]);
  const brands = useMemo(() => getUniqueValues(products, "brand"), [products]);
  const availabilities = useMemo(() => getUniqueValues(products, "availability"), [products]);
  const priceBands = useMemo(() => availablePriceBands(products), [products]);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    setPage(1);
  }, [search, selectedCategory, selectedBrand, selectedAvailability, priceBand, sort]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedBrand) params.set("brand", selectedBrand);
    if (selectedAvailability) params.set("availability", selectedAvailability);
    if (priceBand) params.set("price", priceBand);
    if (sort !== "recommended") params.set("sort", sort);
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    router.replace(query ? `/products?${query}` : "/products", { scroll: false });
  }, [search, selectedCategory, selectedBrand, selectedAvailability, priceBand, sort, page, router]);

  // Filtering and Sorting
  const filteredProducts = useMemo(() => {
    let result = filterProducts(products, {
      search: search || undefined,
      category: selectedCategory || undefined,
      brand: selectedBrand || undefined,
      availability: selectedAvailability || undefined,
    });
    if (priceBand) {
      const band = priceBands.find((item) => item.id === priceBand);
      if (band) {
        result = result.filter(
          (product) => product.price !== null && product.price >= band.min && product.price < band.max
        );
      }
    }

    result = sortProducts(result, sort);
    return result;
  }, [products, search, selectedCategory, selectedBrand, selectedAvailability, priceBand, priceBands, sort]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, page]);

  const activeFiltersCount = [
    selectedCategory,
    selectedBrand,
    selectedAvailability,
    priceBand,
    search,
  ].filter(Boolean).length;

  const handleClearAll = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedBrand("");
    setSelectedAvailability("");
    setPriceBand("");
    setSort("recommended");
    setPage(1);
  };

  return (
    <div className="bg-[#F6F8FB] min-h-screen py-8 md:py-12">
      <div className="section-container">
        {/* Header Breadcrumb & Title */}
        <div className="mb-5">
          <nav className="mb-2 flex items-center gap-1 text-xs text-[#5E6976]" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[#2B2B66]">Home</Link>
            <span>/</span>
            <span className="font-medium text-[#17212B]">All Products</span>
          </nav>
          <h1 className="font-display text-2xl font-bold text-[#2B2B66] sm:text-3xl">
            {search ? `Search results for “${search}”` : "All Products"}
          </h1>
          <p className="mt-1 text-sm text-[#5E6976]">
            {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
          </p>
        </div>

        {/* Toolbar: Search, Filters Toggle, Active Filters, Sorting */}
        <div className="bg-white p-4 rounded-xl border border-[#E3E8EF] mb-8 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search by name or model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-[#E3E8EF] text-sm focus:outline-none focus:border-[#62648D]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 bg-[#F6F8FB] border border-[#E3E8EF] px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-[#2B2B66]"
            >
              <Filter size={16} />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-[#62648D] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#667085] hidden sm:inline">Sort By:</span>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className="bg-white border border-[#E3E8EF] text-xs sm:text-sm font-semibold text-[#2B2B66] rounded-lg px-3 py-2.5 pr-8 appearance-none focus:outline-none focus:border-[#62648D] cursor-pointer"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3.5 pointer-events-none text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters Chips Bar */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6 bg-white p-3 rounded-lg border border-[#E3E8EF]">
            <span className="text-xs text-[#667085] font-semibold mr-1">Active Filters:</span>
            
            {search && (
              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-[#62648D] text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-100">
                <span>Keyword: {search}</span>
                <button onClick={() => setSearch("")} className="hover:text-blue-900">
                  <X size={12} />
                </button>
              </span>
            )}

            {selectedCategory && (
              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-[#62648D] text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-100">
                <span>Category: {selectedCategory}</span>
                <button onClick={() => setSelectedCategory("")} className="hover:text-blue-900">
                  <X size={12} />
                </button>
              </span>
            )}

            {selectedBrand && (
              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-[#62648D] text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-100">
                <span>Brand: {selectedBrand}</span>
                <button onClick={() => setSelectedBrand("")} className="hover:text-blue-900">
                  <X size={12} />
                </button>
              </span>
            )}

            {selectedAvailability && (
              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-[#62648D] text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-100">
                <span>Availability: {selectedAvailability}</span>
                <button onClick={() => setSelectedAvailability("")} className="hover:text-blue-900">
                  <X size={12} />
                </button>
              </span>
            )}

            {priceBand && (
              <span className="inline-flex items-center gap-1.5 bg-[#F3EEEE] text-[#AE6965] text-xs font-semibold px-2.5 py-1 rounded-full border border-[#E4D0CE]">
                <span>{priceBandLabel(priceBand)}</span>
                <button onClick={() => setPriceBand("")} className="hover:text-[#2B2B66]">
                  <X size={12} />
                </button>
              </span>
            )}

            <button
              onClick={handleClearAll}
              className="text-xs text-[#E5484D] font-bold hover:underline ml-auto"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Main Grid: Sidebar Filters + Products List */}
        <div className="flex gap-6 lg:gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-64 bg-white p-5 rounded-xl border border-[#E3E8EF] shadow-sm shrink-0 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E3E8EF]">
              <span className="font-display font-bold text-base text-[#2B2B66]">Filters</span>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-[#62648D] font-semibold hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <h3 className="text-xs font-bold text-[#2B2B66] uppercase tracking-wider mb-3">
                Category
              </h3>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                <button
                  onClick={() => setSelectedCategory("")}
                  className={cn(
                    "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition",
                    !selectedCategory
                      ? "bg-blue-50 text-[#62648D]"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <span>All Categories</span>
                  {!selectedCategory && <Check size={14} />}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat === selectedCategory ? "" : cat)}
                    className={cn(
                      "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition",
                      selectedCategory === cat
                        ? "bg-blue-50 text-[#62648D]"
                        : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <span className="truncate mr-2">{cat}</span>
                    {selectedCategory === cat && <Check size={14} className="shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div>
              <h3 className="text-xs font-bold text-[#2B2B66] uppercase tracking-wider mb-3">
                Brand
              </h3>
              <div className="space-y-1.5">
                <button
                  onClick={() => setSelectedBrand("")}
                  className={cn(
                    "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition",
                    !selectedBrand
                      ? "bg-blue-50 text-[#62648D]"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <span>All Brands</span>
                  {!selectedBrand && <Check size={14} />}
                </button>
                {brands.map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBrand(b === selectedBrand ? "" : b)}
                    className={cn(
                      "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition",
                      selectedBrand === b
                        ? "bg-blue-50 text-[#62648D]"
                        : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <span>{b}</span>
                    {selectedBrand === b && <Check size={14} />}
                  </button>
                ))}
              </div>
            </div>

            {priceBands.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-[#2B2B66] uppercase tracking-wider mb-3">
                  Price
                </h3>
                <div className="space-y-1.5">
                  <button
                    onClick={() => setPriceBand("")}
                    className={cn(
                      "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition",
                      !priceBand ? "bg-[#F7F8FA] text-[#2B2B66]" : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <span>All prices</span>
                    {!priceBand && <Check size={14} />}
                  </button>
                  {priceBands.map((band) => (
                    <button
                      key={band.id}
                      onClick={() => setPriceBand(band.id === priceBand ? "" : band.id)}
                      className={cn(
                        "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition",
                        priceBand === band.id ? "bg-[#F3EEEE] text-[#AE6965]" : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <span>{band.label}</span>
                      {priceBand === band.id && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Availability Filter */}
            <div>
              <h3 className="text-xs font-bold text-[#2B2B66] uppercase tracking-wider mb-3">
                Availability
              </h3>
              <div className="space-y-1.5">
                <button
                  onClick={() => setSelectedAvailability("")}
                  className={cn(
                    "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition",
                    !selectedAvailability
                      ? "bg-blue-50 text-[#62648D]"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <span>All Items</span>
                  {!selectedAvailability && <Check size={14} />}
                </button>
                {availabilities.map((avail) => (
                  <button
                    key={avail}
                    onClick={() => setSelectedAvailability(avail === selectedAvailability ? "" : avail)}
                    className={cn(
                      "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition",
                      selectedAvailability === avail
                        ? "bg-blue-50 text-[#62648D]"
                        : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <span>{avail}</span>
                    {selectedAvailability === avail && <Check size={14} />}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Cards Container */}
          <div className="flex-1 min-w-0">
            {/* Total Results Counter */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-[#667085] font-semibold">
                Showing {filteredProducts.length} {filteredProducts.length === 1 ? "Product" : "Products"}
              </span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#E3E8EF] p-6 sm:p-12 text-center">
                <h3 className="font-display text-lg font-bold text-[#2B2B66] mb-2">
                  No products found
                </h3>
                <p className="text-sm text-[#667085] max-w-md mx-auto mb-6">
                  We couldn&apos;t find any items matching your selected criteria. Try adjusting or clearing your filters.
                </p>
                <button
                  onClick={handleClearAll}
                  className="bg-[#62648D] hover:bg-[#0f57be] text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-lg transition shadow-md"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-[#E3E8EF] bg-white text-xs font-bold rounded-lg disabled:opacity-40 hover:bg-slate-50 transition"
                    >
                      Previous
                    </button>
                    
                    <span className="text-xs font-semibold text-[#2B2B66] px-3">
                      Page {page} of {totalPages}
                    </span>

                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 border border-[#E3E8EF] bg-white text-xs font-bold rounded-lg disabled:opacity-40 hover:bg-slate-50 transition"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Slide-in Drawer */}
        {isMobileFiltersOpen && (
          <div className="fixed inset-0 z-[75] bg-black/60 lg:hidden flex justify-end">
            <div className="w-[min(100%,340px)] bg-white h-full p-5 sm:p-6 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#E3E8EF]">
                  <span className="font-display font-bold text-lg text-[#2B2B66]">Filters</span>
                  <button
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Mobile Category */}
                <div>
                  <h3 className="text-xs font-bold text-[#2B2B66] uppercase tracking-wider mb-3">
                    Category
                  </h3>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    <button
                      onClick={() => setSelectedCategory("")}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between",
                        !selectedCategory ? "bg-blue-50 text-[#62648D]" : "text-slate-600"
                      )}
                    >
                      <span>All Categories</span>
                      {!selectedCategory && <Check size={14} />}
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat === selectedCategory ? "" : cat)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between",
                          selectedCategory === cat ? "bg-blue-50 text-[#62648D]" : "text-slate-600"
                        )}
                      >
                        <span className="truncate mr-2">{cat}</span>
                        {selectedCategory === cat && <Check size={14} className="shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile Brand */}
                <div>
                  <h3 className="text-xs font-bold text-[#2B2B66] uppercase tracking-wider mb-3">
                    Brand
                  </h3>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    <button
                      onClick={() => setSelectedBrand("")}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between",
                        !selectedBrand ? "bg-blue-50 text-[#62648D]" : "text-slate-600"
                      )}
                    >
                      <span>All Brands</span>
                      {!selectedBrand && <Check size={14} />}
                    </button>
                    {brands.map((b) => (
                      <button
                        key={b}
                        onClick={() => setSelectedBrand(b === selectedBrand ? "" : b)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between",
                          selectedBrand === b ? "bg-blue-50 text-[#62648D]" : "text-slate-600"
                        )}
                      >
                        <span>{b}</span>
                        {selectedBrand === b && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile Price */}
                {priceBands.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-[#2B2B66] uppercase tracking-wider mb-3">
                      Price
                    </h3>
                    <div className="space-y-1.5">
                      <button
                        onClick={() => setPriceBand("")}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between",
                          !priceBand ? "bg-[#F7F8FA] text-[#2B2B66]" : "text-slate-600"
                        )}
                      >
                        <span>All prices</span>
                        {!priceBand && <Check size={14} />}
                      </button>
                      {priceBands.map((band) => (
                        <button
                          key={band.id}
                          onClick={() => setPriceBand(band.id === priceBand ? "" : band.id)}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between",
                            priceBand === band.id ? "bg-[#F3EEEE] text-[#AE6965]" : "text-slate-600"
                          )}
                        >
                          <span>{band.label}</span>
                          {priceBand === band.id && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mobile Availability */}
                <div>
                  <h3 className="text-xs font-bold text-[#2B2B66] uppercase tracking-wider mb-3">
                    Availability
                  </h3>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => setSelectedAvailability("")}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between",
                        !selectedAvailability ? "bg-blue-50 text-[#62648D]" : "text-slate-600"
                      )}
                    >
                      <span>All Items</span>
                      {!selectedAvailability && <Check size={14} />}
                    </button>
                    {availabilities.map((avail) => (
                      <button
                        key={avail}
                        onClick={() => setSelectedAvailability(avail === selectedAvailability ? "" : avail)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between",
                          selectedAvailability === avail ? "bg-blue-50 text-[#62648D]" : "text-slate-600"
                        )}
                      >
                        <span>{avail}</span>
                        {selectedAvailability === avail && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-[#E3E8EF] flex gap-3">
                <button
                  onClick={handleClearAll}
                  className="w-1/2 py-2.5 border border-[#E3E8EF] text-xs font-bold text-slate-600 rounded-lg"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="w-1/2 py-2.5 bg-[#62648D] text-xs font-bold text-white rounded-lg"
                >
                  Show Results ({filteredProducts.length})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ProductsCatalogClient({ initialProducts }: { initialProducts: Product[] }) {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-slate-500">Loading catalog...</div>}>
      <ProductsContent initialProducts={initialProducts} />
    </Suspense>
  );
}

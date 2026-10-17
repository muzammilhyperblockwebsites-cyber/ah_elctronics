"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/lib/products";
import { ProductCard } from "./ProductCard";

export function ProductRow({ products }: { products: Product[] }) {
  const scroller = useRef<HTMLDivElement>(null);

  const scrollByDir = (direction: number) => {
    const node = scroller.current;
    if (!node) return;
    node.scrollBy({ left: direction * Math.max(240, node.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Scroll products left"
        onClick={() => scrollByDir(-1)}
        className="absolute -left-3 top-[28%] z-10 hidden h-9 w-9 items-center justify-center rounded-full border border-[#E6E8ED] bg-white text-[#2B2B66] shadow-sm hover:bg-[#F7F8FA] lg:inline-flex"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div
        ref={scroller}
        className="flex gap-3 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:thin]"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="min-w-[152px] w-[46%] shrink-0 sm:min-w-0 sm:w-[31%] md:w-[23.5%] lg:w-[18.6%] xl:w-[15.7%]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      <button
        type="button"
        aria-label="Scroll products right"
        onClick={() => scrollByDir(1)}
        className="absolute -right-3 top-[28%] z-10 hidden h-9 w-9 items-center justify-center rounded-full border border-[#E6E8ED] bg-white text-[#2B2B66] shadow-sm hover:bg-[#F7F8FA] lg:inline-flex"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Product } from "@/lib/products";
import { ProductCard } from "@/components/site/ProductCard";
import { cn } from "@/lib/utils";

interface PopularProductTabsProps {
  products: Product[];
}

const TABS = [
  "Refrigerators",
  "Air Conditioners",
  "Washing Machines",
  "LED TVs",
  "Kitchen & Small Appliances"
];

export function PopularProductTabs({ products }: PopularProductTabsProps) {
  const [activeTab, setActiveTab] = useState(TABS[0]);

  // Filter products by active category, take first 4
  const tabProducts = products
    .filter((p) => p.category === activeTab)
    .slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Tabs Header */}
      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 gap-2 sm:gap-4 no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors",
              activeTab === tab
                ? "bg-navy text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {tab === "Kitchen & Small Appliances" ? "Kitchen Appliances" : tab}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {tabProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        {tabProducts.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            No products found for {activeTab}.
          </div>
        )}
      </div>
    </div>
  );
}

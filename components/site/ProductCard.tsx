"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Product, formatPrice, PLACEHOLDER_IMAGE, getDisplayImageUrl, isDirectImage } from "@/lib/products";
import { cn } from "@/lib/utils";
import { MessageCircle } from "lucide-react";
import { WhatsAppOrderModal } from "./WhatsAppOrderModal";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const raw = product.mainImage || "";
  const displayImage = imgError || !raw ? PLACEHOLDER_IMAGE : getDisplayImageUrl(raw);

  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-xl border border-[#E6E8ED] bg-white",
        className
      )}
    >
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square bg-[#FAFBFC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2B2B66]"
      >
        <Image
          src={displayImage}
          alt={product.name}
          fill
          className="object-contain p-3"
          onError={() => setImgError(true)}
          sizes="(max-width: 640px) 46vw, 220px"
          unoptimized={isDirectImage(displayImage)}
        />
        {product.specialOffer && (
          <span className="absolute left-2 top-2 rounded bg-[#89393B] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Offer
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col px-2.5 pb-2.5 pt-2">
        <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-[#8A93A0]">
          {product.brand}
        </p>
        <Link href={`/products/${product.slug}`} className="mt-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2B2B66]">
          <h3 className="line-clamp-2 min-h-[2.15rem] text-[13px] font-semibold leading-[1.15rem] text-[#17212B] hover:text-[#62648D]">
            {product.name}
          </h3>
        </Link>
        {product.model && (
          <p className="mt-1 truncate text-[11px] text-[#8A93A0]">{product.model}</p>
        )}
        <p className="mt-1.5 text-[15px] font-bold text-[#2B2B66]">{formatPrice(product.price)}</p>
        <div className="mt-auto pt-2">
          <WhatsAppOrderModal
            product={product}
            trigger={
              <button
                type="button"
                className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-[#25D366] px-2 text-[11px] sm:text-xs font-bold text-white whitespace-nowrap hover:bg-[#1ebe5d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2B2B66]"
              >
                <MessageCircle size={14} className="shrink-0" />
                <span className="truncate">Order on WhatsApp</span>
              </button>
            }
          />
        </div>
      </div>
    </article>
  );
}

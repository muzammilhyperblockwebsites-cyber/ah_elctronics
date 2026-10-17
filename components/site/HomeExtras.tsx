"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Minus } from "lucide-react";
import { getDisplayImageUrl, isDirectImage } from "@/lib/products";

export function CategoryCircle({
  href,
  name,
  image,
  fallback,
}: {
  href: string;
  name: string;
  image: string;
  fallback: string;
}) {
  const [src, setSrc] = useState(getDisplayImageUrl(image || fallback));
  return (
    <Link
      href={href}
      className="flex w-[92px] shrink-0 flex-col items-center gap-2 text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2B2B66]"
    >
      <span className="flex h-[84px] w-[84px] items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-[#E6E8ED]">
        <Image
          src={src}
          alt=""
          width={84}
          height={84}
          className="h-[70px] w-[70px] object-contain"
          onError={() => setSrc(fallback)}
          unoptimized={isDirectImage(src)}
        />
      </span>
      <span className="line-clamp-2 text-xs font-semibold leading-4 text-[#17212B]">{name}</span>
    </Link>
  );
}

export function HomeFaq({
  items,
}: {
  items: { question: string; answer: string }[];
}) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-[#E6E8ED] rounded-xl border border-[#E6E8ED] bg-white">
      {items.map((item, index) => {
        const expanded = open === index;
        return (
          <div key={item.question}>
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() => setOpen(expanded ? null : index)}
              className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm font-semibold text-[#17212B]"
            >
              {item.question}
              {expanded ? <Minus className="h-4 w-4 shrink-0 text-[#AE6965]" /> : <Plus className="h-4 w-4 shrink-0 text-[#8A93A0]" />}
            </button>
            {expanded && <p className="px-4 pb-4 text-sm leading-6 text-[#5E6976]">{item.answer}</p>}
          </div>
        );
      })}
    </div>
  );
}

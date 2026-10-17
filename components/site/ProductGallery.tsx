'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PLACEHOLDER_IMAGE, getDisplayImageUrl, isDirectImage } from '@/lib/products';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  const validImages = images && images.length > 0
    ? images
    : [PLACEHOLDER_IMAGE];

  const currentImage = imgErrors[selectedIndex]
    ? PLACEHOLDER_IMAGE
    : getDisplayImageUrl(validImages[selectedIndex] || PLACEHOLDER_IMAGE);

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative aspect-square w-full bg-white rounded-2xl border border-[#E3E8EF] overflow-hidden shadow-xs">
        <Image
          src={currentImage}
          alt={`${productName} - Image ${selectedIndex + 1}`}
          fill
          className="object-contain p-6 sm:p-8 transition-transform duration-300 hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
          unoptimized={isDirectImage(currentImage)}
          priority
          onError={() => {
            setImgErrors((prev) => ({ ...prev, [selectedIndex]: true }));
          }}
        />
      </div>

      {/* Thumbnails */}
      {validImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {validImages.slice(0, 6).map((img, idx) => {
            const isError = imgErrors[idx];
            const thumbSrc = isError
              ? PLACEHOLDER_IMAGE
              : getDisplayImageUrl(img);

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-white rounded-xl border transition-all duration-200 overflow-hidden ${
                  selectedIndex === idx
                    ? 'border-[#2B2B66] ring-2 ring-[#2B2B66]/20 shadow-xs'
                    : 'border-[#E3E8EF] hover:border-[#2B2B66]/50'
                }`}
                aria-label={`View image ${idx + 1}`}
              >
                <Image
                  src={thumbSrc}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  fill
                  className="object-contain p-2"
                  sizes="80px"
                  unoptimized={isDirectImage(thumbSrc)}
                  onError={() => {
                    setImgErrors((prev) => ({ ...prev, [idx]: true }));
                  }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

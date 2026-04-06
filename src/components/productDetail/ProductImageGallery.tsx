'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  difficultLevel?: string;
  thumbnailUrl?: string;
}

export default function ProductImageGallery({
  images,
  productName,
  difficultLevel,
  thumbnailUrl,
}: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  const displayImages = thumbnailUrl
    ? [thumbnailUrl, ...images.filter((img) => img !== thumbnailUrl)]
    : images;

  const getDifficultyTextColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'advanced':
        return 'text-red-600';
      case 'intermediate':
        return 'text-amber-600';
      case 'basic':
        return 'text-green-600';
      default:
        return 'text-[#e51636]';
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {displayImages[selectedImage] ? (
          <Image
            src={displayImages[selectedImage]}
            alt={productName}
            fill
            className="object-contain p-4 transition-transform duration-500 hover:scale-105"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-400">
            No image available
          </div>
        )}

        {difficultLevel && (
          <div className="absolute top-4 left-4 rounded-full bg-white/90 px-4 py-1.5 text-xs font-bold tracking-wider text-slate-800 uppercase shadow-sm backdrop-blur-md">
            Level: <span className={getDifficultyTextColor(difficultLevel)}>{difficultLevel}</span>
          </div>
        )}
      </div>

      {displayImages.length > 1 && (
        <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                selectedImage === idx
                  ? 'border-[#e51636] opacity-100 shadow-md'
                  : 'border-transparent bg-white opacity-60 shadow-sm hover:opacity-100'
              }`}
            >
              <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

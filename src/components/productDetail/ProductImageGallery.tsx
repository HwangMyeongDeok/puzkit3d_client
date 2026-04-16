'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  difficultLevel?: string;
  scrollToIndex?: number;
}

export default function ProductImageGallery({
  images,
  productName,
  difficultLevel,
  scrollToIndex = 0,
}: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  // Refs dùng để điều khiển thanh cuộn
  const scrollRef = useRef<HTMLDivElement>(null);
  const thumbnailsRef = useRef<(HTMLButtonElement | null)[]>([]);

  // --- 1. THEO DÕI scrollToIndex ĐỂ TỰ ĐỘNG CHUYỂN VÀ CUỘN ---
  useEffect(() => {
    if (scrollToIndex !== undefined && scrollToIndex < images.length) {
      // 1. Đổi ảnh to thành ảnh số N
      setSelectedImage(scrollToIndex);

      // 2. Trượt thanh ảnh nhỏ tới đúng tấm số N
      const targetThumb = thumbnailsRef.current[scrollToIndex];
      if (targetThumb) {
        targetThumb.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center', // Chữ 'center' này sẽ đưa tấm ảnh số N ra đúng giữa thanh cuộn, nhìn cực kỳ xịn!
        });
      }
    }
  }, [scrollToIndex, images.length]);

  // --- 2. LOGIC KÉO THẢ CHUỘT (DRAG TO SCROLL) ---
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault(); // Tránh bôi đen text vô tình
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Nhân 2 để vuốt nhanh và nhạy hơn
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // --- 3. ĐỊNH DẠNG MÀU SẮC CHO ĐỘ KHÓ ---
  const getDifficultyTextColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'advanced':
        return 'text-red-600';
      case 'intermediate':
        return 'text-amber-600';
      case 'basic':
        return 'text-green-600';
      default:
        return 'text-slate-900';
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* KHUNG ẢNH CHÍNH */}
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {images[selectedImage] ? (
          <Image
            src={images[selectedImage]}
            alt={productName}
            fill
            className="object-contain p-4 transition-transform duration-500"
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

      {/* DANH SÁCH THUMBNAILS (KÉO THẢ ĐƯỢC) */}
      {images.length > 0 && (
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`scrollbar-hide flex gap-3 overflow-x-auto pb-2 ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }}
        >
          {images.map((img, idx) => (
            <button
              key={`${img}-${idx}`}
              ref={(el) => {
                thumbnailsRef.current[idx] = el;
              }}
              onClick={() => setSelectedImage(idx)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                selectedImage === idx
                  ? 'border-slate-800 opacity-100 shadow-md ring-2 ring-slate-800/10' // Viền đen slate khi được chọn
                  : 'border-transparent bg-white opacity-40 hover:opacity-100' // Mờ đi khi không chọn
              }`}
            >
              <Image
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                fill
                className="pointer-events-none object-cover p-1 select-none"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Puzzle, Timer } from 'lucide-react';

import type { ProductDto } from '@/types';
import { ROUTES } from '@/constants';

type ProductCardProps = {
  product: ProductDto;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={ROUTES.PRODUCT_DETAIL(product.slug)} className="group block">
      <div className="card-hover border-border bg-card overflow-hidden rounded-xl border">
        <div className="bg-muted relative aspect-square overflow-hidden">
          {product.thumbnailUrl ? (
            <Image
              src={product.thumbnailUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-muted-foreground text-sm">No image</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 p-3">
          <h3 className="text-card-foreground line-clamp-2 min-h-[2.5rem] text-sm leading-tight font-semibold">
            {product.name}
          </h3>

          <div className="text-muted-foreground flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <Puzzle className="h-3 w-3" />
              <span>{product.totalPieceCount} mảnh</span>
            </div>
            <div className="flex items-center gap-1">
              <Timer className="h-3 w-3" />
              <span>{product.estimatedBuildTime} phút</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="bg-brand/10 text-brand rounded-full px-2 py-0.5 text-[10px] font-bold">
              {product.difficultLevel}
            </span>
            <span className="text-accent text-xs font-semibold">Xem chi tiết →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

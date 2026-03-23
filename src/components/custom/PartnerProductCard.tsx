'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, FileText } from 'lucide-react';
import { toast } from 'sonner';

import type { PartnerProduct } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useAppDispatch } from '@/stores';
import { ROUTES } from '@/constants';

type PartnerProductCardProps = {
  product: PartnerProduct;
};

export default function PartnerProductCard({ product }: PartnerProductCardProps) {
  const dispatch = useAppDispatch();

  const handleRequestQuote = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.success(`Added "${product.name}" to quote request`);
  };

  return (
    <Link href={ROUTES.PRODUCT_DETAIL(product.slug)} className="group block">
      <div className="card-hover border-border bg-card overflow-hidden rounded-xl border">
        <div className="bg-muted relative aspect-square overflow-hidden">
          <Image
            src={product.thumbnailUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="bg-warning text-warning-foreground absolute top-2 left-2 rounded-md px-2 py-0.5 text-xs font-bold">
            Partner Product
          </span>
        </div>

        <div className="flex flex-col gap-2 p-3">
          <span className="text-brand text-[11px] font-semibold tracking-wider uppercase">
            {product.partner.name}
          </span>

          <h3 className="text-card-foreground line-clamp-2 min-h-[2.5rem] text-sm leading-tight font-semibold">
            {product.name}
          </h3>

          <div className="flex flex-col gap-0.5">
            <span className="text-muted-foreground text-[10px] font-medium">Reference Price</span>
            <span className="text-accent text-base font-bold">
              {formatPrice(product.referencePrice)}
            </span>
          </div>

          <div className="text-muted-foreground flex items-center gap-1 text-xs">
            <Star className="fill-warning text-warning h-3 w-3" />
            <span>{product.rating}</span>
            <span className="bg-warning/10 text-warning ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold">
              Pre-order
            </span>
          </div>

          <button
            className="bg-warning text-warning-foreground mt-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            onClick={handleRequestQuote}
          >
            <FileText className="h-3.5 w-3.5" />
            Request Quote
          </button>
        </div>
      </div>
    </Link>
  );
  s;
}

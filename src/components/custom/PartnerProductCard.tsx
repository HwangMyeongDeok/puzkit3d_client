'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';

import { formatPrice } from '@/lib/utils';
import type { PartnerProductListItem } from '@/lib/api/endpoints/partnerProductApi';

type PartnerProductCardProps = {
  product: PartnerProductListItem;
  partnerName?: string;
  countryName?: string;
};

export default function PartnerProductCard({
  product,
  partnerName,
  countryName,
}: PartnerProductCardProps) {
  const handleRequestQuote = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.success(`Added "${product.name}" to quote request`);
  };

  return (
    <Link href={`/brands/${product.id}`} className="group block">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <Image
            src={product.thumbnailUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute top-3 left-3 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-slate-900 shadow">
            Partner Product
          </span>
        </div>

        <div className="space-y-3 p-4">
          <div className="space-y-1">
            {partnerName ? (
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                {partnerName}
              </p>
            ) : null}

            <h3 className="line-clamp-2 min-h-[3rem] text-base font-bold text-slate-900">
              {product.name}
            </h3>

            {countryName ? <p className="text-xs text-slate-500">{countryName}</p> : null}
          </div>

          <p className="line-clamp-2 min-h-[2.5rem] text-sm text-slate-600">
            {product.description || 'No description available'}
          </p>

          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium tracking-wide text-slate-400 uppercase">
                Reference Price
              </p>
              <p className="text-xl font-extrabold text-rose-600">
                {formatPrice(product.referencePrice)}
              </p>
            </div>

            <button
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
              onClick={handleRequestQuote}
            >
              <FileText className="h-3.5 w-3.5" />
              Request Quote
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

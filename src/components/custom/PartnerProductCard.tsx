'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Loader2, Home, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useMemo } from 'react';

import { ROUTES } from '@/constants';
import { formatPrice } from '@/lib/utils';
import { useAddItemToPartnerCartMutation } from '@/lib/api/endpoints/partnerCartApi';

const DEFAULT_PARTNER_MEDIA_BASE_URL =
  'https://puzkit3d-media-s3-bucket.s3.ap-southeast-1.amazonaws.com';

const MEDIA_BASE_URL = (
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL || DEFAULT_PARTNER_MEDIA_BASE_URL
).replace(/\/$/, '');

function resolvePartnerImageUrl(url?: string | null) {
  if (!url) return `${DEFAULT_PARTNER_MEDIA_BASE_URL}/partner-products/default.png`;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${MEDIA_BASE_URL}/${url.replace(/^\/+/, '')}`;
}

type PartnerProductCardProps = {
  product: {
    id: string;
    name: string;
    slug?: string;
    thumbnailUrl?: string | null;
    referencePrice?: number | null;
    difficultLevel?: string | null;
    partnerId?: string;
  };
  partnerName?: string;
  partnerSlug?: string;
  countryName?: string;
};

export default function PartnerProductCard({
  product,
  partnerName,
  partnerSlug,
  countryName,
}: PartnerProductCardProps) {
  const [addItemToPartnerCart, { isLoading: isAdding }] = useAddItemToPartnerCartMutation();

  const href =
    partnerSlug && product.slug
      ? ROUTES.PARTNER_PRODUCT_DETAIL(partnerSlug, product.slug)
      : ROUTES.BRANDS;

  const thumbnailUrl = useMemo(
    () => resolvePartnerImageUrl(product.thumbnailUrl),
    [product.thumbnailUrl]
  );

  async function handleAddToCart(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    try {
      await addItemToPartnerCart({
        itemId: product.id,
        quantity: 1,
      }).unwrap();

      toast.success(`Added "${product.name}" to cart`);
    } catch {
      toast.error('Failed to add partner product to cart');
    }
  }

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link href={href} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
          <Image
            src={thumbnailUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link href={href} className="block min-w-0">
          <h3
            title={product.name}
            className="truncate text-lg font-semibold tracking-tight text-slate-900 transition-colors group-hover:text-red-700"
          >
            {product.name}
          </h3>
        </Link>

        <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2">
          {partnerName ? (
            <span className="inline-flex max-w-[48%] items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
              <Home className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{partnerName}</span>
            </span>
          ) : null}

          {countryName ? (
            <span className="inline-flex max-w-[48%] items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{countryName}</span>
            </span>
          ) : null}

          {product.difficultLevel ? (
            <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700">
              <span className="truncate">{product.difficultLevel}</span>
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Reference price
            </p>
            <p className="mt-1 truncate text-xl font-extrabold tracking-tight text-[#ff4d6d]">
              {product.referencePrice != null ? formatPrice(product.referencePrice) : 'Contact'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdding}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#052a5b] text-white shadow-md transition-all hover:scale-105 hover:bg-[#052a5b]/90 disabled:opacity-60"
            aria-label="Add to cart"
            title="Add to cart"
          >
            {isAdding ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ShoppingCart className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
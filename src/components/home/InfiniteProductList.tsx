'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Loader2, Puzzle, BarChart3, ArrowUpRight, ArrowRight, Clock3 } from 'lucide-react';
import { skipToken } from '@reduxjs/toolkit/query';

// Đừng quên import mấy cái này nhé
import { useGetProductsQuery, useGetProductVariantsQuery } from '@/lib/api/endpoints/productApi';
import { useGetTopicsQuery } from '@/lib/api/endpoints/metaData';
import { useGetPriceDetailByVariantIdQuery } from '@/lib/api/endpoints/priceApi';

import { ProductDto } from '@/types/api';
import { TopicDto } from '@/types/api/catalog.types';

// ── Hàm tiện ích ─────────────────────────────────────────────────────────────
function formatBuildTime(value?: number) {
  if (!value) return 'N/A';
  if (value < 60) return `${value} min`;

  const hours = Math.floor(value / 60);
  const minutes = value % 60;

  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}

const getDifficultyColor = (level?: string) => {
  switch (level?.toLowerCase()) {
    case 'advanced':
      return 'text-red-600';
    case 'intermediate':
      return 'text-amber-600';
    case 'basic':
      return 'text-green-600';
    default:
      return 'text-slate-600';
  }
};

function ProductItemCard({ product, topicName }: { product: ProductDto; topicName: string }) {
  // 1. Gọi API lấy Variant
  const { data: variantsData, isLoading: isVariantsLoading } = useGetProductVariantsQuery(
    product.id,
    { refetchOnMountOrArgChange: true }
  );
  const defaultVariant = variantsData?.variants?.[0];

  // 2. Gọi API lấy Price dựa trên Variant
  const { data: priceArray, isLoading: isPriceLoading } = useGetPriceDetailByVariantIdQuery(
    defaultVariant?.id ?? skipToken,
    { refetchOnMountOrArgChange: true }
  );

  const isFetchingData = isVariantsLoading || isPriceLoading;

  // 3. Xử lý logic lọc Giá
  const prices = Array.isArray(priceArray) ? priceArray : [];
  const standardPriceObj = prices.find((p: any) => p.priceName === 'Standard');
  const salePriceObj = prices.find((p: any) => p.priceName !== 'Standard');

  const activePriceObj = salePriceObj || standardPriceObj;
  const isSale = !!salePriceObj && !!standardPriceObj;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const formattedActivePrice = activePriceObj?.unitPrice
    ? formatCurrency(activePriceObj.unitPrice)
    : 'Updating...';
  const formattedStandardPrice = standardPriceObj?.unitPrice
    ? formatCurrency(standardPriceObj.unitPrice)
    : '';

  return (
    <Link
      href={`/shop/${product.slug ?? product.id}`}
      className="group flex flex-col overflow-hidden rounded-[30px] border border-[#e4ecf8] bg-white/95 shadow-[0_14px_40px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#d3e4ff] hover:shadow-[0_22px_48px_rgba(15,23,42,0.09)]"
    >
      <div className="relative aspect-[4/4.25] overflow-hidden bg-[linear-gradient(180deg,#fbfdff_0%,#f3f8ff_100%)] p-5">
        <div
          className={`absolute top-4 left-4 z-10 rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase shadow-sm backdrop-blur-sm ${getDifficultyColor(product.difficultLevel)}`}
        >
          {product.difficultLevel || 'Instock'}
        </div>
        <div className="absolute inset-x-8 bottom-6 h-8 rounded-full bg-[#9bb7e7]/20 blur-2xl" />
        <div className="absolute inset-x-5 inset-y-5 rounded-[24px] border border-white/60 bg-white/35" />
        <Image
          src={product.thumbnailUrl || '/images/placeholder-product.png'}
          alt={product.name}
          fill
          unoptimized
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
          className="object-contain p-6 transition-transform duration-500 group-hover:scale-[1.06]"
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-[18px] font-bold tracking-tight text-[#0f2347]">
          {product.name}
        </h3>

        <div className="mt-4 flex w-full flex-nowrap items-center gap-1.5">
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#e5edf9] bg-[#f6f9fe] px-2 py-1 text-[11px] font-medium text-slate-600">
            <Puzzle className="h-3 w-3" />
            {product.totalPieceCount ?? '—'}
          </span>

          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#e5edf9] bg-[#f6f9fe] px-2 py-1 text-[11px] font-medium text-slate-600">
            <Clock3 className="h-3 w-3" />
            {formatBuildTime(product.estimatedBuildTime)}
          </span>

          <span className="inline-flex min-w-0 shrink items-center gap-1 rounded-full border border-[#e5edf9] bg-[#f6f9fe] px-2 py-1 text-[11px] font-medium text-slate-600">
            <BarChart3 className="h-3 w-3 shrink-0" />
            <span className="truncate">{topicName}</span>
          </span>
        </div>

        <div className="flex-1" />

        {/* ── HIỂN THỊ GIÁ Ở ĐÂY ── */}
        <div className="mt-5 flex items-end justify-between border-t border-[#edf2f8] pt-4">
          <div className="flex flex-col">
            <span className="mb-0.5 text-[10px] font-medium tracking-wider text-slate-400 uppercase">
              Price
            </span>
            {isFetchingData ? (
              <div className="h-6 w-24 animate-pulse rounded bg-slate-200"></div>
            ) : (
              <div className="flex items-end gap-2">
                <span className="text-lg font-extrabold tracking-tight text-[#e51636]">
                  {formattedActivePrice}
                </span>
                {isSale && (
                  <span className="mb-0.5 text-xs font-medium text-slate-400 line-through decoration-slate-300">
                    {formattedStandardPrice}
                  </span>
                )}
              </div>
            )}
          </div>

          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#0f2347] text-white shadow-[0_10px_25px_rgba(15,35,71,0.20)] transition group-hover:bg-[#163b78]">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── COMPONENT CHÍNH ──────────────────────────────────────────────────────────
export default function InfiniteProductList() {
  const { data, isFetching, isLoading, isError } = useGetProductsQuery({
    pageNumber: 1,
    pageSize: 8,
  });

  const products = data?.items ?? [];

  const { data: topicsData } = useGetTopicsQuery({
    pageNumber: 1,
    pageSize: 50,
    ascending: true,
  });
  const allTopics = topicsData?.items ?? [];

  if (isLoading || isFetching) {
    return (
      <section id="instock-products" className="relative bg-transparent">
        <div className="container-custom py-16 lg:py-20">
          <div className="overflow-hidden rounded-[38px] border border-[#dbe7ff] bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] px-6 py-8 shadow-[0_18px_60px_rgba(15,23,42,0.05)] md:px-8 lg:px-10">
            <div className="flex min-h-[40vh] items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-slate-700" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section id="instock-products" className="relative bg-transparent">
        <div className="container-custom py-16 lg:py-20">
          <div className="overflow-hidden rounded-[38px] border border-red-200 bg-[linear-gradient(180deg,#ffffff_0%,#fffafa_100%)] px-6 py-8 shadow-[0_18px_60px_rgba(15,23,42,0.05)] md:px-8 lg:px-10">
            <div className="rounded-[28px] border border-red-200 bg-red-50 px-6 py-10 text-center text-sm font-medium text-red-600">
              Failed to load instock products.
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="instock-products" className="relative bg-transparent">
      <div className="container-custom py-16 lg:py-20">
        <div className="relative overflow-hidden rounded-[38px] border border-[#dbe7ff] bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] px-6 py-8 shadow-[0_18px_60px_rgba(15,23,42,0.05)] md:px-8 lg:px-10">
          <div className="pointer-events-none absolute top-0 right-0 h-56 w-56 rounded-full bg-[#dcecff] blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-full bg-[#edf5ff] blur-3xl" />

          <div className="relative mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex rounded-full border border-[#dbe7ff] bg-[#f8fbff] px-4 py-2 text-[11px] font-semibold tracking-[0.24em] text-[#4b6797] uppercase">
                Instock Product
              </div>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#0f2347] md:text-4xl">
                Ready-to-ship model kits
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
                Available now, polished presentation, and faster purchase flow for products already
                in stock.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 self-start rounded-full border border-[#dbe7ff] bg-white px-5 py-3 text-sm font-semibold text-[#163b78] shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(15,23,42,0.08)]"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {products.map((product: ProductDto) => {
              // Lấy tên Topic truyền vào thẻ Card luôn cho gọn
              const topicName =
                allTopics.find((t: TopicDto) => t.id === product.topicId)?.name || 'N/A';
              return <ProductItemCard key={product.id} product={product} topicName={topicName} />;
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

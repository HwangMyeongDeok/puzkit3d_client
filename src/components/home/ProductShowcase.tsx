'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Loader2, ArrowUpRight, ArrowRight, Home, MapPin } from 'lucide-react';

import { useGetPartnerProductsQuery } from '@/lib/api/endpoints/partnerProductApi';
import { useGetPartnersQuery } from '@/lib/api/endpoints/partnerApi';
import { useGetImportServiceConfigsSelectQuery } from '@/lib/api/endpoints/importServiceConfigApi';
import BrandMarquee from './BrandMarquee';

function formatPrice(value?: number | string) {
  if (value === null || value === undefined || value === '') return 'Contact for pricing';

  const num = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(num)) return 'Contact for pricing';

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(num);
}

function PartnerProductItemCard({
  product,
  partnerName,
  partnerSlug,
  countryName,
}: {
  product: any;
  partnerName?: string;
  partnerSlug?: string;
  countryName?: string;
}) {
  const href =
    partnerSlug && product.slug ? `/brands/${partnerSlug}/${product.slug}` : '/brands';

  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-[30px] border border-[#e4ecf8] bg-white/95 shadow-[0_14px_40px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#d3e4ff] hover:shadow-[0_22px_48px_rgba(15,23,42,0.09)]"
    >
      <div className="relative aspect-[4/4.25] overflow-hidden bg-[linear-gradient(180deg,#fbfdff_0%,#f3f8ff_100%)] p-5">
        <div className="absolute top-4 left-4 z-10 rounded-full border border-[#d9e6fb] bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-sm backdrop-blur-sm">
          Partner
        </div>

        <div className="absolute inset-x-8 bottom-6 h-8 rounded-full bg-[#9bb7e7]/20 blur-2xl" />
        <div className="absolute inset-x-5 inset-y-5 rounded-[24px] border border-white/60 bg-white/35" />

        <div className="absolute inset-5 overflow-hidden rounded-[24px]">
          <Image
            src={product.thumbnailUrl || '/images/placeholder-product.png'}
            alt={product.name}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3
          title={product.name}
          className="line-clamp-2 min-h-[56px] text-[18px] font-bold tracking-tight text-[#0f2347]"
        >
          {product.name}
        </h3>

        <div className="mt-4 flex w-full flex-nowrap items-center gap-1.5 overflow-hidden">
          {partnerName ? (
            <span className="inline-flex min-w-0 shrink items-center gap-1 rounded-full border border-[#e5edf9] bg-[#f6f9fe] px-2 py-1 text-[11px] font-medium text-slate-600">
              <Home className="h-3 w-3 shrink-0" />
              <span className="truncate">{partnerName}</span>
            </span>
          ) : null}

          {countryName ? (
            <span className="inline-flex min-w-0 shrink items-center gap-1 rounded-full border border-[#e5edf9] bg-[#f6f9fe] px-2 py-1 text-[11px] font-medium text-slate-600">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{countryName}</span>
            </span>
          ) : null}
        </div>

        <div className="flex-1" />

        <div className="mt-5 flex items-end justify-between border-t border-[#edf2f8] pt-4">
          <div className="flex min-w-0 flex-col">
            <span className="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Reference Price
            </span>
            <span className="truncate text-lg font-extrabold tracking-tight text-[#e51636]">
              {formatPrice(product.referencePrice)}
            </span>
          </div>

          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0f2347] text-white shadow-[0_10px_25px_rgba(15,35,71,0.20)] transition group-hover:bg-[#163b78]">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function ProductShowcase() {
  const {
    data: productsData,
    isLoading: isProductsLoading,
    isError: isProductsError,
    isFetching: isProductsFetching,
  } = useGetPartnerProductsQuery({
    pageNumber: 1,
    pageSize: 4,
    ascending: true,
  });

  const { data: partnersData, isLoading: isPartnersLoading } = useGetPartnersQuery({
    pageNumber: 1,
    pageSize: 100,
    ascending: true,
  });

  const { data: configResponse } = useGetImportServiceConfigsSelectQuery();

  const products = productsData?.items ?? [];
  const partners = partnersData?.items ?? [];
  const configs = configResponse ?? [];

  const partnerMap = new Map(partners.map((item) => [item.id, item]));
  const configMap = new Map(configs.map((item) => [item.id, item]));

  if (isProductsLoading || isProductsFetching || isPartnersLoading) {
    return (
      <section className="bg-transparent">
        <div className="container-custom pb-16 lg:pb-20">
          <div className="overflow-hidden rounded-[38px] border border-[#dbe7ff] bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] px-6 py-8 shadow-[0_18px_60px_rgba(15,23,42,0.05)] md:px-8 lg:px-10">
            <div className="flex min-h-[40vh] items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-slate-700" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (isProductsError) {
    return (
      <section className="bg-transparent">
        <div className="container-custom pb-16 lg:pb-20">
          <div className="overflow-hidden rounded-[38px] border border-red-200 bg-white px-6 py-8 shadow-[0_18px_60px_rgba(15,23,42,0.05)] md:px-8 lg:px-10">
            <div className="rounded-[28px] border border-red-200 bg-red-50 px-6 py-10 text-center text-sm font-medium text-red-600">
              Failed to load partner products.
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-transparent">
      <div className="container-custom pb-16 lg:pb-20">
        <div className="relative overflow-hidden rounded-[38px] border border-[#dbe7ff] bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] px-6 py-8 shadow-[0_18px_60px_rgba(15,23,42,0.05)] md:px-8 lg:px-10">
          <div className="pointer-events-none absolute top-0 right-0 h-56 w-56 rounded-full bg-[#deecff] blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-full bg-[#edf5ff] blur-3xl" />

          <div className="relative mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex rounded-full border border-[#dbe7ff] bg-[#f8fbff] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4b6797]">
                Partner Products
              </div>

              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#0f2347] md:text-4xl">
                Curated partner selections
              </h2>

              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
                Carefully presented partner-sourced products with the same look, typography, hover,
                and card system as instock products.
              </p>
            </div>

            <Link
              href="/brands"
              className="inline-flex items-center gap-2 self-start rounded-full border border-[#dbe7ff] bg-white px-5 py-3 text-sm font-semibold text-[#163b78] shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(15,23,42,0.08)]"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <BrandMarquee />

          <div className="relative mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {products.map((product: any) => {
              const partner = partnerMap.get(product.partnerId);
              const config = partner ? configMap.get(partner.importServiceConfigId) : undefined;

              return (
                <PartnerProductItemCard
                  key={product.id}
                  product={product}
                  partnerName={partner?.name}
                  partnerSlug={partner?.slug}
                  countryName={config?.countryName}
                />
              );
            })}
          </div>
        </div>

        <div
          id="custom-design"
          className="relative mt-8 overflow-hidden rounded-[38px] border border-white/10 bg-[#032a63] shadow-[0_24px_80px_rgba(3,42,99,0.22)]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.16),transparent_34%)]" />
          <div className="grid gap-10 px-6 py-10 md:px-10 md:py-12 lg:grid-cols-[1.1fr_0.9fr] lg:px-14 lg:py-16">
            <div className="relative z-10">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/65">
                Custom Design Product
              </p>

              <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-white md:text-4xl lg:text-5xl">
                You imagine it — we turn it into a real model.
              </h2>

              <p className="mt-5 max-w-xl text-base leading-8 text-white/78 md:text-lg">
                Send us your idea, reference images, or a short description. The process is simple,
                flexible, and built to turn your concept into a custom product.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/custom-service"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#032a63] shadow-[0_14px_40px_rgba(255,255,255,0.15)] transition hover:-translate-y-0.5 hover:bg-slate-100"
                >
                  Send Design Request
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="relative z-10 grid gap-4">
              <div className="rounded-[26px] border border-white/12 bg-white/10 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-md">
                <h3 className="text-lg font-bold text-white">Share Your Idea</h3>
                <p className="mt-2 text-sm leading-6 text-white/72">
                  Tell us what you want or send reference images.
                </p>
              </div>

              <div className="rounded-[26px] border border-white/12 bg-white/10 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-md">
                <h3 className="text-lg font-bold text-white">Get a Proposal</h3>
                <p className="mt-2 text-sm leading-6 text-white/72">
                  Our team reviews your request and suggests a suitable direction.
                </p>
              </div>

              <div className="rounded-[26px] border border-white/12 bg-white/10 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-md">
                <h3 className="text-lg font-bold text-white">Start the Design</h3>
                <p className="mt-2 text-sm leading-6 text-white/72">
                  Move from concept to a custom-made model built for you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
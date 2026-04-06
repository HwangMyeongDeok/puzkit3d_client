'use client';

import { Sparkles } from 'lucide-react';
import { useGetPartnersQuery } from '@/lib/api/endpoints/partnerApi';

export default function BrandMarquee() {
  const { data, isLoading, isError } = useGetPartnersQuery({
    pageNumber: 1,
    pageSize: 12,
    ascending: true,
  });

  const partners = data?.items?.filter((item: { name?: string }) => item?.name?.trim()) ?? [];

  if (isLoading) {
    return (
      <div className="mt-6 rounded-[28px] border border-[#dbe7ff] bg-[linear-gradient(180deg,#fbfdff_0%,#f4f8ff_100%)] px-5 py-5 text-sm text-slate-500 shadow-[0_14px_40px_rgba(15,23,42,0.04)]">
        Loading partners...
      </div>
    );
  }

  if (isError || partners.length === 0) {
    return null;
  }

  const marqueeItems = Array.from({ length: 6 }).flatMap(() => partners);

  return (
    <div className="mt-6 overflow-hidden rounded-[30px] border border-[#dbe7ff] bg-[linear-gradient(180deg,#fbfdff_0%,#f4f8ff_100%)] px-4 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:px-5">
      <style>{`
        @keyframes partner-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>

      <div className="mb-4 flex items-center gap-2 px-1">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#e9f1ff] text-[#234a86]">
          <Sparkles className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-[#163b78]">Trusted partner brands</p>
          <p className="text-xs text-slate-500">Curated suppliers connected to the storefront</p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[22px] border border-[#e6eefb] bg-white/80 py-4 backdrop-blur-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />

        <div
          className="flex min-w-max gap-4 whitespace-nowrap will-change-transform"
          style={{ animation: 'partner-marquee 24s linear infinite' }}
        >
          {marqueeItems.map((partner: { id: string; name: string }, index) => (
            <span
              key={`${partner.id}-${index}`}
              className="inline-flex shrink-0 items-center rounded-full border border-[#d7e4fb] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-6 py-3 text-sm font-semibold text-[#234a86] shadow-[0_8px_22px_rgba(15,23,42,0.05)]"
            >
              {partner.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

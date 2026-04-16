'use client';

import Link from 'next/link';
import { Loader2, Store } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { useGetPartnersQuery } from '@/lib/api/endpoints/partnerApi';

export default function BrandMarquee() {
  const { data, isLoading, isError } = useGetPartnersQuery({
    pageNumber: 1,
    pageSize: 100,
    ascending: true,
  });

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const partners = useMemo(() => {
    const items = data?.items ?? [];
    return items
      .filter((item) => item?.name && item?.slug)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data?.items]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;

    if (!viewport || !track || partners.length === 0) return;

    let animation: Animation | null = null;

    const runAnimation = () => {
      animation?.cancel();

      const viewportWidth = viewport.offsetWidth;
      const trackWidth = track.scrollWidth;

      if (!viewportWidth || !trackWidth) return;

      const gap = 24;
      const startX = -trackWidth - gap;
      const endX = viewportWidth + gap;

      const distance = endX - startX;
      const speedPxPerSecond = 90;
      const duration = (distance / speedPxPerSecond) * 1000;

      track.style.transform = `translateX(${startX}px)`;

      animation = track.animate(
        [
          { transform: `translateX(${startX}px)` },
          { transform: `translateX(${endX}px)` },
        ],
        {
          duration,
          iterations: Infinity,
          easing: 'linear',
        }
      );
    };

    runAnimation();

    const handleResize = () => {
      runAnimation();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      animation?.cancel();
      window.removeEventListener('resize', handleResize);
    };
  }, [partners]);

  if (isLoading) {
    return (
      <div className="flex h-14 items-center justify-center rounded-[22px] border border-[#dbe7ff] bg-white/80">
        <Loader2 className="h-5 w-5 animate-spin text-slate-600" />
      </div>
    );
  }

  if (isError || partners.length === 0) {
    return null;
  }

  return (
    <div
      ref={viewportRef}
      className="relative h-14 overflow-hidden rounded-[22px] border border-[#dbe7ff] bg-white/80 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-white via-white/80 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-white via-white/80 to-transparent" />

      <div
        ref={trackRef}
        className="absolute left-0 top-1/2 inline-flex -translate-y-1/2 items-center gap-3 whitespace-nowrap px-3"
      >
        {partners.map((partner) => (
          <Link
            key={partner.id}
            href={`/brands/${partner.slug}`}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#dbe7ff] bg-[#f8fbff] px-4 py-2 text-sm font-semibold text-[#163b78] transition hover:border-[#cfe1ff] hover:bg-white hover:text-[#0f2347]"
          >
            <Store className="h-4 w-4" />
            {partner.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
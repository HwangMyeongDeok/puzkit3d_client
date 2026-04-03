'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

type HeroItem = {
  id: number;
  image: string;
};

const HERO_ITEMS: HeroItem[] = [
  { id: 1, image: '/images/hero/motorbike.png' },
  { id: 2, image: '/images/hero/house-old.png' },
  { id: 3, image: '/images/hero/chair.png' },
  { id: 4, image: '/images/hero/house-brick.png' },
  { id: 5, image: '/images/hero/robot.png' },
];

const GLOBAL_HEADLINE = 'Ready to shop, discover, or create your own model.';
const GLOBAL_SUB =
  'Explore instock kits, browse partner collections, or submit a custom design request — all in one clean storefront.';

type PositionKey = -2 | -1 | 0 | 1 | 2;

const POSITIONS: Record<
  PositionKey,
  {
    left: string;
    top: string;
    scale: number;
    rotate: number;
    opacity: number;
    zIndex: number;
    size: number;
    blur: number;
  }
> = {
  [-2]: {
    left: '12%',
    top: '68%',
    scale: 0.72,
    rotate: -18,
    opacity: 0.14,
    zIndex: 10,
    size: 180,
    blur: 2.2,
  },
  [-1]: {
    left: '28%',
    top: '49%',
    scale: 0.92,
    rotate: -12,
    opacity: 0.45,
    zIndex: 20,
    size: 250,
    blur: 0.7,
  },
  [0]: {
    left: '54%',
    top: '42%',
    scale: 1.2,
    rotate: 0,
    opacity: 1,
    zIndex: 40,
    size: 390,
    blur: 0,
  },
  [1]: {
    left: '77%',
    top: '49%',
    scale: 0.92,
    rotate: 12,
    opacity: 0.45,
    zIndex: 20,
    size: 250,
    blur: 0.7,
  },
  [2]: {
    left: '91%',
    top: '68%',
    scale: 0.72,
    rotate: 18,
    opacity: 0.14,
    zIndex: 10,
    size: 180,
    blur: 2.2,
  },
};

function getRelativeOffset(index: number, activeIndex: number, total: number): PositionKey {
  let offset = index - activeIndex;
  const half = Math.floor(total / 2);

  if (offset > half) offset -= total;
  if (offset < -half) offset += total;

  return offset as PositionKey;
}

export default function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(2);

  useEffect(() => {
    const startDelay = window.setTimeout(() => {
      const interval = window.setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % HERO_ITEMS.length);
      }, 2600);

      (window as typeof window & { __heroInterval?: number }).__heroInterval = interval;
    }, 1000);

    return () => {
      window.clearTimeout(startDelay);
      if ((window as typeof window & { __heroInterval?: number }).__heroInterval) {
        window.clearInterval(
          (window as typeof window & { __heroInterval?: number }).__heroInterval
        );
      }
    };
  }, []);

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + HERO_ITEMS.length) % HERO_ITEMS.length);
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % HERO_ITEMS.length);
  };

  return (
    <section className="relative overflow-hidden bg-[#032a63]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_20%,rgba(96,165,250,0.20),transparent_26%),radial-gradient(circle_at_82%_18%,rgba(125,211,252,0.16),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(56,189,248,0.12),transparent_34%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(2,23,68,0.98)_0%,rgba(3,42,99,0.95)_48%,rgba(9,54,131,0.92)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,rgba(3,42,99,0)_0%,rgba(244,248,255,1)_100%)]" />

      <div className="container-custom relative z-10 py-14 md:py-16 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[0.96fr_1.04fr]">
          <div className="max-w-xl">
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-white/80 uppercase backdrop-blur-md">
              Premium 3D Model Store
            </div>

            <h1 className="mt-5 text-4xl leading-tight font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
              {GLOBAL_HEADLINE}
            </h1>

            <p className="mt-5 max-w-lg text-base leading-8 text-white/72 md:text-lg">
              {GLOBAL_SUB}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="#instock-products"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#032a63] shadow-[0_14px_35px_rgba(255,255,255,0.18)] transition hover:-translate-y-0.5 hover:bg-slate-100"
              >
                Shop Instock
              </Link>

              <Link
                href="#custom-design"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/12"
              >
                Custom Request
              </Link>
            </div>

            <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
              <div className="rounded-[22px] border border-white/10 bg-white/8 px-4 py-4 backdrop-blur-md">
                <p className="text-2xl font-extrabold text-white">3</p>
                <p className="mt-1 text-xs font-medium tracking-[0.16em] text-white/60 uppercase">
                  Product Lines
                </p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/8 px-4 py-4 backdrop-blur-md">
                <p className="text-2xl font-extrabold text-white">Fast</p>
                <p className="mt-1 text-xs font-medium tracking-[0.16em] text-white/60 uppercase">
                  Nationwide Shipping
                </p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/8 px-4 py-4 backdrop-blur-md">
                <p className="text-2xl font-extrabold text-white">1:1</p>
                <p className="mt-1 text-xs font-medium tracking-[0.16em] text-white/60 uppercase">
                  Design Support
                </p>
              </div>
            </div>
          </div>

          <div className="relative h-[410px] overflow-hidden sm:h-[500px] lg:h-[600px]">
            <div className="absolute inset-x-[7%] top-8 h-[82%] rounded-[36px] border border-white/10 bg-white/6 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-sm" />
            <div className="absolute bottom-12 left-1/2 h-12 w-[72%] -translate-x-1/2 rounded-full bg-black/30 blur-3xl" />

            {HERO_ITEMS.map((item, index) => {
              const offset = getRelativeOffset(index, activeIndex, HERO_ITEMS.length);
              const position = POSITIONS[offset];
              const isActive = offset === 0;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className="absolute transition-[left,top,transform,opacity,filter] duration-700 ease-out"
                  style={{
                    left: position.left,
                    top: position.top,
                    opacity: position.opacity,
                    zIndex: position.zIndex,
                    filter: `blur(${position.blur}px)`,
                    transform: `translate(-50%, -50%) scale(${position.scale}) rotate(${position.rotate}deg)`,
                  }}
                  aria-label={`Hero item ${item.id}`}
                >
                  <div
                    className="relative"
                    style={{
                      width: `${position.size}px`,
                      height: `${position.size}px`,
                    }}
                  >
                    <div
                      className={`absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/18 blur-2xl ${
                        isActive ? 'h-10 w-32' : 'h-7 w-24'
                      }`}
                    />

                    <Image
                      src={item.image}
                      alt={`Hero item ${item.id}`}
                      fill
                      sizes="(max-width: 640px) 180px, (max-width: 1024px) 250px, 390px"
                      className="object-contain drop-shadow-[0_28px_50px_rgba(0,0,0,0.26)]"
                      priority={isActive}
                    />
                  </div>
                </button>
              );
            })}

            <div className="absolute bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-2 backdrop-blur-md">
              {HERO_ITEMS.map((item, index) => {
                const isActive = index === activeIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Go to hero item ${item.id}`}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      isActive ? 'w-8 bg-white' : 'w-2.5 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                );
              })}
            </div>

            <button
              type="button"
              onClick={goPrev}
              className="absolute top-1/2 left-3 z-50 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/8 text-white backdrop-blur-md transition hover:bg-white/14"
              aria-label="Previous"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={goNext}
              className="absolute top-1/2 right-3 z-50 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/8 text-white backdrop-blur-md transition hover:bg-white/14"
              aria-label="Next"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

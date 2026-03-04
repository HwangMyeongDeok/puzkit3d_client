'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const SLIDES = [
  {
    badge: 'New Collection 2025',
    heading: 'Premium Mechanical & 3D Kits',
    description:
      'Khám phá bộ sưu tập mô hình lắp ráp 3D cao cấp từ các thương hiệu hàng đầu thế giới.',
    cta: { label: 'Explore Instock', href: '#new-arrivals' },
    ctaSecondary: { label: 'Browse All', href: '/shop' },
    image: 'https://placehold.co/800x600/1a1a2e/e0e0e0?text=Gundam+Collection',
    gradient: 'from-primary via-primary/95 to-primary/80',
  },
  {
    badge: 'Wooden Mechanical Models',
    heading: 'Ugears — Art Meets Engineering',
    description: 'Tự tay lắp ráp những cỗ máy cơ khí bằng gỗ tinh xảo, không cần keo dán.',
    cta: { label: 'Shop Ugears', href: '/brands/ugears' },
    ctaSecondary: null,
    image: 'https://placehold.co/800x600/2d2d44/e0e0e0?text=Ugears+Models',
    gradient: 'from-primary via-primary/90 to-transparent',
  },
  {
    badge: 'Custom 3D Printing',
    heading: 'Design Your Own Model Kit',
    description: 'Dịch vụ in 3D và thiết kế mô hình theo yêu cầu. Biến ý tưởng thành hiện thực.',
    cta: { label: 'Get Started', href: '/custom-service' },
    ctaSecondary: null,
    image: 'https://placehold.co/800x600/3a3a5c/e0e0e0?text=3D+Printing',
    gradient: 'from-primary via-primary/90 to-transparent',
  },
];

export default function HeroCarousel() {
  return (
    <Carousel opts={{ loop: true }} className="w-full">
      <CarouselContent>
        {SLIDES.map((slide, index) => (
          <CarouselItem key={index}>
            <div className="bg-primary relative min-h-[60vh] overflow-hidden">
              <div className="absolute inset-0">
                <Image
                  src={slide.image}
                  alt=""
                  fill
                  sizes="100vw"
                  className="object-cover opacity-30"
                />
                <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />
              </div>

              <div className="absolute inset-0 opacity-10">
                <div className="bg-brand-accent absolute -top-24 -right-24 h-96 w-96 rounded-full blur-3xl" />
                <div className="bg-brand absolute -bottom-24 -left-24 h-96 w-96 rounded-full blur-3xl" />
              </div>

              <div className="container-custom relative z-10 flex min-h-[60vh] items-center">
                <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-2">
                  <div className="py-16 lg:py-24">
                    <span className="bg-primary-foreground/10 text-primary-foreground/80 mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider uppercase">
                      {slide.badge}
                    </span>

                    <h1 className="text-gradient mb-6 text-4xl leading-tight font-extrabold tracking-tight md:text-5xl lg:text-6xl">
                      {slide.heading}
                    </h1>

                    <p className="text-primary-foreground/70 mb-8 max-w-md text-lg leading-relaxed">
                      {slide.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4">
                      <Link
                        href={slide.cta.href}
                        className="group bg-accent text-accent-foreground inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-bold shadow-lg transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                      >
                        {slide.cta.label}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>

                      {slide.ctaSecondary && (
                        <Link
                          href={slide.ctaSecondary.href}
                          className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 inline-flex items-center gap-2 rounded-xl border px-8 py-3.5 text-sm font-bold transition-all duration-200"
                        >
                          {slide.ctaSecondary.label}
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="hidden items-center justify-center lg:flex">
                    <div className="relative">
                      <div className="bg-brand/20 absolute -inset-4 rounded-2xl blur-2xl" />
                      <Image
                        src={slide.image}
                        alt={slide.heading}
                        width={560}
                        height={420}
                        className="border-primary-foreground/10 relative rounded-2xl border shadow-2xl"
                        priority
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious className="border-primary-foreground/20 bg-primary/50 text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground left-4 z-20 backdrop-blur-sm lg:left-8" />
      <CarouselNext className="border-primary-foreground/20 bg-primary/50 text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground right-4 z-20 backdrop-blur-sm lg:right-8" />
    </Carousel>
  );
}

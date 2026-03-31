import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Home',
  description:
    'PuzKit3D — Premium 3D assembly model kit store. Wide range of wood, metal, and plastic materials. International ordering and custom design services.',
  openGraph: {
    title: 'PuzKit3D - 3D Puzzle Assembly Model Kits',
    description: 'Discover premium 3D model kit collections. Wide range of materials and styles.',
    url: '/',
    type: 'website',
  },
};

import TrustBadges from '@/components/custom/TrustBadges';
import HeroCarousel from '@/components/home/HeroCarousel';
import BrandMarquee from '@/components/home/BrandMarquee';
// Đổi tên component FeaturedProducts thành tên khác (vd: ProductShowcase) cho đỡ cấn nếu rảnh
import FeaturedProducts from '@/components/home/FeaturedProducts';

export default function Home() {
  return (
    <>
      <HeroCarousel />

      <TrustBadges />

      <BrandMarquee />

      <section className="bg-slate-50/50 py-16 lg:py-24">
        <div className="container-custom">
          {/* TIÊU ĐỀ MỚI - GỌN GÀNG, CHÂN THỰC */}
          <div className="mb-10 text-center md:text-left">
            <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              Explore Our Collection
            </h2>
            <p className="max-w-2xl text-base text-slate-500">
              Discover a wide range of premium 3D assembly models. From beginner-friendly kits to
              advanced engineering masterpieces.
            </p>
          </div>

          <FeaturedProducts />
        </div>
      </section>
    </>
  );
}

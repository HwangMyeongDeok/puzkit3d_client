import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

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
import FeaturedProducts from '@/components/home/FeaturedProducts';

export default function Home() {
  return (
    <>
      <HeroCarousel />

      <TrustBadges />

      <BrandMarquee />

      <section className="py-16 lg:py-24">
        <div className="container-custom">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="mb-2 text-3xl font-bold md:text-4xl">Featured Products</h2>
              <p className="text-muted-foreground max-w-md">
                Top-rated products from the community.
              </p>
            </div>
            <Link
              href="/shop"
              className="group text-brand hover:text-brand-accent hidden items-center gap-1 text-sm font-semibold transition-colors md:flex"
            >
              View All
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <FeaturedProducts />

          <div className="mt-8 text-center md:hidden">
            <Link
              href="/shop"
              className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
            >
              View All Products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

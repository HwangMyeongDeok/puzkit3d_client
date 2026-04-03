import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home',
  description:
    'PuzKit3D — Instock products, partner products, and custom design services for premium 3D model kits.',
  openGraph: {
    title: 'PuzKit3D - Instock, Partner & Custom Design Products',
    description:
      'Choose ready-to-buy instock kits, discover partner products, or send your own custom design request.',
    url: '/',
    type: 'website',
  },
};

import HeroCarousel from '@/components/home/HeroCarousel';
import FeatureBar from '@/components/home/FeatureBar';
import InfiniteProductList from '@/components/home/InfiniteProductList';
import ProductShowcase from '@/components/home/ProductShowcase';

export default function Home() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[linear-gradient(180deg,rgba(3,42,99,0.05)_0%,rgba(3,42,99,0)_100%)]" />

      <HeroCarousel />

      <div className="relative z-10">
        <FeatureBar />
        <InfiniteProductList />
        <ProductShowcase />
      </div>
    </div>
  );
}

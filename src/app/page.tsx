import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Trang chủ',
  description:
    'PuzKit3D — Cửa hàng mô hình lắp ráp 3D hàng đầu. Đa dạng chất liệu gỗ, kim loại, nhựa. Hỗ trợ đặt hàng quốc tế và thiết kế theo yêu cầu.',
  openGraph: {
    title: 'PuzKit3D - Mô hình Lắp ráp Trí tuệ 3D',
    description: 'Khám phá bộ sưu tập mô hình 3D chất lượng cao. Đa dạng chất liệu và phong cách.',
    url: '/',
    type: 'website',
  },
};

import { products } from '@/lib/mockData';
import ProductCard from '@/components/custom/ProductCard';
import TrustBadges from '@/components/custom/TrustBadges';
import HeroCarousel from '@/components/home/HeroCarousel';
import BrandMarquee from '@/components/home/BrandMarquee';

export default function Home() {
  const featured = [...products].sort((a, b) => b.rating - a.rating).slice(0, 4);

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
                Sản phẩm nổi bật được đánh giá cao nhất từ cộng đồng.
              </p>
            </div>
            <Link
              href="/shop"
              className="group text-brand hover:text-brand-accent hidden items-center gap-1 text-sm font-semibold transition-colors md:flex"
            >
              Xem tất cả
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link
              href="/shop"
              className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
            >
              Xem tất cả sản phẩm
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

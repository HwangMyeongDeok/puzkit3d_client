import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Shop All',
  description:
    'Khám phá toàn bộ bộ sưu tập mô hình lắp ráp 3D tại PuzKit3D. Lọc theo danh mục, giá, độ khó.',
  openGraph: {
    title: 'Shop All | PuzKit3D',
    description: 'Duyệt và mua mô hình 3D chất lượng cao tại PuzKit3D.',
    url: '/shop',
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <Suspense>{children}</Suspense>;
}

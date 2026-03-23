import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Shop All',
  description:
    'Discover the entire 3D assembly model collection at PuzKit3D. Filter by category, price, and difficulty.',
  openGraph: {
    title: 'Shop All | PuzKit3D',
    description: 'Browse and buy high-quality 3D models at PuzKit3D.',
    url: '/shop',
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <Suspense>{children}</Suspense>;
}

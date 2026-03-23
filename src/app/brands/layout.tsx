import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Exclusive Partner Collections',
  description:
    'Pre-order custom items from international partner brands: ROKR, Piececool, Metal Earth. Estimated prices, Staff quotes within 24 hours.',
  openGraph: {
    title: 'Brands | PuzKit3D',
    description: 'Bộ sưu tập độc quyền từ đối tác quốc tế — đặt hàng theo yêu cầu tại PuzKit3D.',
    url: '/brands',
  },
};

export default function BrandsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

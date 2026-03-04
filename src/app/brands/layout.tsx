import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Exclusive Partner Collections',
  description:
    'Đặt hàng theo yêu cầu từ các thương hiệu đối tác quốc tế: ROKR, Piececool, Metal Earth. Giá dự kiến, Staff báo giá trong 24h.',
  openGraph: {
    title: 'Brands | PuzKit3D',
    description: 'Bộ sưu tập độc quyền từ đối tác quốc tế — đặt hàng theo yêu cầu tại PuzKit3D.',
    url: '/brands',
  },
};

export default function BrandsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

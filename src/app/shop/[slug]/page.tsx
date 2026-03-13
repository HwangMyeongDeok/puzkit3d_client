import type { Metadata } from 'next';

import { getProductBySlug, getProductPrice } from '@/lib/mockData';
import { getPartnerProductBySlug } from '@/lib/partnerMockData';
import ProductDetailContent from '@/components/custom/ProductDetailContent';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const instockProduct = getProductBySlug(slug);
  const partnerProduct = getPartnerProductBySlug(slug);
  const product = instockProduct || partnerProduct;

  if (!product) {
    return { title: 'Sản phẩm không tồn tại' };
  }

  const description = product.description?.split('\n')[0] || '';

  return {
    title: product.name,
    description,
    openGraph: {
      title: `${product.name} | PuzKit3D`,
      description,
      images: [{ url: product.thumbnailUrl, width: 600, height: 600, alt: product.name }],
      type: 'website',
      url: `/shop/${slug}`,
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const instockProduct = getProductBySlug(slug) ?? null;
  const partnerProduct = getPartnerProductBySlug(slug) ?? null;

  return <ProductDetailContent instockProduct={instockProduct} partnerProduct={partnerProduct} />;
}

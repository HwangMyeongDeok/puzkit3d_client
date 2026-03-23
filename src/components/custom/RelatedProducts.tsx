import type { InstockProduct, PartnerProduct } from '@/types';
import ProductCard from '@/components/custom/ProductCard';
import PartnerProductCard from '@/components/custom/PartnerProductCard';

interface RelatedProductsProps {
  instockProducts: InstockProduct[];
  partnerProducts: PartnerProduct[];
}

export default function RelatedProducts({
  instockProducts,
  partnerProducts,
}: RelatedProductsProps) {
  const hasProducts = instockProducts.length > 0 || partnerProducts.length > 0;
  if (!hasProducts) return null;

  return (
    <section>
      <h2 className="mb-6 text-xl font-bold">Related Products</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {instockProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        {partnerProducts.map((product) => (
          <PartnerProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

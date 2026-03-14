'use client';

import { Loader2 } from 'lucide-react';

import { useGetProductsQuery } from '@/lib/api/endpoints/productApi';
import ProductCard from '@/components/custom/ProductCard';

export default function FeaturedProducts() {
  const { data, isLoading, isError } = useGetProductsQuery({
    pageNumber: 1,
    pageSize: 4,
    isActive: true,
  });

  const products = data?.items ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="text-brand h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError || products.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

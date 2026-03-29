'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

import { useGetProductsQuery } from '@/lib/api/endpoints/productApi';
import ProductCard from '@/components/custom/ProductCard';

export default function FeaturedProducts() {
  const [visibleCount, setVisibleCount] = useState(8);
  const { data, isLoading, isFetching, isError } = useGetProductsQuery({
    pageNumber: 1,
    pageSize: visibleCount,
    isActive: true,
  });

  const products = data?.items ?? [];
  const hasMore = products.length === visibleCount; // Simple check if we should show 'Load More'

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#e51636]" />
      </div>
    );
  }

  if (isError || products.length === 0) {
    return null;
  }

  return (
    <div className="flex w-full flex-col items-center">
      <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-12 flex w-full justify-center">
          <button
            onClick={() => setVisibleCount((prev) => prev + 4)}
            disabled={isFetching}
            className="group relative flex w-[160px] items-center justify-center gap-2 overflow-hidden rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-slate-800 hover:shadow-xl active:scale-95 disabled:pointer-events-none disabled:opacity-70"
          >
            {isFetching ? <Loader2 className="h-5 w-5 animate-spin" /> : <span>Load More</span>}
            <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
          </button>
        </div>
      )}
    </div>
  );
}

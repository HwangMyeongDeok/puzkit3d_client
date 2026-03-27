'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';
import { Loader2, Clock, Puzzle, BarChart } from 'lucide-react';

// Nhớ check lại 2 đường dẫn import này cho khớp với project của ông nha
import { useGetProductsQuery } from '@/lib/api/endpoints/productApi';
import type { ProductDto } from '@/types/api/product.api.types';

export default function InfiniteProductList() {
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<ProductDto[]>([]);

  // Hook theo dõi xem user đã cuộn tới cái ref ở cuối list chưa
  // rootMargin: '200px' -> kích hoạt gọi API trước khi chạm đáy 200px cho mượt
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '200px',
  });

  // Gọi API lấy data
  const { data, isFetching, isLoading } = useGetProductsQuery({
    pageNumber: page,
    pageSize: 8, // Mỗi lần load 8 sản phẩm (ông có thể đổi thành 12 tùy ý)
    isActive: true,
  });

  // Nối data mới vào state khi API trả kết quả về
  useEffect(() => {
    if (data?.items) {
      setProducts((prev) => {
        // Lọc trùng ID để tránh lỗi render 2 lần của React StrictMode lúc Dev
        const newItems = data.items.filter(
          (newItem: ProductDto) => !prev.some((p) => p.id === newItem.id)
        );
        return [...prev, ...newItems];
      });
    }
  }, [data]);

  // Tự động nhảy trang khi cuộn xuống đáy
  useEffect(() => {
    if (inView && !isFetching && data?.hasNextPage) {
      setPage((prev) => prev + 1);
    }
  }, [inView, isFetching, data]);

  // UI lúc mới load trang lần đầu (chưa có data nào)
  if (isLoading && products.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="text-primary h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* 1. Danh sách sản phẩm */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:gap-6 xl:grid-cols-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/shop/${product.slug}`}
            className="border-border bg-card group flex flex-col overflow-hidden rounded-xl border transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            {/* Ảnh Thumbnail */}
            <div className="bg-muted relative aspect-square w-full overflow-hidden">
              <Image
                src={product.thumbnailUrl}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Thông tin */}
            <div className="flex flex-1 flex-col p-4">
              <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
                {product.code}
              </p>
              <h3 className="text-card-foreground group-hover:text-primary line-clamp-2 text-base font-bold transition-colors">
                {product.name}
              </h3>

              <div className="text-muted-foreground mt-auto flex flex-wrap items-center gap-3 pt-4 text-xs">
                <div className="flex items-center gap-1">
                  <Puzzle className="h-3.5 w-3.5" />
                  <span>{product.totalPieceCount} pcs</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{product.estimatedBuildTime}m</span>
                </div>
                <div className="flex items-center gap-1">
                  <BarChart className="h-3.5 w-3.5" />
                  <span>{product.difficultLevel}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 2. Sentinel: Cục chốt chặn mồi nhử gắn ref để gọi trigger load more */}
      <div ref={ref} className="flex h-20 w-full items-center justify-center py-6">
        {isFetching && (
          <div className="text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">Loading more awesome models...</span>
          </div>
        )}

        {/* Hết trang thì báo cáo cho user */}
        {!isFetching && data && !data.hasNextPage && products.length > 0 && (
          <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
            <span className="bg-border h-px w-12"></span>
            You've seen all products
            <span className="bg-border h-px w-12"></span>
          </div>
        )}
      </div>
    </div>
  );
}

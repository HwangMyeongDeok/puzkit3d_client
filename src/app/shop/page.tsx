'use client';

import { useState } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useGetProductsQuery } from '@/lib/api/endpoints/productApi';
import ProductCard from '@/components/custom/ProductCard';

const PAGE_SIZE = 20;

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [pageNumber, setPageNumber] = useState(1);

  const { data, isLoading, isError, isFetching } = useGetProductsQuery({
    pageNumber,
    pageSize: PAGE_SIZE,
    searchTerm: debouncedSearchQuery || undefined,
    isActive: true,
  });

  const products = data?.items ?? [];

  return (
    <div className="container-custom py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold md:text-4xl">Shop All</h1>
        <p className="text-muted-foreground">
          Khám phá toàn bộ bộ sưu tập mô hình lắp ráp 3D cao cấp.
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Search */}
        <aside className="hidden w-[250px] shrink-0 lg:block">
          <div className="border-border bg-card sticky top-20 rounded-xl border p-5">
            <h2 className="text-foreground mb-4 text-base font-bold">Tìm kiếm</h2>
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Tìm sản phẩm..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPageNumber(1);
                }}
                className="pl-9"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setPageNumber(1);
                  }}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Toolbar */}
          <div className="border-border bg-card mb-6 flex items-center justify-between rounded-xl border px-4 py-3">
            {/* Mobile search */}
            <div className="relative lg:hidden">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Tìm..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPageNumber(1);
                }}
                className="h-9 w-40 pl-9 text-sm"
              />
            </div>

            <span className="text-muted-foreground hidden text-sm lg:block">
              {isLoading ? 'Đang tải...' : `${data?.totalCount ?? 0} sản phẩm`}
            </span>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="border-border bg-card flex flex-col items-center justify-center rounded-xl border py-20 text-center">
              <Loader2 className="text-brand mb-4 h-8 w-8 animate-spin" />
              <p className="text-muted-foreground text-sm">Đang tải sản phẩm...</p>
            </div>
          ) : isError ? (
            <div className="border-border bg-card flex flex-col items-center justify-center rounded-xl border py-20 text-center">
              <p className="text-foreground mb-2 text-lg font-semibold">Không thể tải sản phẩm</p>
              <p className="text-muted-foreground text-sm">Đã xảy ra lỗi. Vui lòng thử lại sau.</p>
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {data && data.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                    disabled={pageNumber <= 1 || isFetching}
                    className="border-border bg-card hover:bg-secondary rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Trước
                  </button>
                  <span className="text-muted-foreground text-sm">
                    Trang {data.pageNumber} / {data.totalPages}
                  </span>
                  <button
                    onClick={() => setPageNumber((p) => p + 1)}
                    disabled={pageNumber >= data.totalPages || isFetching}
                    className="border-border bg-card hover:bg-secondary rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="border-border bg-card flex flex-col items-center justify-center rounded-xl border py-20 text-center">
              <p className="text-foreground mb-2 text-lg font-semibold">Không tìm thấy sản phẩm</p>
              <p className="text-muted-foreground text-sm">
                Hãy thử thay đổi từ khóa tìm kiếm để xem thêm kết quả.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

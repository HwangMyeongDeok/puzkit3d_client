'use client';

import { useState } from 'react';
import { Search, X, Loader2, PackageX } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useGetProductsQuery } from '@/lib/api/endpoints/productApi';
import ProductCard from '@/components/custom/ProductCard';

const PAGE_SIZE = 18;

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [pageNumber, setPageNumber] = useState(1);

  const { data, isLoading, isError, isFetching } = useGetProductsQuery(
    {
      pageNumber,
      pageSize: PAGE_SIZE,
      searchTerm: debouncedSearchQuery || undefined,
      isActive: true,
    },
    { refetchOnMountOrArgChange: true }
  );

  const products = data?.items ?? [];

  return (
    <div className="container-custom py-8 lg:py-16">
      {/* HEADER & THANH TÌM KIẾM CĂN GIỮA MỚI */}
      <div className="mx-auto mb-12 flex max-w-3xl flex-col items-center text-center">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Cửa Hàng Mô Hình
        </h1>
        <p className="mb-8 text-lg text-slate-500">
          Khám phá bộ sưu tập mô hình lắp ráp 3D cao cấp. Tỉ mỉ đến từng chi tiết.
        </p>

        {/* Thanh Search To - Rõ - Trực Quan */}
        <div className="relative w-full max-w-lg shadow-sm">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <Input
            placeholder="Tìm kiếm mô hình bạn yêu thích..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPageNumber(1);
            }}
            className="focus-visible:ring-primary h-14 rounded-full border-slate-200 bg-white pr-12 pl-12 text-base transition-all focus-visible:ring-2 focus-visible:ring-offset-0"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setPageNumber(1);
              }}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* HIỂN THỊ TRẠNG THÁI LOADING / LỖI / HOẶC DANH SÁCH */}
      <div className="mx-auto max-w-6xl">
        {/* Thanh đếm số lượng nhẹ nhàng phía trên */}
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
          <span className="text-sm font-medium text-slate-500">
            {isLoading
              ? 'Đang tải...'
              : `Hiển thị ${products.length} / ${data?.totalCount ?? 0} sản phẩm`}
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl py-32 text-center">
            <Loader2 className="text-primary mb-4 h-10 w-10 animate-spin" />
            <p className="text-slate-500">Đang tải bộ sưu tập...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-red-50 py-32 text-center">
            <p className="mb-2 text-lg font-semibold text-red-800">Oops! Không thể tải dữ liệu.</p>
            <p className="text-sm text-red-600">Đã xảy ra lỗi kết nối. Vui lòng thử lại sau.</p>
          </div>
        ) : products.length > 0 ? (
          <>
            {/* GRID SIÊU THOÁNG: 1 cột (mobile) -> 2 cột (tablet) -> 3 cột (desktop) */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Phân trang (Pagination) */}
            {data && data.totalPages > 1 && (
              <div className="mt-16 flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                  disabled={pageNumber <= 1 || isFetching}
                  className="h-12 rounded-xl px-6 font-medium hover:bg-slate-50"
                >
                  Trang trước
                </Button>
                <div className="flex h-12 items-center justify-center rounded-xl bg-slate-50 px-6 text-sm font-medium text-slate-600">
                  <span className="text-primary mr-1 font-bold">{data.pageNumber}</span> /{' '}
                  {data.totalPages}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setPageNumber((p) => p + 1)}
                  disabled={pageNumber >= data.totalPages || isFetching}
                  className="h-12 rounded-xl px-6 font-medium hover:bg-slate-50"
                >
                  Trang sau
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 py-32 text-center">
            <PackageX className="mb-4 h-16 w-16 text-slate-300" />
            <p className="mb-2 text-lg font-semibold text-slate-800">Không tìm thấy sản phẩm nào</p>
            <p className="text-sm text-slate-500">
              Chưa có mô hình nào khớp với từ khóa "{searchQuery}". Sếp thử tìm từ khác xem sao nhé!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

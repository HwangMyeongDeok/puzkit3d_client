'use client';

import { useState, useMemo } from 'react';
import { SlidersHorizontal, ChevronDown, Search, X } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/lib/hooks/useDebounce';

import { products, getAllBrands } from '@/lib/mockData';
import type { MockProduct } from '@/lib/mockData';
import ProductCard from '@/components/custom/ProductCard';

const DIFFICULTY_OPTIONS: MockProduct['difficulty'][] = ['easy', 'medium', 'hard', 'expert'];

const SORT_OPTIONS = [
  { value: 'popular', label: 'Phổ biến' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price-asc', label: 'Giá: Thấp → Cao' },
  { value: 'price-desc', label: 'Giá: Cao → Thấp' },
  { value: 'rating', label: 'Đánh giá cao' },
];

type SortValue = (typeof SORT_OPTIONS)[number]['value'];

export default function ShopPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<MockProduct['difficulty'][]>([]);
  const [sortBy, setSortBy] = useState<SortValue>('popular');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const allBrands = getAllBrands();

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const toggleDifficulty = (diff: MockProduct['difficulty']) => {
    setSelectedDifficulties((prev) =>
      prev.includes(diff) ? prev.filter((d) => d !== diff) : [...prev, diff]
    );
  };

  const filteredProducts = useMemo(() => {
    let results = [...products];

    if (debouncedSearchQuery) {
      results = results.filter((p) =>
        p.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      );
    }
    if (selectedBrands.length > 0) {
      results = results.filter((p) => selectedBrands.includes(p.brand));
    }
    if (selectedDifficulties.length > 0) {
      results = results.filter((p) => selectedDifficulties.includes(p.difficulty));
    }

    switch (sortBy) {
      case 'price-asc':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
        results.sort((a, b) => b.soldCount - a.soldCount);
        break;
      default:
        break;
    }

    return results;
  }, [debouncedSearchQuery, selectedBrands, selectedDifficulties, sortBy]);

  const FiltersContent = (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Tìm sản phẩm..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div>
        <h3 className="text-foreground mb-3 text-sm font-bold">Thương hiệu</h3>
        <div className="flex flex-col gap-2">
          {allBrands.map((brand) => (
            <label
              key={brand}
              className="text-foreground/80 hover:text-foreground flex cursor-pointer items-center gap-2.5 text-sm transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => toggleBrand(brand)}
                className="border-border text-brand accent-brand h-4 w-4 rounded"
              />
              {brand}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-foreground mb-3 text-sm font-bold">Độ khó</h3>
        <div className="flex flex-col gap-2">
          {DIFFICULTY_OPTIONS.map((diff) => (
            <label
              key={diff}
              className="text-foreground/80 hover:text-foreground flex cursor-pointer items-center gap-2.5 text-sm capitalize transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedDifficulties.includes(diff)}
                onChange={() => toggleDifficulty(diff)}
                className="border-border text-brand accent-brand h-4 w-4 rounded"
              />
              {diff}
            </label>
          ))}
        </div>
      </div>

      {(selectedBrands.length > 0 || selectedDifficulties.length > 0 || searchQuery !== '') && (
        <button
          onClick={() => {
            setSelectedBrands([]);
            setSelectedDifficulties([]);
            setSearchQuery('');
          }}
          className="text-accent hover:text-accent/80 justify-start text-left text-xs font-semibold transition-colors"
        >
          Xóa tất cả bộ lọc
        </button>
      )}
    </div>
  );

  return (
    <div className="container-custom py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold md:text-4xl">Shop All</h1>
        <p className="text-muted-foreground">
          Khám phá toàn bộ bộ sưu tập mô hình lắp ráp 3D cao cấp.
        </p>
      </div>

      <div className="flex gap-8">
        <aside className="hidden w-[250px] shrink-0 lg:block">
          <div className="border-border bg-card sticky top-20 rounded-xl border p-5">
            <h2 className="text-foreground mb-4 text-base font-bold">Bộ lọc</h2>
            {FiltersContent}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="border-border bg-card mb-6 flex items-center justify-between rounded-xl border px-4 py-3">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="text-foreground flex items-center gap-2 text-sm font-medium lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Bộ lọc
            </button>

            <span className="text-muted-foreground hidden text-sm lg:block">
              {filteredProducts.length} sản phẩm
            </span>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortValue)}
                className="border-border bg-background text-foreground appearance-none rounded-lg border py-2 pr-8 pl-3 text-sm font-medium outline-none"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2" />
            </div>
          </div>

          {showMobileFilters && (
            <div className="animate-slide-up border-border bg-card mb-6 rounded-xl border p-5 lg:hidden">
              {FiltersContent}
            </div>
          )}

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="border-border bg-card flex flex-col items-center justify-center rounded-xl border py-20 text-center">
              <p className="text-foreground mb-2 text-lg font-semibold">Không tìm thấy sản phẩm</p>
              <p className="text-muted-foreground text-sm">
                Hãy thử thay đổi bộ lọc để xem thêm kết quả.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

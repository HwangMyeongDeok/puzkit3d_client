'use client';

import { useState } from 'react';
import { SlidersHorizontal, ChevronDown, Search, X, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/lib/hooks/useDebounce';

import { partnerProducts, getPartnerBrands, getPartnerStyles } from '@/lib/partnerMockData';
import PartnerProductCard from '@/components/custom/PartnerProductCard';

const SORT_OPTIONS = [
  { value: 'popular', label: 'Phổ biến' },
  { value: 'price-asc', label: 'Giá: Thấp → Cao' },
  { value: 'price-desc', label: 'Giá: Cao → Thấp' },
  { value: 'rating', label: 'Đánh giá cao' },
];

type SortValue = (typeof SORT_OPTIONS)[number]['value'];

export default function BrandsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const debouncedMin = useDebounce(priceMin, 500);
  const debouncedMax = useDebounce(priceMax, 500);
  const [sortBy, setSortBy] = useState<SortValue>('popular');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const allBrands = getPartnerBrands();
  const allStyles = getPartnerStyles();

  const toggleBrand = (brand: string) =>
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );

  const toggleStyle = (style: string) =>
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );

  const filteredProducts = (() => {
    let results = [...partnerProducts];

    if (debouncedSearch) {
      results = results.filter((p) => p.name.toLowerCase().includes(debouncedSearch.toLowerCase()));
    }
    if (selectedBrands.length > 0) {
      results = results.filter((p) => selectedBrands.includes(p.brand));
    }
    if (selectedStyles.length > 0) {
      results = results.filter((p) => selectedStyles.includes(p.style));
    }

    const minVal = debouncedMin ? parseInt(debouncedMin, 10) : 0;
    const maxVal = debouncedMax ? parseInt(debouncedMax, 10) : Infinity;
    if (minVal > 0 || maxVal < Infinity) {
      results = results.filter((p) => p.estimatedPrice >= minVal && p.estimatedPrice <= maxVal);
    }

    switch (sortBy) {
      case 'price-asc':
        results.sort((a, b) => a.estimatedPrice - b.estimatedPrice);
        break;
      case 'price-desc':
        results.sort((a, b) => b.estimatedPrice - a.estimatedPrice);
        break;
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    return results;
  })();

  const hasActiveFilters =
    selectedBrands.length > 0 ||
    selectedStyles.length > 0 ||
    searchQuery !== '' ||
    priceMin ||
    priceMax;

  const clearAllFilters = () => {
    setSelectedBrands([]);
    setSelectedStyles([]);
    setSearchQuery('');
    setPriceMin('');
    setPriceMax('');
  };

  const FiltersContent = (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Tìm sản phẩm đối tác..."
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
                className="border-border accent-brand text-brand h-4 w-4 rounded"
              />
              {brand}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-foreground mb-3 text-sm font-bold">Phong cách</h3>
        <div className="flex flex-col gap-2">
          {allStyles.map((style) => (
            <label
              key={style}
              className="text-foreground/80 hover:text-foreground flex cursor-pointer items-center gap-2.5 text-sm transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedStyles.includes(style)}
                onChange={() => toggleStyle(style)}
                className="border-border accent-brand text-brand h-4 w-4 rounded"
              />
              {style}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-foreground mb-3 text-sm font-bold">Khoảng giá</h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Từ"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="h-9 text-xs"
          />
          <span className="text-muted-foreground text-xs">—</span>
          <Input
            type="number"
            placeholder="Đến"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="h-9 text-xs"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="text-accent hover:text-accent/80 text-left text-xs font-semibold transition-colors"
        >
          Xóa tất cả bộ lọc
        </button>
      )}
    </div>
  );

  return (
    <>
      <section className="from-primary via-primary/90 to-brand relative overflow-hidden bg-gradient-to-br py-16 lg:py-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NCAwLTE4IDguMDYtMTggMThzOC4wNiAxOCAxOCAxOCAxOC04LjA2IDE4LTE4cy04LjA2LTE4LTE4LTE4em0wIDMwYy02LjYzIDAtMTItNS4zNy0xMi0xMnM1LjM3LTEyIDEyLTEyIDEyIDUuMzcgMTIgMTItNS4zNyAxMi0xMiAxMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        <div className="container-custom relative text-center">
          <div className="bg-warning/20 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
            <Sparkles className="text-warning h-7 w-7" />
          </div>
          <h1 className="text-primary-foreground mb-4 text-3xl font-extrabold md:text-5xl">
            Exclusive Partner Collections
          </h1>
          <p className="text-primary-foreground/70 mx-auto max-w-2xl text-lg">
            Order on Demand — Đặt hàng theo yêu cầu từ các thương hiệu đối tác quốc tế. Giá và thời
            gian giao hàng sẽ được Staff xác nhận sau khi bạn gửi yêu cầu.
          </p>
        </div>
      </section>

      <div className="container-custom py-8 lg:py-12">
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
                {filteredProducts.length} sản phẩm đối tác
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
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <PartnerProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="border-border bg-card flex flex-col items-center justify-center rounded-xl border py-20 text-center">
                <p className="text-foreground mb-2 text-lg font-semibold">
                  Không tìm thấy sản phẩm
                </p>
                <p className="text-muted-foreground text-sm">
                  Hãy thử thay đổi bộ lọc để xem thêm kết quả.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

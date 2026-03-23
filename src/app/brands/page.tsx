'use client';

import { useState } from 'react';
import { SlidersHorizontal, ChevronDown, Search, X, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/lib/hooks/useDebounce';

import { partnerProducts, getPartnerNames } from '@/lib/partnerMockData';
import PartnerProductCard from '@/components/custom/PartnerProductCard';

const SORT_OPTIONS = [
  { value: 'popular', label: 'Popular' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'rating', label: 'Top Rated' },
];

type SortValue = (typeof SORT_OPTIONS)[number]['value'];

export default function BrandsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const [selectedPartners, setSelectedPartners] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const debouncedMin = useDebounce(priceMin, 500);
  const debouncedMax = useDebounce(priceMax, 500);
  const [sortBy, setSortBy] = useState<SortValue>('popular');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const allPartnerNames = getPartnerNames();

  const togglePartner = (partnerName: string) =>
    setSelectedPartners((prev) =>
      prev.includes(partnerName) ? prev.filter((p) => p !== partnerName) : [...prev, partnerName]
    );

  const filteredProducts = (() => {
    let results = [...partnerProducts];

    if (debouncedSearch) {
      results = results.filter((p) => p.name.toLowerCase().includes(debouncedSearch.toLowerCase()));
    }
    if (selectedPartners.length > 0) {
      results = results.filter((p) => selectedPartners.includes(p.partner.name));
    }

    const minVal = debouncedMin ? parseInt(debouncedMin, 10) : 0;
    const maxVal = debouncedMax ? parseInt(debouncedMax, 10) : Infinity;
    if (minVal > 0 || maxVal < Infinity) {
      results = results.filter((p) => p.referencePrice >= minVal && p.referencePrice <= maxVal);
    }

    switch (sortBy) {
      case 'price-asc':
        results.sort((a, b) => a.referencePrice - b.referencePrice);
        break;
      case 'price-desc':
        results.sort((a, b) => b.referencePrice - a.referencePrice);
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
    selectedPartners.length > 0 || searchQuery !== '' || priceMin || priceMax;

  const clearAllFilters = () => {
    setSelectedPartners([]);
    setSearchQuery('');
    setPriceMin('');
    setPriceMax('');
  };

  const FiltersContent = (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search partner products..."
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
        <h3 className="text-foreground mb-3 text-sm font-bold">Partner</h3>
        <div className="flex flex-col gap-2">
          {allPartnerNames.map((name) => (
            <label
              key={name}
              className="text-foreground/80 hover:text-foreground flex cursor-pointer items-center gap-2.5 text-sm transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedPartners.includes(name)}
                onChange={() => togglePartner(name)}
                className="border-border text-warning accent-warning h-4 w-4 rounded"
              />
              {name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-foreground mb-3 text-sm font-bold">Price Range</h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="h-9 text-sm"
          />
          <span className="text-muted-foreground text-xs">—</span>
          <Input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="h-9 text-sm"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="text-warning hover:text-warning/80 justify-start text-left text-xs font-semibold transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="container-custom py-8 lg:py-12">
      <div className="mb-8 flex items-center gap-3">
        <Sparkles className="text-warning h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">Partner Products</h1>
          <p className="text-muted-foreground">
            Premium models from international brands — made to order.
          </p>
        </div>
      </div>

      <div className="flex gap-8">
        <aside className="hidden w-[250px] shrink-0 lg:block">
          <div className="border-warning/20 bg-card sticky top-20 rounded-xl border p-5">
            <h2 className="text-foreground mb-4 text-base font-bold">Filters</h2>
            {FiltersContent}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="border-warning/20 bg-card mb-6 flex items-center justify-between rounded-xl border px-4 py-3">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="text-foreground flex items-center gap-2 text-sm font-medium lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>

            <span className="text-muted-foreground hidden text-sm lg:block">
              {filteredProducts.length} products
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
            <div className="animate-slide-up border-warning/20 bg-card mb-6 rounded-xl border p-5 lg:hidden">
              {FiltersContent}
            </div>
          )}

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <PartnerProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="border-border bg-card flex flex-col items-center justify-center rounded-xl border py-20 text-center">
              <p className="text-foreground mb-2 text-lg font-semibold">No products found</p>
              <p className="text-muted-foreground text-sm">
                Try changing your filters to see more results.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

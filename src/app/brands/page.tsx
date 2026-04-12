'use client';

import { useMemo, useState } from 'react';
import {
  Search,
  X,
  Loader2,
  PackageX,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { useDebounce } from '@/lib/hooks/useDebounce';
import PartnerProductCard from '@/components/custom/PartnerProductCard';

import { useGetPartnerProductsQuery } from '@/lib/api/endpoints/partnerProductApi';
import { useGetPartnersQuery } from '@/lib/api/endpoints/partnerApi';
import { useGetImportServiceConfigsSelectQuery } from '@/lib/api/endpoints/importServiceConfigApi';

const PAGE_SIZE = 15;

type Filters = {
  partnerId: string;
  configId: string;
};

const EMPTY_FILTERS: Filters = {
  partnerId: '',
  configId: '',
};

function FilterSection({
  label,
  options,
  activeValue,
  onSelect,
}: {
  label: string;
  options: { label: string; value: string }[];
  activeValue: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <div className="space-y-0.5">
        {options.map((opt) => {
          const isActive = activeValue === opt.value;

          return (
            <button
              key={opt.value}
              onClick={() => onSelect(isActive ? '' : opt.value)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-blue-50 font-medium text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span>{opt.label}</span>
              {isActive && <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FilterSidebar({
  filters,
  setFilter,
  clearFilters,
  activeFilterCount,
  partnerOptions,
  configOptions,
}: {
  filters: Filters;
  setFilter: (key: keyof Filters, value: string) => void;
  clearFilters: () => void;
  activeFilterCount: number;
  partnerOptions: { label: string; value: string }[];
  configOptions: { label: string; value: string }[];
}) {
  return (
    <div className="space-y-5">
      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className="w-full text-left text-xs text-slate-400 transition-colors hover:text-red-500"
        >
          Clear all filters
        </button>
      )}

      <FilterSection
        label="Partner"
        options={partnerOptions}
        activeValue={filters.partnerId}
        onSelect={(value) => setFilter('partnerId', value)}
      />

      <div className="h-px bg-slate-100" />

      <FilterSection
        label="Country"
        options={configOptions}
        activeValue={filters.configId}
        onSelect={(value) => setFilter('configId', value)}
      />
    </div>
  );
}

export default function BrandsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const {
    data: productResponse,
    isLoading: productsLoading,
    isFetching: productsFetching,
    isError,
  } = useGetPartnerProductsQuery({
    pageNumber: 1,
    pageSize: 200,
    searchTerm: debouncedSearch || undefined,
    ascending: true,
  });

  const { data: partnerResponse, isLoading: partnersLoading } = useGetPartnersQuery({
    pageNumber: 1,
    pageSize: 100,
    ascending: true,
  });

  const { data: configResponse, isLoading: configsLoading } =
    useGetImportServiceConfigsSelectQuery();

  const allProducts = productResponse?.items ?? [];
  const allPartners = partnerResponse?.items ?? [];
  const allConfigs = configResponse ?? [];

  const partnerMap = useMemo(() => {
    return new Map(allPartners.map((item) => [item.id, item]));
  }, [allPartners]);

  const configMap = useMemo(() => {
    return new Map(allConfigs.map((item) => [item.id, item]));
  }, [allConfigs]);

  const partnerOptions = useMemo(
    () => allPartners.map((item) => ({ label: item.name, value: item.id })),
    [allPartners]
  );

  const configOptions = useMemo(
    () => allConfigs.map((item) => ({ label: item.countryName, value: item.id })),
    [allConfigs]
  );

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const partner = partnerMap.get(product.partnerId);
      if (!partner) return false;

      const matchPartner = !filters.partnerId || product.partnerId === filters.partnerId;
      const matchConfig =
        !filters.configId || partner.importServiceConfigId === filters.configId;

      return matchPartner && matchConfig;
    });
  }, [allProducts, partnerMap, filters]);

  const totalCount = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const currentProducts = useMemo(() => {
    const start = (pageNumber - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, pageNumber]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const isLoading = productsLoading || partnersLoading || configsLoading;
  const isFetching = productsFetching;

  const setFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPageNumber(1);
  };

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setPageNumber(1);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPageNumber(1);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPaginationItems = () => {
    const delta = 1;
    const range = [];

    for (
      let i = Math.max(2, pageNumber - delta);
      i <= Math.min(totalPages - 1, pageNumber + delta);
      i++
    ) {
      range.push(i);
    }

    if (pageNumber - delta > 2) range.unshift('...');
    if (pageNumber + delta < totalPages - 1) range.push('...');

    range.unshift(1);
    if (totalPages !== 1) range.push(totalPages);

    return range;
  };

  const sidebarProps = {
    filters,
    setFilter,
    clearFilters,
    activeFilterCount,
    partnerOptions,
    configOptions,
  };

  return (
    <div className="relative min-h-screen bg-[#f4f7f9] pb-20">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <div className="relative mb-6 overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-sm md:p-12 lg:p-14">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-50 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-100/50 blur-3xl" />

          <div className="relative mb-10 max-w-3xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              Premium Partner Collections
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-blue-800 md:text-5xl">
              Browse Partner Shop
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Discover imported partner products with the same shopping experience as our in-stock
              collection.
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search for your favorite models..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="h-14 rounded-2xl border-slate-200 bg-slate-50 pl-12 pr-12 text-base transition-all focus-visible:border-blue-400 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:ring-offset-0"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearch('')}
                className="absolute inset-y-0 right-0 flex items-center pr-5 text-slate-400 transition-colors hover:text-blue-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-2 px-1">
            {filters.partnerId && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
                {partnerMap.get(filters.partnerId)?.name}
                <button
                  onClick={() => setFilter('partnerId', '')}
                  className="rounded-full p-0.5 transition-colors hover:bg-blue-100 hover:text-blue-500"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}

            {filters.configId && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
                {configMap.get(filters.configId)?.countryName}
                <button
                  onClick={() => setFilter('configId', '')}
                  className="rounded-full p-0.5 transition-colors hover:bg-blue-100 hover:text-blue-500"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}

            <button
              onClick={clearFilters}
              className="px-2 text-sm text-slate-400 underline underline-offset-2 transition-colors hover:text-red-500"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-8">
          <aside className="hidden w-56 flex-shrink-0 self-start lg:block">
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                Filter by
              </p>
              <FilterSidebar {...sidebarProps} />
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className={`mb-4 flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-all lg:hidden ${
                showFilters || activeFilterCount > 0
                  ? 'border-blue-200 bg-blue-50 font-medium text-blue-700'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {showFilters && (
              <div className="mb-6 rounded-2xl border border-blue-100 bg-white p-5 lg:hidden">
                <FilterSidebar {...sidebarProps} />
              </div>
            )}

            <div className="mb-5 flex items-center justify-between px-1">
              <span className="text-sm text-slate-500">
                {isLoading ? (
                  'Loading models...'
                ) : (
                  <>
                    Showing <strong className="text-blue-800">{currentProducts.length}</strong> of{' '}
                    <strong className="text-blue-800">{totalCount}</strong> products
                  </>
                )}
              </span>

              {isFetching && !isLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              )}
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <Loader2 className="mb-4 h-10 w-10 animate-spin text-blue-500" />
                <p className="text-slate-500">Loading collections...</p>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-red-100 bg-red-50 py-32 text-center">
                <p className="mb-2 text-lg font-semibold text-red-800">
                  Unable to load partner products.
                </p>
                <p className="text-sm text-red-600">
                  A connection error occurred. Please try again later.
                </p>
              </div>
            ) : currentProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-100 bg-white py-32 text-center shadow-sm">
                <PackageX className="mb-5 h-16 w-16 text-slate-300" />
                <p className="mb-2 text-xl font-bold text-slate-800">No products found</p>
                <p className="max-w-md text-base text-slate-500">
                  {searchQuery
                    ? `We couldn't find any models matching "${searchQuery}". Try using different keywords.`
                    : 'No products match your currently selected filters.'}
                </p>

                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="mt-6 rounded-full bg-blue-50 px-6 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 hover:text-blue-800"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                  {currentProducts.map((product) => {
                    const partner = partnerMap.get(product.partnerId);
                    const config = partner ? configMap.get(partner.importServiceConfigId) : undefined;

                    return (
                      <PartnerProductCard
                        key={product.id}
                        product={product}
                        partnerName={partner?.name}
                        partnerSlug={partner?.slug}
                        countryName={config?.countryName}
                      />
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <div className="mt-14 flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        setPageNumber((prev) => prev - 1);
                        scrollToTop();
                      }}
                      disabled={pageNumber === 1 || isFetching}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-slate-600"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    {getPaginationItems().map((item, index) => {
                      if (item === '...') {
                        return (
                          <span key={`ellipsis-${index}`} className="px-2 text-slate-400">
                            ...
                          </span>
                        );
                      }

                      const pageNum = item as number;
                      const isActive = pageNumber === pageNum;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => {
                            setPageNumber(pageNum);
                            scrollToTop();
                          }}
                          disabled={isFetching}
                          className={`flex h-10 min-w-[2.5rem] items-center justify-center rounded-full text-sm font-semibold transition ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                              : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => {
                        setPageNumber((prev) => prev + 1);
                        scrollToTop();
                      }}
                      disabled={pageNumber === totalPages || isFetching}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-slate-600"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
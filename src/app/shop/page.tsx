'use client';

import { useState, useEffect } from 'react';
import { Search, X, Loader2, PackageX, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useGetProductsQuery } from '@/lib/api/endpoints/productApi';
import {
  useGetTopicsQuery,
  useGetMaterialsQuery,
  useGetAssemblyMethodsQuery,
} from '@/lib/api/endpoints/metaData';
import ProductCard from '@/components/custom/ProductCard';
import { AssemblyMethodDto, MaterialDto, TopicDto } from '@/types/api/catalog.types';
import { ProductDto } from '@/types/api';

const PAGE_SIZE = 8;

const DIFFICULTY_OPTIONS = [
  { label: 'Basic', value: 'Basic' },
  { label: 'Intermediate', value: 'Intermediate' },
  { label: 'Advanced', value: 'Advanced' },
];

type Filters = {
  difficultyLevel: string;
  topicSlug: string;
  materialSlug: string;
  assemblyMethodSlug: string;
};

const EMPTY_FILTERS: Filters = {
  difficultyLevel: '',
  topicSlug: '',
  materialSlug: '',
  assemblyMethodSlug: '',
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function FilterSection({
  label,
  filterKey,
  options,
  filters,
  setFilter,
}: {
  label: string;
  filterKey: keyof Filters;
  options: { label: string; value: string }[];
  filters: Filters;
  setFilter: (key: keyof Filters, value: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">{label}</p>
      <div className="space-y-0.5">
        {options.map((opt) => {
          const isActive = filters[filterKey] === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setFilter(filterKey, opt.value)}
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
  topics,
  materials,
  assemblyMethods,
}: {
  filters: Filters;
  setFilter: (key: keyof Filters, value: string) => void;
  clearFilters: () => void;
  activeFilterCount: number;
  topics: TopicDto[];
  materials: MaterialDto[];
  assemblyMethods: AssemblyMethodDto[];
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
        label="Difficulty"
        filterKey="difficultyLevel"
        options={DIFFICULTY_OPTIONS}
        filters={filters}
        setFilter={setFilter}
      />

      <div className="h-px bg-slate-100" />

      <FilterSection
        label="Topic"
        filterKey="topicSlug"
        options={topics.map((t) => ({ label: t.name, value: t.slug }))}
        filters={filters}
        setFilter={setFilter}
      />

      <div className="h-px bg-slate-100" />

      <FilterSection
        label="Material"
        filterKey="materialSlug"
        options={materials.map((m) => ({ label: m.name, value: m.slug }))}
        filters={filters}
        setFilter={setFilter}
      />

      <div className="h-px bg-slate-100" />

      <FilterSection
        label="Assembly"
        filterKey="assemblyMethodSlug"
        options={assemblyMethods.map((a) => ({ label: a.name, value: a.slug }))}
        filters={filters}
        setFilter={setFilter}
      />
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [accumulatedProducts, setAccumulatedProducts] = useState<ProductDto[]>([]);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data, isLoading, isError, isFetching } = useGetProductsQuery(
    {
      pageNumber,
      pageSize: PAGE_SIZE,
      searchTerm: debouncedSearch || undefined,
      difficultyLevel: filters.difficultyLevel || undefined,
      topicSlug: filters.topicSlug || undefined,
      materialSlug: filters.materialSlug || undefined,
      assemblyMethodSlug: filters.assemblyMethodSlug || undefined,
      isActive: true,
    },
    { refetchOnMountOrArgChange: true }
  );

  const { data: topicsData } = useGetTopicsQuery({ pageNumber: 1, pageSize: 100 });
  const { data: materialsData } = useGetMaterialsQuery({ pageNumber: 1, pageSize: 100 });
  const { data: assemblyMethodsData } = useGetAssemblyMethodsQuery({
    pageNumber: 1,
    pageSize: 100,
  });

  const topics = topicsData?.items ?? [];
  const materials = materialsData?.items ?? [];
  const assemblyMethods = assemblyMethodsData?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const hasNextPage = data?.hasNextPage ?? false;

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  // Accumulate products for Load More
  useEffect(() => {
    if (data?.items) {
      if (pageNumber === 1) {
        setAccumulatedProducts(data.items);
      } else {
        setAccumulatedProducts((prev) => {
          const newItems = data.items.filter(
            (newItem: ProductDto) => !prev.some((p) => p.id === newItem.id)
          );
          return [...prev, ...newItems];
        });
      }
    }
  }, [data, pageNumber]);

  const setFilter = (key: keyof Filters, value: string) => {
    setFilters((f) => ({ ...f, [key]: f[key] === value ? '' : value }));
    setPageNumber(1);
    setAccumulatedProducts([]);
  };

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setPageNumber(1);
    setAccumulatedProducts([]);
  };

  const handleSearch = (val: string) => {
    setSearchQuery(val);
    setPageNumber(1);
    setAccumulatedProducts([]);
  };

  const getFilterLabel = (key: keyof Filters, val: string) => {
    if (key === 'difficultyLevel') return val;
    if (key === 'topicSlug') return topics.find((t: TopicDto) => t.slug === val)?.name || val;
    if (key === 'materialSlug')
      return materials.find((m: MaterialDto) => m.slug === val)?.name || val;
    if (key === 'assemblyMethodSlug')
      return assemblyMethods.find((a: AssemblyMethodDto) => a.slug === val)?.name || val;
    return val;
  };

  const sidebarProps = {
    filters,
    setFilter,
    clearFilters,
    activeFilterCount,
    topics,
    materials,
    assemblyMethods,
  };

  return (
    <div className="min-h-screen bg-[#f4f7f9] pb-20">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        {/* ── HEADER & SEARCH ── */}
        <div className="relative mb-6 overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-sm md:p-12 lg:p-14">
          <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-blue-50 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-100/50 blur-3xl" />

          <div className="relative mb-10 max-w-3xl">
            <p className="mb-3 text-xs font-bold tracking-[0.2em] text-blue-600 uppercase">
              Premium 3D Model Collections
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-blue-800 md:text-5xl">
              Browse Model Shop
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Discover meticulously detailed 3D assembly models — from beginner to advanced builds.
              Find your next masterpiece.
            </p>
          </div>

          <div className="relative">
            <Search className="absolute top-1/2 left-5 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search for your favorite models..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="h-14 rounded-2xl border-slate-200 bg-slate-50 pr-12 pl-12 text-base transition-all focus-visible:border-blue-400 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:ring-offset-0"
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

        {/* ── ACTIVE FILTER CHIPS — always visible ── */}
        {activeFilterCount > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-2 px-1">
            {(Object.keys(filters) as Array<keyof Filters>).map((key) => {
              if (!filters[key]) return null;
              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
                >
                  {getFilterLabel(key, filters[key])}
                  <button
                    onClick={() => setFilter(key, filters[key])}
                    className="rounded-full p-0.5 transition-colors hover:bg-blue-100 hover:text-blue-500"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              );
            })}
            <button
              onClick={clearFilters}
              className="px-2 text-sm text-slate-400 underline underline-offset-2 transition-colors hover:text-red-500"
            >
              Clear all
            </button>
          </div>
        )}

        {/* ── LAYOUT: Sidebar + Main ── */}
        <div className="flex items-start gap-8">
          {/* ── STICKY SIDEBAR (Desktop only) ── */}
          <aside className="hidden w-56 flex-shrink-0 lg:block">
            <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <p className="mb-4 text-xs font-bold tracking-widest text-slate-400 uppercase">
                Filter by
              </p>
              <FilterSidebar {...sidebarProps} />
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <div className="min-w-0 flex-1">
            {/* Mobile: filter toggle button */}
            <button
              onClick={() => setShowFilters((v) => !v)}
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

            {/* Mobile: inline filter panel */}
            {showFilters && (
              <div className="mb-6 rounded-2xl border border-blue-100 bg-white p-5 lg:hidden">
                <FilterSidebar {...sidebarProps} />
              </div>
            )}

            {/* Result count */}
            <div className="mb-5 flex items-center justify-between px-1">
              <span className="text-sm text-slate-500">
                {isLoading && pageNumber === 1 ? (
                  'Loading models...'
                ) : (
                  <>
                    Showing <strong className="text-blue-800">{accumulatedProducts.length}</strong>{' '}
                    of <strong className="text-blue-800">{totalCount}</strong> products
                  </>
                )}
              </span>
              {isFetching && !isLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              )}
            </div>

            {/* ── Content states ── */}
            {isLoading && pageNumber === 1 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <Loader2 className="mb-4 h-10 w-10 animate-spin text-blue-500" />
                <p className="text-slate-500">Loading collections...</p>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-red-100 bg-red-50 py-32 text-center">
                <p className="mb-2 text-lg font-semibold text-red-800">Unable to load products.</p>
                <p className="text-sm text-red-600">
                  A connection error occurred. Please try again later.
                </p>
              </div>
            ) : accumulatedProducts.length === 0 ? (
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
                {/* Product grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {accumulatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Load More */}
                {hasNextPage && (
                  <div className="mt-14 flex items-center justify-center">
                    <button
                      onClick={() => setPageNumber((p) => p + 1)}
                      disabled={isFetching}
                      className="group flex h-14 items-center gap-2 rounded-full border-2 border-blue-950 bg-white px-10 text-base font-bold text-blue-950 transition-all hover:bg-blue-950 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-blue-950"
                    >
                      {isFetching ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          Load More
                          <ChevronDown className="h-5 w-5 transition group-hover:translate-y-1" />
                        </>
                      )}
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

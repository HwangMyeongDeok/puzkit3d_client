'use client';

import { useState } from 'react';
import {
  Search,
  X,
  Loader2,
  PackageX,
  SlidersHorizontal,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
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

// Set cứng 15 sản phẩm 1 trang (3 cột x 5 hàng)
const PAGE_SIZE = 15;

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

  // Lấy data hiện tại cho trang này
  const currentProducts = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setFilter = (key: keyof Filters, value: string) => {
    setFilters((f) => ({ ...f, [key]: f[key] === value ? '' : value }));
    setPageNumber(1); // Reset về trang 1 khi đổi filter
  };

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setPageNumber(1);
  };

  const handleSearch = (val: string) => {
    setSearchQuery(val);
    setPageNumber(1);
  };

  // Helper để sinh mảng trang (có chứa "..." nếu quá nhiều trang)
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
    <div className="relative min-h-screen bg-[#f4f7f9] pb-20">
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

        {/* ── ACTIVE FILTER CHIPS ── */}
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
        <div className="flex gap-8">
          {/* ── SIDEBAR (Desktop only) ── */}
          <aside className="hidden w-56 flex-shrink-0 self-start lg:block">
            <div>
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

            {/* ── Content states ── */}
            {isLoading ? (
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
                {/* Product grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                  {currentProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* ── PAGINATION CONTROLS ── */}
                {totalPages > 1 && (
                  <div className="mt-14 flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        setPageNumber((p) => p - 1);
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
                        setPageNumber((p) => p + 1);
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

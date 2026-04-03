'use client';

import { useState, useEffect } from 'react';
import { Loader2, Filter, X } from 'lucide-react';

import { useGetProductsQuery } from '@/lib/api/endpoints/productApi';
import {
  useGetMaterialsQuery,
  useGetAssemblyMethodsQuery,
  useGetTopicsQuery,
  useGetCapabilitiesQuery,
} from '@/lib/api/endpoints/metaData';
import ProductCard from '@/components/custom/ProductCard';

const DIFFICULTIES = ['Basic', 'Intermediate', 'Advanced'];

const DIFFICULTY_COLORS: Record<string, string> = {
  Basic: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Intermediate: 'bg-amber-100 text-amber-700 border-amber-200',
  Advanced: 'bg-rose-100 text-rose-700 border-rose-200',
};

export default function ProductShowcaseInteractive() {
  const [visibleCount, setVisibleCount] = useState(8);

  const [difficultyLevel, setDifficultyLevel] = useState<string>('');
  const [materialSlug, setMaterialSlug] = useState<string>('');
  const [assemblyMethodSlug, setAssemblyMethodSlug] = useState<string>('');
  const [topicSlug, setTopicSlug] = useState<string>('');
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);

  useEffect(() => {
    setVisibleCount(8);
  }, [difficultyLevel, materialSlug, assemblyMethodSlug, topicSlug, selectedCapabilities]);

  const { data: materialsData } = useGetMaterialsQuery({ pageNumber: 1, pageSize: 50 });
  const { data: assemblyData } = useGetAssemblyMethodsQuery({ pageNumber: 1, pageSize: 50 });
  const { data: topicsData } = useGetTopicsQuery({ pageNumber: 1, pageSize: 50 });
  const { data: capabilitiesData } = useGetCapabilitiesQuery({ pageNumber: 1, pageSize: 50 });

  const capabilitySlugs =
    selectedCapabilities.length > 0 ? selectedCapabilities.join(',') : undefined;

  const { data, isLoading, isFetching, isError } = useGetProductsQuery({
    pageNumber: 1,
    pageSize: visibleCount,
    isActive: true,
    ...(difficultyLevel && { difficultyLevel }),
    ...(materialSlug && { materialSlug }),
    ...(assemblyMethodSlug && { assemblyMethodSlug }),
    ...(topicSlug && { topicSlug }),
    ...(capabilitySlugs && { capabilitySlugs }),
  });

  const products = data?.items ?? [];
  const hasMore = products.length === visibleCount;

  const handleClearFilters = () => {
    setDifficultyLevel('');
    setMaterialSlug('');
    setAssemblyMethodSlug('');
    setTopicSlug('');
    setSelectedCapabilities([]);
  };

  const handleToggleCapability = (slug: string) => {
    setSelectedCapabilities((prev) =>
      prev.includes(slug) ? prev.filter((item) => item !== slug) : [...prev, slug]
    );
  };

  const hasActiveFilters =
    difficultyLevel ||
    materialSlug ||
    assemblyMethodSlug ||
    topicSlug ||
    selectedCapabilities.length > 0;

  return (
    <>
      {/* ================= SIDEBAR: FILTER ================= */}
      <aside className="custom-scrollbar max-h-[calc(100vh-100px)] w-full shrink-0 flex-col gap-6 overflow-y-auto pr-2 md:sticky md:top-24 md:flex md:w-[260px]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="sticky top-0 z-10 mb-4 flex items-center justify-between border-b border-slate-100 bg-white pb-4">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
              <Filter className="h-5 w-5" /> Filters
            </h3>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-xs font-semibold text-rose-500 hover:text-rose-600 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Lọc: Độ khó */}
          <div className="mb-6">
            <h4 className="mb-3 text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Difficulty Level
            </h4>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTIES.map((level) => {
                const isSelected = difficultyLevel === level;
                return (
                  <label
                    key={level}
                    className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold transition-all ${isSelected ? DIFFICULTY_COLORS[level] + ' ring-2 ring-slate-300 ring-offset-1' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'} `}
                  >
                    <input
                      type="radio"
                      name="difficulty"
                      className="hidden"
                      checked={isSelected}
                      onChange={() => setDifficultyLevel(level)}
                    />
                    {level}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Lọc: Chủ đề (Topic) */}
          <div className="mb-6">
            <h4 className="mb-3 text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Topic
            </h4>
            <div className="flex flex-col gap-2.5">
              {topicsData?.items?.map((topic: any) => (
                <label key={topic.id} className="flex cursor-pointer items-center gap-3">
                  <input
                    type="radio"
                    name="topic"
                    className="h-4 w-4 text-[#e51636] focus:ring-[#e51636]"
                    checked={topicSlug === topic.slug}
                    onChange={() => setTopicSlug(topic.slug)}
                  />
                  <span className="text-sm font-medium text-slate-700">{topic.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Lọc: Vật liệu (Material) */}
          <div className="mb-6">
            <h4 className="mb-3 text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Material
            </h4>
            <div className="flex flex-col gap-2.5">
              {materialsData?.items?.map((material: any) => (
                <label key={material.id} className="flex cursor-pointer items-center gap-3">
                  <input
                    type="radio"
                    name="material"
                    className="h-4 w-4 text-[#e51636] focus:ring-[#e51636]"
                    checked={materialSlug === material.slug}
                    onChange={() => setMaterialSlug(material.slug)}
                  />
                  <span className="text-sm font-medium text-slate-700">{material.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Lọc: Cách lắp ráp (Assembly Method) */}
          <div className="mb-6">
            <h4 className="mb-3 text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Assembly Method
            </h4>
            <div className="flex flex-col gap-2.5">
              {assemblyData?.items?.map((method: any) => (
                <label key={method.id} className="flex cursor-pointer items-center gap-3">
                  <input
                    type="radio"
                    name="assembly"
                    className="h-4 w-4 text-[#e51636] focus:ring-[#e51636]"
                    checked={assemblyMethodSlug === method.slug}
                    onChange={() => setAssemblyMethodSlug(method.slug)}
                  />
                  <span className="text-sm font-medium text-slate-700">{method.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Lọc: Capabilities */}
          <div>
            <h4 className="mb-3 text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Capabilities
            </h4>
            <div className="flex flex-col gap-2.5">
              {capabilitiesData?.items?.map((cap: any) => (
                <label key={cap.id} className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-[#e51636] focus:ring-[#e51636]"
                    checked={selectedCapabilities.includes(cap.slug)}
                    onChange={() => handleToggleCapability(cap.slug)}
                  />
                  <span className="text-sm font-medium text-slate-700">{cap.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* ================= MAIN: PRODUCTS GRID ================= */}
      <div className="w-full flex-1">
        {isLoading && products.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#e51636]" />
          </div>
        ) : isError ? (
          <div className="py-10 text-center text-slate-500">Failed to load products.</div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-20 text-center">
            <X className="mb-2 h-10 w-10 text-slate-300" />
            <h3 className="text-lg font-bold text-slate-700">No products found</h3>
            <p className="mt-1 text-sm text-slate-500">Try adjusting your filters.</p>
            <button
              onClick={handleClearFilters}
              className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="flex w-full flex-col items-center">
            <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
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
                  {isFetching ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <span>Load More</span>
                  )}
                  <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

'use client';

import { Package, Scale, Clock, Bookmark, Layers, Wrench, Zap } from 'lucide-react';
import { skipToken } from '@reduxjs/toolkit/query';

// Sửa lại import API theo đúng đường dẫn của ông nhé
import {
  useGetMaterialByIdQuery,
  useGetTopicByIdQuery,
  useGetAssemblyMethodByIdQuery,
  useGetCapabilityByIdQuery,
} from '@/lib/api/endpoints/metaData';

// Component nhỏ render từng capability
function CapabilityTag({ id }: { id: string }) {
  const { data, isLoading } = useGetCapabilityByIdQuery(id);
  if (isLoading)
    return (
      <span className="animate-pulse rounded bg-slate-200 px-2 py-1 text-xs text-transparent">
        Loading...
      </span>
    );
  if (!data) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-600">
      <Zap className="h-3 w-3" /> {data.name}
    </span>
  );
}

interface ProductSpecificationsProps {
  product: any; // Thay bằng type Product của ông cho chuẩn nhé
}

export default function ProductSpecifications({ product }: ProductSpecificationsProps) {
  // Đem các hook metadata xuống đây
  const { data: material } = useGetMaterialByIdQuery(product.materialId ?? skipToken);
  const { data: topic } = useGetTopicByIdQuery(product.topicId ?? skipToken);
  const { data: assemblyMethod } = useGetAssemblyMethodByIdQuery(
    product.assemblyMethodId ?? skipToken
  );

  return (
    <section>
      <h3 className="mb-4 flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
        <span className="h-6 w-1 rounded-full bg-[#052a5b]"></span>
        Full Specifications
      </h3>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {/* Mảnh ghép */}
        {product.totalPieceCount && (
          <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm">
            <Package className="mb-1 h-6 w-6 text-[#052a5b]" />
            <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
              Pieces
            </span>
            <span className="text-lg font-black text-slate-900">{product.totalPieceCount}</span>
          </div>
        )}

        {/* Độ khó */}
        {product.difficultLevel && (
          <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm">
            <Scale className="mb-1 h-6 w-6 text-[#e51636]" />
            <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
              Difficulty
            </span>
            <span className="text-lg font-black text-slate-900">{product.difficultLevel}</span>
          </div>
        )}

        {/* Thời gian */}
        {product.estimatedBuildTime && (
          <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm">
            <Clock className="mb-1 h-6 w-6 text-emerald-600" />
            <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
              Build Time
            </span>
            <span className="text-lg font-black text-slate-900">
              {product.estimatedBuildTime} <span className="text-xs">mins</span>
            </span>
          </div>
        )}

        {/* Topic */}
        {product.topicId && (
          <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm">
            <Bookmark className="mb-1 h-6 w-6 text-blue-500" />
            <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
              Topic
            </span>
            <span className="text-sm font-bold text-slate-900">{topic?.name || 'Loading...'}</span>
          </div>
        )}

        {/* Material */}
        {product.materialId && (
          <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm">
            <Layers className="mb-1 h-6 w-6 text-amber-600" />
            <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
              Material
            </span>
            <span className="text-sm font-bold text-slate-900">
              {material?.name || 'Loading...'}
            </span>
          </div>
        )}

        {/* Assembly Method */}
        {product.assemblyMethodId && (
          <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm">
            <Wrench className="mb-1 h-6 w-6 text-purple-600" />
            <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
              Assembly
            </span>
            <span className="text-sm font-bold text-balance text-slate-900">
              {assemblyMethod?.name || 'Loading...'}
            </span>
          </div>
        )}
      </div>

      {/* Capabilities */}
      {product.capabilityIds && product.capabilityIds.length > 0 && (
        <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
            Capabilities
          </span>
          <div className="flex flex-wrap gap-2">
            {product.capabilityIds.map((capId: string) => (
              <CapabilityTag key={capId} id={capId} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

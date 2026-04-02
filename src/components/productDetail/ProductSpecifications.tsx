'use client';

import { Package, Scale, Clock, Bookmark, Layers, Wrench, Zap, Loader2 } from 'lucide-react';
import { skipToken } from '@reduxjs/toolkit/query';

// Sửa lại import API theo đúng đường dẫn của ông nhé
import {
  useGetMaterialByIdQuery,
  useGetTopicByIdQuery,
  useGetAssemblyMethodByIdQuery,
  useGetCapabilitiesQuery, // 👉 Dùng hook lấy danh sách này
} from '@/lib/api/endpoints/metaData';
import { CapabilityDto } from '@/types/api/capability.types';

interface ProductSpecificationsProps {
  product: any; // Thay bằng type Product của ông cho chuẩn nhé
}

export default function ProductSpecifications({ product }: ProductSpecificationsProps) {
  // 1. Hook metadata cơ bản
  const { data: material } = useGetMaterialByIdQuery(product.materialId ?? skipToken);
  const { data: topic } = useGetTopicByIdQuery(product.topicId ?? skipToken);
  const { data: assemblyMethod } = useGetAssemblyMethodByIdQuery(
    product.assemblyMethodId ?? skipToken
  );

  // 2. Gọi API lấy toàn bộ danh sách capabilities
  // Vì đây là master data ít thay đổi, ta set pageSize lớn (ví dụ 100) để hốt trọn danh sách về luôn
  const { data: allCapabilities, isLoading: isCapsLoading } = useGetCapabilitiesQuery({
    pageNumber: 1,
    pageSize: 10,
  });

  // 3. Lọc ra các capability mà sản phẩm này đang sở hữu
  const capabilityList = allCapabilities?.items || [];

  const productCapabilities = capabilityList.filter((cap: CapabilityDto) =>
    product.capabilityIds?.includes(cap.id)
  );

  return (
    <section>
      <h3 className="mb-4 flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
        <span className="h-6 w-1 rounded-full bg-[#052a5b]"></span>
        Full Specifications
      </h3>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {/* Pieces */}
        {product.totalPieceCount && (
          <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm">
            <Package className="mb-1 h-6 w-6 text-[#052a5b]" />
            <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
              Pieces
            </span>
            <span className="text-lg font-black text-slate-900">{product.totalPieceCount}</span>
          </div>
        )}

        {/* Difficulty */}
        {product.difficultLevel && (
          <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm">
            <Scale className="mb-1 h-6 w-6 text-[#e51636]" />
            <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
              Difficulty
            </span>
            <span className="text-lg font-black text-slate-900">{product.difficultLevel}</span>
          </div>
        )}

        {/* Build Time */}
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
            {isCapsLoading ? (
              // Loading xương cá
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Loader2 className="h-3 w-3 animate-spin" /> Loading capabilities...
              </div>
            ) : productCapabilities.length > 0 ? (
              // Render ra các capability đã map thành công
              productCapabilities.map((cap: CapabilityDto) => (
                <span
                  key={cap.id}
                  className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-600"
                  title={cap.description}
                >
                  <Zap className="h-3 w-3" /> {cap.name}
                </span>
              ))
            ) : (
              // Trường hợp fallback khi mảng rỗng
              <span className="text-xs text-slate-400">No capabilities available</span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

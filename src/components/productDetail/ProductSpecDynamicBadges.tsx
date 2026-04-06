'use client';

import { Bookmark, Layers, Wrench, Zap, Loader2 } from 'lucide-react';
import {
  useGetMaterialByIdQuery,
  useGetTopicByIdQuery,
  useGetAssemblyMethodByIdQuery,
  useGetCapabilitiesQuery,
} from '@/lib/api/endpoints/metaData';
import { CapabilityDto } from '@/types/api/catalog.types';

export function TopicBadge({ topicId }: { topicId: string }) {
  const { data: topic } = useGetTopicByIdQuery(topicId);
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm">
      <Bookmark className="mb-1 h-6 w-6 text-blue-500" />
      <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
        Topic
      </span>
      <span className="text-sm font-bold text-slate-900">{topic?.name || 'Loading...'}</span>
    </div>
  );
}

export function MaterialBadge({ materialId }: { materialId: string }) {
  const { data: material } = useGetMaterialByIdQuery(materialId);
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm">
      <Layers className="mb-1 h-6 w-6 text-amber-600" />
      <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
        Material
      </span>
      <span className="text-sm font-bold text-slate-900">{material?.name || 'Loading...'}</span>
    </div>
  );
}

export function AssemblyBadge({ assemblyMethodId }: { assemblyMethodId: string }) {
  const { data: assemblyMethod } = useGetAssemblyMethodByIdQuery(assemblyMethodId);
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm">
      <Wrench className="mb-1 h-6 w-6 text-purple-600" />
      <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
        Assembly
      </span>
      <span className="text-sm font-bold text-balance text-slate-900">
        {assemblyMethod?.name || 'Loading...'}
      </span>
    </div>
  );
}

export function CapabilitiesList({ capabilityIds }: { capabilityIds: string[] }) {
  const { data: allCapabilities, isLoading: isCapsLoading } = useGetCapabilitiesQuery({
    pageNumber: 1,
    pageSize: 100,
  });

  const capabilityList = allCapabilities?.items || [];
  const productCapabilities = capabilityList.filter((cap: CapabilityDto) =>
    capabilityIds.includes(cap.id)
  );

  if (!capabilityIds || capabilityIds.length === 0) return null;

  return (
    <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
        Capabilities
      </span>
      <div className="flex flex-wrap gap-2">
        {isCapsLoading ? (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Loader2 className="h-3 w-3 animate-spin" /> Loading capabilities...
          </div>
        ) : productCapabilities.length > 0 ? (
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
          <span className="text-xs text-slate-400">No capabilities available</span>
        )}
      </div>
    </div>
  );
}

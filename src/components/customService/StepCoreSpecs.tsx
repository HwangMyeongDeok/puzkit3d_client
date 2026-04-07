'use client';

import { CheckCircle2, Maximize } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ConfiguratorState, DifficultyLevel } from './types';
import { DIFFICULTY_LEVELS } from './types';

import {
  useGetTopicsQuery,
  useGetMaterialsQuery,
  useGetAssemblyMethodsQuery,
  useGetCapabilitiesQuery,
} from '@/lib/api/endpoints/metaData';
import { CustomDesignRequirement } from '@/types/api/requirement.api.type';

interface StepCoreSpecsProps {
  config: ConfiguratorState;
  updateConfig: (updates: Partial<ConfiguratorState>) => void;
  onCapabilityToggle: (id: string) => void;
  requirements: CustomDesignRequirement[];
  isLoadingRequirements: boolean;
}

export default function StepCoreSpecs({
  config,
  updateConfig,
  onCapabilityToggle,
  requirements,
  isLoadingRequirements,
}: StepCoreSpecsProps) {
  // 1. Fetch Dữ liệu thô từ API
  const { data: topicsData, isLoading: isLoadingTopics } = useGetTopicsQuery({
    pageNumber: 1,
    pageSize: 50,
  });
  const topics = topicsData?.items || [];

  const { data: materialsData, isLoading: isLoadingMaterials } = useGetMaterialsQuery(
    { pageNumber: 1, pageSize: 50 },
    { skip: !config.topic }
  );
  const availableMaterials = materialsData?.items || [];

  const { data: assembliesData, isLoading: isLoadingAssemblies } = useGetAssemblyMethodsQuery({
    pageNumber: 1,
    pageSize: 50,
  });
  const assemblies = assembliesData?.items || [];

  const { data: capabilitiesData, isLoading: isLoadingCaps } = useGetCapabilitiesQuery({
    pageNumber: 1,
    pageSize: 50,
  });
  const capabilitiesList = capabilitiesData?.items || [];

  // ----------------------------------------------------------------------
  // ✨ LOGIC LỌC (FUNNEL) DỰA TRÊN DANH SÁCH REQUIREMENTS CÓ SẴN
  // ----------------------------------------------------------------------

  const validTopicIds = Array.from(new Set(requirements.map((r) => r.topicId)));
  const filteredTopics = topics.filter((t: any) => validTopicIds.includes(t.id));

  const validMaterialIds = Array.from(
    new Set(requirements.filter((r) => r.topicId === config.topic).map((r) => r.materialId))
  );
  const filteredMaterials = availableMaterials.filter((m: any) => validMaterialIds.includes(m.id));

  const validAssemblyIds = Array.from(
    new Set(
      requirements
        .filter((r) => r.topicId === config.topic && r.materialId === config.material)
        .map((r) => r.assemblyMethodId)
    )
  );
  const filteredAssemblies = assemblies.filter((a: any) => validAssemblyIds.includes(a.id));

  const validCapabilityIds = Array.from(
    new Set(
      requirements
        .filter(
          (r) =>
            r.topicId === config.topic &&
            r.materialId === config.material &&
            r.assemblyMethodId === config.assembly
        )
        .flatMap((r) => r.capabilityIds || [])
    )
  );
  const filteredCapabilities = capabilitiesList.filter((c: any) =>
    validCapabilityIds.includes(c.id)
  );

  const matchedRequirement = requirements.find(
    (r) =>
      r.topicId === config.topic &&
      r.materialId === config.material &&
      r.assemblyMethodId === config.assembly &&
      r.difficulty === config.difficulty
  );

  const handleDimensionChange = (field: 'length' | 'width' | 'height', value: string) => {
    updateConfig({
      dimensions: { ...config.dimensions, [field]: value },
    });
  };

  if (isLoadingRequirements) {
    return (
      <div className="animate-pulse py-20 text-center font-semibold text-slate-500">
        Loading technical configurations...
      </div>
    );
  }

  return (
    <div className="animate-in fade-in mx-auto max-w-3xl space-y-10 duration-500">
      <div className="space-y-3">
        <h2 className="text-3xl font-extrabold text-[#032a63] md:text-4xl">Core Specifications</h2>
        <p className="text-lg text-slate-600">Define the physical engineering properties.</p>
      </div>

      {/* 1. Topic */}
      <div className="space-y-4">
        <label className="block text-sm font-bold tracking-wider text-slate-400 uppercase">
          1. Topic
        </label>
        {isLoadingTopics ? (
          <div className="text-sm text-slate-500">Loading topics...</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredTopics.map((topic: any) => (
              <button
                key={topic.id}
                onClick={() =>
                  updateConfig({
                    topic: topic.id,
                    material: '',
                    assembly: '',
                    difficulty: undefined,
                    capabilities: [],
                  })
                }
                className={cn(
                  'flex flex-col items-center gap-3 rounded-xl border-2 p-5 transition-all',
                  config.topic === topic.id
                    ? 'border-[#032a63] bg-blue-50 text-[#032a63]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-[#032a63]'
                )}
              >
                <span className="text-center text-sm font-bold">{topic.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Material */}
      {config.topic && (
        <div className="animate-in fade-in slide-in-from-top-4 space-y-4 duration-500">
          <label className="block text-sm font-bold tracking-wider text-slate-400 uppercase">
            2. Available Materials
          </label>
          {isLoadingMaterials ? (
            <div className="text-sm text-slate-500">Loading materials...</div>
          ) : filteredMaterials.length === 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-600">
              Không có vật liệu nào cho Category này.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {filteredMaterials.map((material: any) => (
                <button
                  key={material.id}
                  onClick={() =>
                    updateConfig({
                      material: material.id,
                      assembly: '',
                      difficulty: undefined,
                      capabilities: [],
                    })
                  }
                  className={cn(
                    'rounded-xl border-2 p-4 text-center transition-all',
                    config.material === material.id
                      ? 'border-[#032a63] bg-[#032a63] text-white shadow-md'
                      : 'border-slate-200 bg-white hover:border-[#032a63]'
                  )}
                >
                  <span
                    className={cn(
                      'block text-sm',
                      config.material === material.id ? 'font-bold' : 'font-semibold text-slate-700'
                    )}
                  >
                    {material.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Assembly Method */}
      {config.material && (
        <div className="animate-in fade-in slide-in-from-top-4 space-y-4 duration-500">
          <label className="block text-sm font-bold tracking-wider text-slate-400 uppercase">
            3. Assembly Method
          </label>
          {isLoadingAssemblies ? (
            <div className="text-sm text-slate-500">Loading assemblies...</div>
          ) : filteredAssemblies.length === 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-600">
              Không có phương pháp lắp ráp cho tổ hợp này.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredAssemblies.map((method: any) => (
                <button
                  key={method.id}
                  onClick={() =>
                    updateConfig({ assembly: method.id, difficulty: undefined, capabilities: [] })
                  }
                  className={cn(
                    'rounded-xl border-2 p-4 text-left transition-all',
                    config.assembly === method.id
                      ? 'border-[#032a63] bg-blue-50 font-bold text-[#032a63]'
                      : 'border-slate-200 bg-white font-semibold text-slate-700 hover:border-[#032a63]'
                  )}
                >
                  {method.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Capabilities */}
      {config.assembly && (
        <div className="animate-in fade-in slide-in-from-top-4 space-y-4 duration-500">
          {isLoadingCaps ? (
            <div className="text-sm text-slate-500">Loading capabilities...</div>
          ) : filteredCapabilities.length === 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-600">
              Không có Capabilities nào cho cấu hình này.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filteredCapabilities.map((cap: any) => {
                const isSelected = config.capabilities.includes(cap.id);
                return (
                  <button
                    key={cap.id}
                    onClick={() => onCapabilityToggle(cap.id)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all',
                      isSelected
                        ? 'border-[#032a63] bg-blue-50'
                        : 'border-slate-200 bg-white hover:border-[#032a63]'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded border',
                        isSelected
                          ? 'border-[#032a63] bg-[#032a63]'
                          : 'border-slate-300 bg-slate-50'
                      )}
                    >
                      {isSelected && <CheckCircle2 size={14} className="text-white" />}
                    </div>
                    <span
                      className={cn(
                        'text-sm',
                        isSelected ? 'font-bold text-[#032a63]' : 'font-semibold text-slate-600'
                      )}
                    >
                      {cap.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. Difficulty & Part Count */}
      {config.assembly && (
        <div className="animate-in fade-in slide-in-from-top-4 mt-8 space-y-6 border-t border-slate-200 pt-8 duration-500">
          <label className="block text-sm font-bold tracking-wider text-slate-400 uppercase">
            5. Complexity & Parts Count
          </label>

          <div className="grid grid-cols-2 gap-4">
            {DIFFICULTY_LEVELS.map((level) => {
              const reqForLevel = requirements.find(
                (r) =>
                  r.topicId === config.topic &&
                  r.materialId === config.material &&
                  r.assemblyMethodId === config.assembly &&
                  r.difficulty === level.id
              );

              const isAvailable = !!reqForLevel;

              return (
                <button
                  key={level.id}
                  disabled={!isAvailable}
                  onClick={() => updateConfig({ difficulty: level.id as DifficultyLevel })}
                  className={cn(
                    'flex flex-col items-start rounded-xl border-2 p-4 text-left transition-all',
                    !isAvailable && 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-40',
                    config.difficulty === level.id
                      ? 'border-[#032a63] bg-blue-50 shadow-sm'
                      : isAvailable &&
                          'border-slate-200 bg-white hover:border-[#032a63] hover:bg-slate-50'
                  )}
                >
                  <div className="mb-1 flex w-full items-center justify-between">
                    <span
                      className={cn(
                        'font-bold',
                        config.difficulty === level.id ? 'text-[#032a63]' : 'text-slate-700'
                      )}
                    >
                      {level.id}
                    </span>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-bold',
                        isAvailable ? 'bg-blue-100 text-[#032a63]' : 'bg-slate-200 text-slate-500'
                      )}
                    >
                      {isAvailable
                        ? `${reqForLevel.minPartQuantity} - ${reqForLevel.maxPartQuantity} parts`
                        : 'N/A'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">{level.desc}</span>
                  {!isAvailable && (
                    <span className="mt-2 text-[10px] font-semibold text-red-500">
                      * Không có sẵn cho cấu hình này
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Dimensions */}
      {config.difficulty && (
        <div className="animate-in fade-in slide-in-from-top-4 mt-8 space-y-4 border-t border-slate-200 pt-8 duration-500">
          <label className="flex items-center gap-2 text-sm font-bold tracking-wider text-slate-400 uppercase">
            <Maximize size={18} />
            6. Target Dimensions (mm)
          </label>
          <div className="flex gap-4">
            <div className="w-full space-y-1">
              <span className="ml-1 text-xs font-bold text-slate-500">LENGTH (≥ 10)</span>
              <input
                type="number"
                min="10"
                placeholder="L"
                value={config.dimensions.length}
                onChange={(e) => handleDimensionChange('length', e.target.value)}
                className={cn(
                  'w-full rounded-xl border-2 bg-white px-4 py-3 text-sm font-bold transition-colors focus:outline-none',
                  config.dimensions.length && Number(config.dimensions.length) < 10
                    ? 'border-red-400 focus:border-red-600'
                    : 'border-slate-200 focus:border-[#032a63]'
                )}
              />
            </div>
            <div className="w-full space-y-1">
              <span className="ml-1 text-xs font-bold text-slate-500">WIDTH (≥ 10)</span>
              <input
                type="number"
                min="10"
                placeholder="W"
                value={config.dimensions.width}
                onChange={(e) => handleDimensionChange('width', e.target.value)}
                className={cn(
                  'w-full rounded-xl border-2 bg-white px-4 py-3 text-sm font-bold transition-colors focus:outline-none',
                  config.dimensions.width && Number(config.dimensions.width) < 10
                    ? 'border-red-400 focus:border-red-600'
                    : 'border-slate-200 focus:border-[#032a63]'
                )}
              />
            </div>
            <div className="w-full space-y-1">
              <span className="ml-1 text-xs font-bold text-slate-500">HEIGHT (≥ 10)</span>
              <input
                type="number"
                min="10"
                placeholder="H"
                value={config.dimensions.height}
                onChange={(e) => handleDimensionChange('height', e.target.value)}
                className={cn(
                  'w-full rounded-xl border-2 bg-white px-4 py-3 text-sm font-bold transition-colors focus:outline-none',
                  config.dimensions.height && Number(config.dimensions.height) < 10
                    ? 'border-red-400 focus:border-red-600'
                    : 'border-slate-200 focus:border-[#032a63]'
                )}
              />
            </div>
          </div>

          {((config.dimensions.length > 0 && Number(config.dimensions.length) < 10) ||
            (config.dimensions.width > 0 && Number(config.dimensions.width) < 10) ||
            (config.dimensions.height > 0 && Number(config.dimensions.height) < 10)) && (
            <p className="animate-in fade-in slide-in-from-top-1 text-sm font-semibold text-red-500">
              * Minimum dimension is 10mm.
            </p>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="mt-12 flex justify-between border-t border-slate-200 pt-8">
        <button
          onClick={() => updateConfig({ step: 1 })}
          className="flex items-center justify-center rounded-xl px-6 py-3.5 text-base font-bold text-slate-500 transition-all hover:bg-slate-100 hover:text-[#032a63] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={() => {
            if (matchedRequirement) {
              updateConfig({ step: 3, requirementId: matchedRequirement.id });
            }
          }}
          disabled={
            !matchedRequirement ||
            config.capabilities.length === 0 ||
            !config.dimensions.length ||
            Number(config.dimensions.length) < 10 ||
            !config.dimensions.width ||
            Number(config.dimensions.width) < 10 ||
            !config.dimensions.height ||
            Number(config.dimensions.height) < 10
          }
          className="flex items-center justify-center gap-2 rounded-xl bg-[#032a63] px-8 py-3.5 text-base font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#021744] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-md"
        >
          Next: Design & Prompt
        </button>
      </div>
    </div>
  );
}

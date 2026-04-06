'use client';

import { Package, Layers, FileText, Info, Check, Upload, Sparkles } from 'lucide-react';
import type { ConfiguratorState } from './types';
import type { CustomDesignRequirement } from '@/types/api/requirement.api.type';
import {
  useGetTopicByIdQuery,
  useGetMaterialByIdQuery,
  useGetAssemblyMethodByIdQuery,
  useGetCapabilitiesQuery,
} from '@/lib/api/endpoints/metaData';

interface StepReviewProps {
  config: ConfiguratorState;
  updateConfig: (updates: Partial<ConfiguratorState>) => void;
  isSubmitting: boolean;
  submitError: string | null;
  onSubmit: () => void;
  requirements: CustomDesignRequirement[];
}

export default function StepReview({
  config,
  updateConfig,
  isSubmitting,
  submitError,
  onSubmit,
  requirements,
}: StepReviewProps) {
  // Fetch tên cho các ID đã chọn
  const { data: topicData } = useGetTopicByIdQuery(config.topic, { skip: !config.topic });
  const { data: materialData } = useGetMaterialByIdQuery(config.material, {
    skip: !config.material,
  });
  const { data: assemblyData } = useGetAssemblyMethodByIdQuery(config.assembly, {
    skip: !config.assembly,
  });
  const { data: capabilitiesData } = useGetCapabilitiesQuery({ pageNumber: 1, pageSize: 50 });

  // Map capability IDs sang tên
  const selectedCapNames = (capabilitiesData?.items || [])
    .filter((c: any) => config.capabilities.includes(c.id))
    .map((c: any) => c.name);

  // Tìm matched requirement để lấy min/max part count
  const matchedRequirement = requirements.find(
    (r) =>
      r.topicId === config.topic &&
      r.materialId === config.material &&
      r.assemblyMethodId === config.assembly &&
      r.difficulty === config.difficulty
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-3xl space-y-8 pb-20 duration-700">
      {/* Title */}
      <div className="space-y-2 text-center">
        <h2 className="text-4xl font-black tracking-tight text-blue-950">Review Your Request</h2>
        <p className="text-slate-500">
          Please double-check everything before submitting to our engineers.
        </p>
      </div>

      {/* === SINGLE CONTINUOUS REVIEW CARD === */}
      <div className="overflow-hidden rounded-3xl border-2 border-slate-100 bg-white shadow-sm">
        {/* ─── SECTION: Core Specifications ─── */}
        <div className="px-8 pt-8 pb-6">
          <div className="mb-6 flex items-center gap-2 text-xs font-bold tracking-widest text-blue-950 uppercase">
            <Layers size={16} className="text-blue-600" />
            Core Specifications
          </div>

          <div className="space-y-4">
            {/* Type — badge */}
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <span className="text-sm text-slate-500">Type</span>
              {config.Type ? (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                    config.Type === 'Sketch'
                      ? 'border border-amber-200 bg-amber-50 text-amber-700'
                      : 'border border-violet-200 bg-violet-50 text-violet-700'
                  }`}
                >
                  {config.Type === 'Sketch' ? <Upload size={12} /> : <Sparkles size={12} />}
                  {config.Type === 'Sketch' ? 'Sketch' : 'Idea'}
                </span>
              ) : (
                <span className="text-sm font-bold text-blue-950">—</span>
              )}
            </div>

            {/* Topic */}
            <ReviewRow label="Topic" value={topicData?.name || config.topic || '—'} />

            {/* Material */}
            <ReviewRow label="Material" value={materialData?.name || config.material || '—'} />

            {/* Assembly Method */}
            <ReviewRow
              label="Assembly Method"
              value={assemblyData?.name || config.assembly || '—'}
            />

            {/* Capabilities */}
            <div className="flex items-start justify-between border-b border-slate-50 pb-3">
              <span className="shrink-0 text-sm text-slate-500">Capabilities</span>
              <div className="text-right">
                {selectedCapNames.length > 0 ? (
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {selectedCapNames.map((name: string, i: number) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700"
                      >
                        <Check size={10} />
                        {name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm font-bold text-blue-950">—</span>
                )}
              </div>
            </div>

            {/* Difficulty */}
            <ReviewRow label="Complexity" value={config.difficulty || '—'} />

            {/* Part Count (min-max) */}
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <span className="text-sm text-slate-500">Part Count</span>
              {matchedRequirement ? (
                <span className="inline-flex items-center rounded-full border border-red-100 bg-red-50 px-3 py-0.5 text-xs font-bold text-red-600">
                  {matchedRequirement.minPartQuantity} – {matchedRequirement.maxPartQuantity} parts
                </span>
              ) : (
                <span className="text-sm font-bold text-blue-950">—</span>
              )}
            </div>

            {/* Dimensions */}
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <span className="text-sm text-slate-500">Dimensions</span>
              <div className="flex items-center gap-1.5 text-sm font-bold text-blue-950">
                <span>{config.dimensions.length}</span>
                <span className="text-slate-300">×</span>
                <span>{config.dimensions.width}</span>
                <span className="text-slate-300">×</span>
                <span>{config.dimensions.height}</span>
                <span className="ml-0.5 text-xs font-medium text-slate-400">mm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-8 border-t border-slate-100" />

        {/* ─── SECTION: Design Concept ─── */}
        <div className="px-8 py-6">
          <div className="mb-6 flex items-center gap-2 text-xs font-bold tracking-widest text-blue-950 uppercase">
            <FileText size={16} className="text-blue-600" />
            Design Concept
          </div>

          <div className="space-y-5">
            {/* Requirement Description — chỉ hiện nếu Type là Idea */}
            {config.Type === 'Idea' && config.aiPrompt && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold tracking-tight text-slate-400 uppercase">
                  Requirement Description
                </span>
                <p className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 italic">
                  &ldquo;{config.aiPrompt}&rdquo;
                </p>
              </div>
            )}

            {/* Uploaded Files */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold tracking-tight text-slate-400 uppercase">
                Attached Assets
              </span>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {config.uploadedFiles && config.uploadedFiles.length > 0 ? (
                  config.uploadedFiles.map((file, i) => {
                    const isImage = file.type.startsWith('image/');
                    const fileUrl = isImage ? URL.createObjectURL(file) : null;

                    return (
                      <div
                        key={i}
                        className="group relative aspect-square rounded-2xl border border-slate-100 bg-slate-50 p-1.5 transition-all hover:shadow-md"
                      >
                        {isImage ? (
                          <img
                            src={fileUrl!}
                            alt="preview"
                            className="h-full w-full rounded-xl object-cover"
                            onLoad={() => fileUrl && URL.revokeObjectURL(fileUrl)}
                          />
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center gap-2 p-2 text-center">
                            <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                              <Layers size={16} />
                            </div>
                            <span className="w-full truncate text-[10px] font-medium text-slate-500">
                              {file.name}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full rounded-2xl border-2 border-dashed border-slate-100 py-4 text-center">
                    <span className="text-xs text-slate-400 italic">
                      No blueprints or images attached
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-8 border-t border-slate-100" />

        {/* ─── SECTION: Order Details & Timeline ─── */}
        <div className="px-8 py-6 pb-8">
          <div className="mb-6 flex items-center gap-2 text-xs font-bold tracking-widest text-blue-950 uppercase">
            <Package size={16} className="text-blue-600" />
            Order Details & Timeline
          </div>

          <div className="space-y-4">
            <ReviewRow
              label="Total Quantity"
              value={`${Number(config.quantity).toLocaleString()} units`}
            />
            <ReviewRow
              label="Target Budget"
              value={`${Number(config.budget).toLocaleString()} VND`}
              highlight="green"
            />
            <ReviewRow
              label="Desired Delivery Date"
              value={
                config.deliveryDate
                  ? new Date(config.deliveryDate).toLocaleDateString('en-GB')
                  : 'TBD'
              }
            />
          </div>
        </div>
      </div>

      {/* FINAL CALL TO ACTION */}
      <div className="flex flex-col items-center gap-6 pt-4">
        <div className="flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-medium text-blue-700">
          <Info size={14} />
          Check your details carefully. You can still go back to change them.
        </div>

        <div className="mt-2 flex w-full justify-between border-t border-slate-200 pt-8">
          <button
            onClick={() => updateConfig({ step: 4 })}
            disabled={isSubmitting}
            className="flex items-center justify-center rounded-xl px-6 py-3.5 text-base font-bold text-slate-500 transition-all hover:bg-slate-100 hover:text-blue-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-950 px-10 py-3.5 text-base font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-blue-900 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-md"
          >
            {isSubmitting ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Submitting...
              </>
            ) : (
              'Send Request Now'
            )}
          </button>
        </div>

        {submitError && (
          <p className="animate-bounce rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-sm font-bold text-red-500">
            {submitError}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Helper Component ───
function ReviewRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: 'green';
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-50 pb-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span
        className={`text-sm font-bold ${highlight === 'green' ? 'text-green-600' : 'text-blue-950'}`}
      >
        {value}
      </span>
    </div>
  );
}

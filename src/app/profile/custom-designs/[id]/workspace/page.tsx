'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Send,
  Sparkles,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  Box,
  Cuboid,
  Info,
  Lightbulb,
  ChevronDown,
  History,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import {
  useGetCustomDesignAssetsByRequestIdQuery,
  useCreateCustomDesignAssetMutation,
} from '@/lib/api/endpoints/customDesignApi';

const ModelViewerClient = dynamic(() => import('@/components/customDesign/ModelViewer.client'), {
  ssr: false,
  loading: () => (
    <div className="bg-muted/20 flex h-full w-full flex-col items-center justify-center">
      <Loader2 className="text-brand h-8 w-8 animate-spin" />
      <span className="text-muted-foreground mt-2 text-sm font-medium">
        Initializing 3D Engine...
      </span>
    </div>
  ),
});

const PROCESSING_STATUSES = ['ImageProcessing', 'RoughModelGenerating'];
function isAssetProcessing(status?: string) {
  return PROCESSING_STATUSES.includes(status ?? '');
}

export default function AIWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: requestId } = use(params);
  const [prompt, setPrompt] = useState('');
  const [pollInterval, setPollInterval] = useState(0);

  // State quản lý xem đang xem Version nào (hiển thị GLB của version đó)
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  const { data: assets, isLoading } = useGetCustomDesignAssetsByRequestIdQuery(requestId, {
    pollingInterval: pollInterval,
  });

  const [createAsset, { isLoading: isGenerating }] = useCreateCustomDesignAssetMutation();

  useEffect(() => {
    if (assets && assets.length > 0) {
      const anyProcessing = assets.some((a: any) => isAssetProcessing(a.status));
      setPollInterval(anyProcessing ? 5000 : 0);

      // Mặc định chọn version mới nhất nếu chưa chọn gì
      if (!selectedVersionId) {
        setSelectedVersionId(assets[assets.length - 1].id);
      }
    } else {
      setPollInterval(0);
    }
  }, [assets, selectedVersionId]);

  // Các biến phân tách dữ liệu rõ ràng:
  const latestAsset = assets && assets.length > 0 ? assets[assets.length - 1] : null;

  // Asset đang hiển thị trên màn hình (dựa vào tab đã click)
  const displayedAsset = assets?.find((a: any) => a.id === selectedVersionId) || latestAsset;

  // Giới hạn số lần edit luôn tính theo version mới nhất
  const currentVersion = latestAsset?.version ?? 0;
  const remainingEdits = Math.max(0, 3 - currentVersion);

  // Trạng thái cho riêng cái đang xem
  const isCompleted = displayedAsset?.status === 'Completed';
  const isProcessing = isAssetProcessing(displayedAsset?.status);

  const handleGenerate = async () => {
    if (!prompt.trim()) return toast.error('Please enter a prompt!');
    if (remainingEdits <= 0) return toast.error('You have reached the maximum number of edits.');
    try {
      const res = await createAsset({ requestId, customerPrompt: prompt }).unwrap();
      toast.success('AI is processing your new request...');
      setPrompt('');
      // Tự động nhảy sang tab của version mới vừa được tạo
      if (res?.id) {
        setSelectedVersionId(res.id);
      }
    } catch {
      toast.error('Failed to start generation. Please try again.');
    }
  };

  if (isLoading && !latestAsset) {
    return (
      <div className="bg-background fixed inset-0 z-[100] flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-brand h-10 w-10 animate-spin" />
          <p className="text-muted-foreground animate-pulse text-sm font-medium">
            Loading Workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background fixed inset-0 z-[100] flex h-screen w-screen flex-col overflow-hidden">
      {/* ── HEADER ── */}
      <header className="border-border bg-card flex h-14 shrink-0 items-center justify-between border-b px-6">
        <Link
          href={`/profile/custom-designs/${requestId}`}
          className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Exit Workspace
        </Link>
        <div className="bg-brand/10 text-brand flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold shadow-sm">
          <Sparkles className="h-4 w-4" />
          AI Generation Workspace
        </div>
      </header>

      {/* ── TABS: CHỈ HIỂN THỊ KHI CÓ LỊCH SỬ (>= 2 VERSIONS) ── */}
      {assets && assets.length > 1 && (
        <div className="border-border bg-card flex h-11 shrink-0 items-end gap-2 overflow-x-auto border-b px-6">
          {assets.map((asset: any) => {
            const isSelected = displayedAsset?.id === asset.id;
            const isLatest = asset.id === latestAsset?.id;
            return (
              <button
                key={asset.id}
                onClick={() => setSelectedVersionId(asset.id)}
                className={`relative flex items-center gap-2 px-4 pt-2 pb-2.5 text-sm font-medium whitespace-nowrap transition-colors ${isSelected ? 'text-brand' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {isAssetProcessing(asset.status) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isLatest ? (
                  <Cuboid className="h-4 w-4" />
                ) : (
                  <History className="h-4 w-4" />
                )}
                Version {asset.version} {isLatest && '(Latest)'}
                {isSelected && (
                  <span className="bg-brand absolute right-0 bottom-0 left-0 h-0.5 rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── CONTENT LÚC NÀO CŨNG HIỂN THỊ ── */}
      <div className="flex w-full flex-1 overflow-hidden">
        {/* Cột trái: 3D Model (Hiển thị theo displayedAsset) */}
        <div className="bg-muted/5 flex flex-1 flex-col overflow-hidden">
          <div className="border-border bg-card flex shrink-0 flex-wrap items-center justify-between border-b px-6 py-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <span className="text-foreground flex items-center gap-2 font-bold">
                <Cuboid className="text-brand h-4 w-4" />
                Interactive 3D Model
              </span>
              {isCompleted && displayedAsset && (
                <>
                  <div className="bg-border hidden h-4 w-px sm:block" />
                  <span className="text-muted-foreground">
                    Code: <strong className="text-foreground">{displayedAsset.code}</strong>
                  </span>
                  <div className="bg-border hidden h-4 w-px sm:block" />
                  <span className="text-muted-foreground">
                    Generated:{' '}
                    <strong className="text-foreground">
                      {new Date(displayedAsset.updatedAt).toLocaleString()}
                    </strong>
                  </span>
                </>
              )}
            </div>
            {isCompleted && displayedAsset && (
              <span className="rounded-md bg-green-100 px-3 py-1 text-xs font-black tracking-wider text-green-700 uppercase dark:bg-green-500/20 dark:text-green-400">
                Version {displayedAsset.version}
              </span>
            )}
          </div>

          <div className="relative flex-1 overflow-hidden p-6">
            {isProcessing ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <div className="bg-brand/10 relative mb-5 flex h-20 w-20 items-center justify-center rounded-full shadow-inner">
                  {displayedAsset?.status === 'ImageProcessing' ? (
                    <ImageIcon className="text-brand h-10 w-10 animate-pulse" />
                  ) : (
                    <Box className="text-brand h-10 w-10 animate-[spin_3s_linear_infinite]" />
                  )}
                </div>
                <h3 className="text-xl font-bold">
                  {displayedAsset?.status === 'ImageProcessing'
                    ? 'AI is analyzing references...'
                    : 'Crafting the 3D structure...'}
                </h3>
                <p className="text-muted-foreground mt-2 max-w-md text-sm">
                  Please wait while the Puzkit3D AI is crafting your asset. This may take a few
                  minutes.
                </p>
              </div>
            ) : !displayedAsset ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <AlertCircle className="text-muted-foreground mb-3 h-12 w-12 opacity-30" />
                <p className="text-muted-foreground font-medium">No designs generated yet.</p>
              </div>
            ) : displayedAsset.rough3DModel ? (
              <div className="border-border h-full w-full overflow-hidden rounded-2xl border bg-black/5 shadow-inner dark:bg-white/5">
                <ModelViewerClient src={displayedAsset.rough3DModel} />
              </div>
            ) : (
              <div className="border-border bg-muted/50 text-muted-foreground flex h-full w-full items-center justify-center rounded-xl border border-dashed">
                3D Model file (.glb) is missing.
              </div>
            )}
          </div>
        </div>

        {/* Cột phải: Sidebar (Luôn giữ layout cố định) */}
        <div className="border-border bg-card z-10 flex w-[400px] shrink-0 flex-col gap-5 overflow-y-auto border-l p-6 shadow-2xl">
          {/* Render data của cái đang được chọn (displayedAsset) để biết lúc đó đã dùng prompt/ảnh gì */}
          {displayedAsset?.multiviewImages && displayedAsset.multiviewImages.length > 0 && (
            <div className="border-border bg-muted/20 flex flex-col gap-3 rounded-2xl border p-4 shadow-sm">
              <h3 className="text-muted-foreground flex items-center gap-2 text-sm font-bold tracking-wider uppercase">
                <ImageIcon className="h-4 w-4" /> Reference Views
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {displayedAsset.multiviewImages.map((url: string, index: number) => (
                  <div
                    key={index}
                    className="group border-border bg-background relative aspect-square overflow-hidden rounded-xl border shadow-sm"
                  >
                    <img
                      src={url}
                      alt={`Angle ${index + 1}`}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="bg-background/80 absolute top-2 left-2 rounded px-2 py-1 text-[10px] font-bold shadow-sm backdrop-blur-md">
                      View {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {displayedAsset?.customerPrompt && (
            <div className="border-brand/20 bg-brand/5 rounded-xl border p-4 text-sm shadow-inner">
              <div className="text-brand mb-2 flex items-center gap-2 font-bold">
                <Info className="h-4 w-4" /> Prompt used for Version {displayedAsset.version}:
              </div>
              <p className="text-foreground italic">"{displayedAsset.customerPrompt}"</p>
            </div>
          )}

          {/* Phần Form Refine luôn tính Limit dựa trên latestAsset */}
          <div className="border-border bg-background mt-auto flex flex-col gap-4 rounded-2xl border p-5 shadow-sm">
            <h3 className="text-foreground flex items-center gap-2 font-bold">
              <Sparkles className="text-brand h-5 w-5" />
              Refine the Model
            </h3>

            <div
              className={`rounded-xl border p-4 ${remainingEdits > 0 ? 'border-brand/20 bg-brand/5' : 'border-destructive/20 bg-destructive/5'}`}
            >
              <div className="flex items-end justify-between">
                <div>
                  <p
                    className={`text-sm font-medium ${remainingEdits > 0 ? 'text-brand dark:text-brand-foreground' : 'text-destructive'}`}
                  >
                    Free Edits Left
                  </p>
                  <p className="mt-1 text-xs opacity-70">Limit based on latest version</p>
                </div>
                <div
                  className={`text-3xl font-black ${remainingEdits > 0 ? 'text-brand' : 'text-destructive'}`}
                >
                  {remainingEdits}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Adjustment Instruction
              </label>
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={remainingEdits <= 0 || isGenerating}
                placeholder={
                  remainingEdits <= 0
                    ? 'Max versions reached. No more edits allowed.'
                    : "e.g., 'Make the character's hat slightly taller and thicken the base...'"
                }
                className="border-border bg-muted/50 text-foreground focus:border-brand focus:ring-brand/30 resize-none rounded-xl border px-4 py-3 text-sm shadow-inner transition outline-none focus:ring-1 disabled:pointer-events-none disabled:opacity-50"
              />
              <button
                onClick={handleGenerate}
                disabled={remainingEdits <= 0 || !prompt.trim() || isGenerating}
                className="bg-brand text-brand-foreground shadow-brand/20 mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:pointer-events-none disabled:opacity-50"
              >
                {isGenerating || isAssetProcessing(latestAsset?.status) ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Processing Version{' '}
                    {currentVersion + 1}...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Generate Version {currentVersion + 1}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

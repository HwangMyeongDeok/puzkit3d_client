'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Loader2,
  ArrowLeft,
  Calendar,
  Package,
  DollarSign,
  Ruler,
  ImageIcon,
  Clock,
  Hash,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Ban,
  HelpCircle,
  Hourglass,
  Cog,
  Trash2,
  Pencil,
  X,
  MessageSquare,
  UploadCloud,
  Layers,
  FileText,
} from 'lucide-react';

import {
  useGetCustomDesignRequestByIdQuery,
  useUpdateCustomDesignRequestMutation,
  useDeleteCustomDesignRequestMutation,
} from '@/lib/api/endpoints/customDesignApi';

import { useGetPresignedUrlMutation } from '@/lib/api/endpoints/uploadApi';
import { useGetCustomDesignRequirementByIdQuery } from '@/lib/api/endpoints/customDesignRequirementApi';

import {
  useGetTopicByIdQuery,
  useGetMaterialByIdQuery,
  useGetAssemblyMethodByIdQuery,
  useGetCapabilitiesQuery,
} from '@/lib/api/endpoints/metaData';

import type { CustomDesignRequestStatus } from '@/types/api/customDesign.api.type';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// ── Helpers ──────────────────────────────────────────────
const STATUS_CONFIG: Record<
  CustomDesignRequestStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  Submitted: {
    label: 'Submitted',
    className:
      'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20',
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  MissingInformation: {
    label: 'Missing Info',
    className:
      'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/20',
    icon: <AlertCircle className="h-3.5 w-3.5" />,
  },
  Approved: {
    label: 'Approved',
    className:
      'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:border-teal-500/20',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  Completed: {
    label: 'Completed',
    className:
      'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-300 dark:border-green-500/20',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  Rejected: {
    label: 'Rejected',
    className:
      'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20',
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
  Cancelled: {
    label: 'Cancelled',
    className:
      'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
    icon: <Ban className="h-3.5 w-3.5" />,
  },
  Expired: {
    label: 'Expired',
    className:
      'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20',
    icon: <Hourglass className="h-3.5 w-3.5" />,
  },
};

function StatusBadge({ status }: { status: CustomDesignRequestStatus }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    className: 'bg-gray-100 text-gray-600 border-gray-200',
    icon: <HelpCircle className="h-3.5 w-3.5" />,
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${cfg.className}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// ── Cancel Confirm Dialog ─────────────────────────────────
function CancelDialog({
  onConfirm,
  onClose,
  isLoading,
}: {
  onConfirm: () => void;
  onClose: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="bg-card border-border w-full max-w-sm rounded-2xl border p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10">
              <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="font-semibold">Cancel Request</h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-muted-foreground text-sm">
          Are you sure you want to cancel this request? This action cannot be undone.
        </p>
        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="border-border hover:bg-muted flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
          >
            Keep Request
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Cancel Request
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Form ─────────────────────────────────────────────
function EditForm({
  request,
  onClose,
}: {
  request: NonNullable<ReturnType<typeof useGetCustomDesignRequestByIdQuery>['data']>;
  onClose: () => void;
}) {
  const [updateRequest, { isLoading: isUpdating }] = useUpdateCustomDesignRequestMutation();
  const [getPresignedUrl] = useGetPresignedUrlMutation();

  const [isProcessingFiles, setIsProcessingFiles] = useState(false);

  const [form, setForm] = useState({
    desiredLengthMm: request.desiredLengthMm,
    desiredWidthMm: request.desiredWidthMm,
    desiredHeightMm: request.desiredHeightMm,
    desiredQuantity: request.desiredQuantity,
    targetBudget: request.targetBudget,
    customerPrompt: request.customerPrompt ?? '',
    desiredDeliveryDate: request.desiredDeliveryDate?.slice(0, 10) ?? '',
  });

  const [existingSketches, setExistingSketches] = useState<string[]>(request.sketchesUrls ?? []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newFilePreviews, setNewFilePreviews] = useState<string[]>([]);

  const totalImagesCount = existingSketches.length + newFiles.length;

  useEffect(() => {
    return () => {
      newFilePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newFilePreviews]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);

    if (totalImagesCount + filesArray.length > 4) {
      toast.error('You can only upload up to 4 images in total.');
      return;
    }

    setNewFiles((prev) => [...prev, ...filesArray]);
    setNewFilePreviews((prev) => [...prev, ...filesArray.map((f) => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  const handleRemoveExisting = (indexToRemove: number) => {
    setExistingSketches((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleRemoveNew = (indexToRemove: number) => {
    setNewFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setNewFilePreviews((prev) => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[indexToRemove]);
      newPreviews.splice(indexToRemove, 1);
      return newPreviews;
    });
  };

  const handleSubmit = async () => {
    try {
      setIsProcessingFiles(true);
      let uploadedS3Paths: string[] = [];

      if (newFiles.length > 0) {
        toast.loading('Uploading images to S3...', { id: 'upload-toast' });

        const uploadPromises = newFiles.map(async (file) => {
          const { presignedUrl, path } = await getPresignedUrl({
            contentType: file.type,
            folder: 'custom-designs',
            path: `custom-designs/${request.id}/${Date.now()}_${file.name}`,
            fileName: file.name,
          }).unwrap();

          await fetch(presignedUrl, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type },
          });

          return path;
        });

        uploadedS3Paths = await Promise.all(uploadPromises);
        toast.success('Images uploaded successfully.', { id: 'upload-toast' });
      }

      const finalSketchesUrls = [...existingSketches, ...uploadedS3Paths];

      const dataToSubmit = {
        ...form,
        sketchesUrls: request.type === 'Sketch' ? finalSketchesUrls : undefined,
      };

      await updateRequest({ id: request.id, data: dataToSubmit }).unwrap();
      toast.success('Request updated successfully!');

      setIsProcessingFiles(false);
      onClose();
    } catch (error) {
      console.error('Update error:', error);
      setIsProcessingFiles(false);
      toast.error('Failed to update request.', { id: 'upload-toast' });
    }
  };

  const field = (label: string, key: keyof typeof form, type = 'text') => (
    <div className="flex flex-col gap-1.5">
      <label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
        {label}
      </label>
      <input
        type={type}
        value={form[key] as string | number}
        onChange={(e) =>
          setForm((f) => ({
            ...f,
            [key]: type === 'number' ? Number(e.target.value) : e.target.value,
          }))
        }
        className="bg-muted/50 border-border text-foreground focus:border-brand focus:ring-brand/30 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
      />
    </div>
  );

  const isWorking = isUpdating || isProcessingFiles;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-16 backdrop-blur-sm">
      <div className="bg-card border-border w-full max-w-lg rounded-2xl border shadow-xl">
        <div className="border-border flex items-center justify-between border-b px-6 py-4">
          <h3 className="font-semibold">Update Request Info</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-6">
          <div className="grid grid-cols-2 gap-4">
            {field('Length (mm)', 'desiredLengthMm', 'number')}
            {field('Width (mm)', 'desiredWidthMm', 'number')}
            {field('Height (mm)', 'desiredHeightMm', 'number')}
            {field('Quantity', 'desiredQuantity', 'number')}
          </div>
          {field('Budget (₫)', 'targetBudget', 'number')}
          {field('Desired Delivery Date', 'desiredDeliveryDate', 'date')}

          {request.type === 'Idea' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                My Prompt
              </label>
              <textarea
                rows={4}
                value={form.customerPrompt}
                onChange={(e) => setForm((f) => ({ ...f, customerPrompt: e.target.value }))}
                placeholder="Describe your idea..."
                className="bg-muted/50 border-border text-foreground focus:border-brand focus:ring-brand/30 resize-none rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
              />
            </div>
          )}

          {request.type === 'Sketch' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  Sketches ({totalImagesCount}/4)
                </label>
              </div>

              {totalImagesCount > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {existingSketches.map((url, idx) => (
                    <div
                      key={`old-${idx}`}
                      className="group border-border bg-muted relative aspect-square overflow-hidden rounded-lg border"
                    >
                      <img src={url} alt="Existing Sketch" className="h-full w-full object-cover" />
                      <button
                        onClick={() => handleRemoveExisting(idx)}
                        disabled={isWorking}
                        className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {newFilePreviews.map((url, idx) => (
                    <div
                      key={`new-${idx}`}
                      className="group border-brand/50 bg-muted relative aspect-square overflow-hidden rounded-lg border-2"
                    >
                      <img
                        src={url}
                        alt="New Sketch Preview"
                        className="h-full w-full object-cover opacity-80"
                      />
                      <div className="bg-brand text-brand-foreground absolute inset-x-0 bottom-0 py-0.5 text-center text-[9px] font-bold tracking-wider">
                        NEW
                      </div>
                      <button
                        onClick={() => handleRemoveNew(idx)}
                        disabled={isWorking}
                        className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {totalImagesCount < 4 && !isWorking && (
                <label className="border-border hover:bg-muted/50 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 transition-colors">
                  <div className="bg-brand/10 text-brand rounded-full p-2">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Click to upload files</p>
                    <p className="text-muted-foreground mt-0.5 text-xs">JPG, PNG, WebP (Max 4)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isWorking}
                  />
                </label>
              )}

              {isProcessingFiles && !isUpdating && (
                <div className="border-border bg-muted flex flex-col items-center justify-center gap-2 rounded-xl border p-6 text-center">
                  <Loader2 className="text-brand h-6 w-6 animate-spin" />
                  <p className="text-sm font-medium">Uploading images directly to S3...</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-border flex gap-3 border-t px-6 py-4">
          <button
            onClick={onClose}
            disabled={isWorking}
            className="border-border hover:bg-muted flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isWorking}
            className="bg-brand text-brand-foreground hover:bg-brand/90 flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50"
          >
            {isWorking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Pencil className="h-4 w-4" />
            )}
            {isProcessingFiles && !isUpdating
              ? 'Uploading...'
              : isUpdating
                ? 'Saving...'
                : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function CustomDesignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const { data: request, isLoading, isError } = useGetCustomDesignRequestByIdQuery(id);
  const [deleteRequest, { isLoading: isDeleting }] = useDeleteCustomDesignRequestMutation();

  const { data: requirement, isLoading: isLoadingReq } = useGetCustomDesignRequirementByIdQuery(
    request?.customDesignRequirementId ?? '',
    { skip: !request?.customDesignRequirementId }
  );

  const { data: topicData } = useGetTopicByIdQuery(requirement?.topicId ?? '', {
    skip: !requirement?.topicId,
  });
  const { data: materialData } = useGetMaterialByIdQuery(requirement?.materialId ?? '', {
    skip: !requirement?.materialId,
  });
  const { data: assemblyData } = useGetAssemblyMethodByIdQuery(
    requirement?.assemblyMethodId ?? '',
    { skip: !requirement?.assemblyMethodId }
  );
  const { data: capabilitiesData } = useGetCapabilitiesQuery({
    pageNumber: 1,
    pageSize: 50,
    ascending: true,
  });

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const handleCancel = async () => {
    try {
      await deleteRequest(id).unwrap();
      toast.success('Request cancelled successfully.');
      router.push('/profile/custom-designs');
    } catch {
      toast.error('Failed to cancel request. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="text-brand h-8 w-8 animate-spin" />
          <p className="text-muted-foreground text-sm">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (isError || !request) {
    return (
      <div className="flex flex-col gap-6">
        <Link
          href="/profile/custom-designs"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to requests
        </Link>
        <div className="bg-destructive/10 text-destructive border-destructive/20 rounded-xl border p-8 text-center">
          <XCircle className="mx-auto mb-3 h-10 w-10 opacity-60" />
          <p className="font-semibold">Request not found or an error occurred.</p>
        </div>
      </div>
    );
  }

  const isMissingInfo = request.status === 'MissingInformation';
  const isSubmitted = request.status === 'Submitted';
  const isAIFlow = request.status === 'Approved' || request.status === 'Completed';

  const selectedCapNames = (capabilitiesData?.items || [])
    .filter((c: any) => requirement?.capabilityIds?.includes(c.id))
    .map((c: any) => c.name);

  return (
    <>
      {showCancelDialog && (
        <CancelDialog
          onConfirm={handleCancel}
          onClose={() => setShowCancelDialog(false)}
          isLoading={isDeleting}
        />
      )}
      {showEditForm && <EditForm request={request} onClose={() => setShowEditForm(false)} />}

      <div className="flex flex-col gap-6 pb-12">
        {/* Back */}
        <Link
          href="/profile/custom-designs"
          className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to requests
        </Link>

        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Request #{request.code}</h1>
              {/* Type Badge Nổi Bật */}
              <span className="rounded-md bg-[#032a63] px-3 py-1 text-xs font-black tracking-widest text-white uppercase shadow-md">
                {request.type}
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              Created {formatDate(request.createdAt)}
              {request.updatedAt && ` · Updated ${formatDate(request.updatedAt)}`}
            </p>
          </div>

          {/* Status & Actions Container */}
          <div className="mt-2 flex flex-wrap items-center gap-2 sm:mt-0">
            <StatusBadge status={request.status} />

            {/* Nút Enter AI Workspace (Chỉ còn nút, không còn Banner) */}
            {isAIFlow && (
              <Link
                href={`/profile/custom-designs/${request.id}/workspace`}
                className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700"
              >
                ✨ AI Workspace
              </Link>
            )}

            {isMissingInfo && (
              <button
                onClick={() => setShowEditForm(true)}
                className="bg-brand text-brand-foreground hover:bg-brand/90 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5"
              >
                <Pencil className="h-4 w-4" />
                Update Info
              </button>
            )}
            {isSubmitted && (
              <button
                onClick={() => setShowCancelDialog(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:-translate-y-0.5 hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/5 dark:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
                Cancel Request
              </button>
            )}
          </div>
        </div>

        {/* Missing info alert with Staff Note */}
        {isMissingInfo && (
          <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-500/20 dark:bg-orange-500/5">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-orange-600 dark:text-orange-400" />
            <div className="w-full">
              <p className="font-semibold text-orange-700 dark:text-orange-300">Action Required</p>
              <p className="mt-0.5 text-sm text-orange-600 dark:text-orange-400">
                Our team needs more information to proceed with your request. Please update the
                details.
              </p>
              {request.note && (
                <div className="mt-3 rounded-lg border border-orange-200 bg-orange-100/50 p-3 text-sm text-orange-900 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-200">
                  <span className="mb-1 block font-semibold">Staff Note:</span>
                  <span className="whitespace-pre-wrap">{request.note}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Main Layout: 2 Cột Lớn ── */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* --- CỘT TRÁI: Technical & Design Details (Gộp chung thành 1 Block Lớn) --- */}
          <div className="bg-card border-border flex flex-col overflow-hidden rounded-2xl border shadow-sm lg:col-span-2">
            {/* Section 1: Dimensions & Engineering Configuration */}
            <div className="p-6">
              <h2 className="mb-5 flex items-center gap-2 text-lg font-bold">
                <Layers className="text-brand h-5 w-5" />
                Technical Specifications
              </h2>

              <div className="bg-muted/30 rounded-xl border border-dashed border-slate-200 p-5 dark:border-slate-800">
                {isLoadingReq ? (
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                  </div>
                ) : requirement ? (
                  <div className="flex flex-col gap-3 text-sm">
                    <div className="border-border flex justify-between border-b pb-3">
                      <span className="text-muted-foreground">Topic:</span>
                      <span className="text-right font-semibold">{topicData?.name || '—'}</span>
                    </div>
                    <div className="border-border flex justify-between border-b pb-3">
                      <span className="text-muted-foreground">Material:</span>
                      <span className="text-right font-semibold">{materialData?.name || '—'}</span>
                    </div>
                    <div className="border-border flex justify-between border-b pb-3">
                      <span className="text-muted-foreground">Assembly:</span>
                      <span className="text-right font-semibold">{assemblyData?.name || '—'}</span>
                    </div>
                    <div className="border-border flex justify-between border-b pb-3">
                      <span className="text-muted-foreground">Complexity:</span>
                      <span className="text-brand text-right font-semibold">
                        {requirement.difficulty || '—'}
                      </span>
                    </div>
                    {/* Target Dimensions Gộp Chung Vô Cùng Khối Material & Build */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-muted-foreground">Target Dimensions:</span>
                      <div className="flex items-center gap-1.5 font-bold text-[#032a63] dark:text-blue-400">
                        <span>{request.desiredLengthMm}</span>
                        <span className="text-slate-300 dark:text-slate-600">×</span>
                        <span>{request.desiredWidthMm}</span>
                        <span className="text-slate-300 dark:text-slate-600">×</span>
                        <span>{request.desiredHeightMm}</span>
                        <span className="text-muted-foreground ml-0.5 text-xs font-normal">mm</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm italic">
                    Configuration data not available.
                  </p>
                )}
              </div>

              {/* Capabilities */}
              {!isLoadingReq && selectedCapNames && selectedCapNames.length > 0 && (
                <div className="mt-6">
                  <span className="text-muted-foreground mb-2 block text-[10px] font-semibold tracking-wider uppercase">
                    Required Capabilities
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedCapNames.map((capName: string, i: number) => (
                      <span
                        key={i}
                        className="bg-brand/10 text-brand border-brand/20 rounded-md border px-2.5 py-1 text-xs font-semibold"
                      >
                        {capName}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Prompt & Sketches (Chỉ hiện khi có 1 trong 2) */}
            {(request.customerPrompt ||
              (request.sketchesUrls && request.sketchesUrls.length > 0)) && (
              <div className="border-border border-t bg-slate-50/50 p-6 dark:bg-slate-900/20">
                <h2 className="mb-5 flex items-center gap-2 text-lg font-bold">
                  <FileText className="text-brand h-5 w-5" />
                  Design Concept & References
                </h2>

                <div className="flex flex-col gap-6">
                  {request.customerPrompt && (
                    <div>
                      <span className="text-muted-foreground mb-2 block text-[10px] font-semibold tracking-wider uppercase">
                        My Prompt
                      </span>
                      <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap italic">
                        "{request.customerPrompt}"
                      </p>
                    </div>
                  )}

                  {request.sketchesUrls && request.sketchesUrls.length > 0 && (
                    <div>
                      <span className="text-muted-foreground mb-3 block text-[10px] font-semibold tracking-wider uppercase">
                        Attached Sketches ({request.sketchesUrls.length})
                      </span>
                      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                        {request.sketchesUrls.map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="border-border group relative aspect-square overflow-hidden rounded-lg border bg-white transition hover:opacity-90 dark:bg-slate-950"
                          >
                            <img
                              src={url}
                              alt={`Sketch ${i + 1}`}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
                              <ImageIcon className="h-6 w-6 text-white opacity-0 transition group-hover:opacity-100" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* --- CỘT PHẢI: Order Summary & Timeline (Gộp chung thành 1 Block Lớn) --- */}
          <div className="bg-card border-border flex flex-col overflow-hidden rounded-2xl border shadow-sm">
            {/* Request Info */}
            <div className="p-6">
              <h2 className="mb-5 text-lg font-bold">Order Summary</h2>
              <div className="flex flex-col gap-4 text-sm">
                {[
                  {
                    icon: <Hash className="h-4 w-4" />,
                    label: 'Code',
                    value: <span className="font-mono font-semibold">{request.code}</span>,
                  },
                  {
                    icon: <FileText className="h-4 w-4" />,
                    label: 'Type',
                    value: <span className="font-medium">{request.type}</span>,
                  },
                  {
                    // Quantity Đã được chuyển qua đây
                    icon: <Package className="h-4 w-4" />,
                    label: 'Quantity',
                    value: (
                      <span className="font-bold text-[#032a63] dark:text-blue-400">
                        {request.desiredQuantity.toLocaleString()} units
                      </span>
                    ),
                  },
                  {
                    icon: <DollarSign className="h-4 w-4" />,
                    label: 'Budget',
                    value: (
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {request.targetBudget.toLocaleString()} ₫
                      </span>
                    ),
                  },
                  {
                    icon: <Calendar className="h-4 w-4" />,
                    label: 'Delivery',
                    value: (
                      <span className="font-medium">
                        {formatDateShort(request.desiredDeliveryDate)}
                      </span>
                    ),
                  },
                  {
                    icon: <Clock className="h-4 w-4" />,
                    label: 'Support Used',
                    value: (
                      <span className="font-medium">{request.usedSupportConceptDesignTime}x</span>
                    ),
                  },
                ].map(({ icon, label, value }, i, arr) => (
                  <div key={label}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground flex items-center gap-2">
                        {icon} {label}
                      </span>
                      <span className="text-right">{value}</span>
                    </div>
                    {i < arr.length - 1 && <div className="bg-border mt-4 h-px" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="border-border border-t bg-slate-50/50 p-6 dark:bg-slate-900/20">
              <h2 className="mb-5 text-lg font-bold">Timeline</h2>
              <ol className="relative border-l border-slate-200 pl-4 dark:border-slate-700">
                <li className="mb-5 last:mb-0">
                  <div className="bg-brand absolute -left-1.5 mt-1 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900" />
                  <p className="text-xs font-semibold">Created</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {formatDate(request.createdAt)}
                  </p>
                </li>
                {request.updatedAt && (
                  <li className="mb-5 last:mb-0">
                    <div className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full border-2 border-white bg-slate-400 dark:border-slate-900" />
                    <p className="text-xs font-semibold">Last Updated</p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {formatDate(request.updatedAt)}
                    </p>
                  </li>
                )}
                <li>
                  <div
                    className={`absolute -left-1.5 mt-1 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 ${request.status === 'Completed' ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                  />
                  <p className="text-xs font-semibold">Current Status</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {STATUS_CONFIG[request.status]?.label ?? request.status}
                  </p>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

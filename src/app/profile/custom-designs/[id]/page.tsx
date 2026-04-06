'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  Loader2,
  ArrowLeft,
  Calendar,
  Package,
  DollarSign,
  Ruler,
  FileText,
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
} from 'lucide-react';

import {
  useGetCustomDesignRequestByIdQuery,
  useUpdateCustomDesignRequestMutation,
  useDeleteCustomDesignRequestMutation,
} from '@/lib/api/endpoints/customDesignApi';
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
  Processing: {
    label: 'Processing',
    className:
      'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20',
    icon: <Cog className="h-3.5 w-3.5" />,
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
  const [updateRequest, { isLoading }] = useUpdateCustomDesignRequestMutation();

  const [form, setForm] = useState({
    desiredLengthMm: request.desiredLengthMm,
    desiredWidthMm: request.desiredWidthMm,
    desiredHeightMm: request.desiredHeightMm,
    desiredQuantity: request.desiredQuantity,
    targetBudget: request.targetBudget,
    customerPrompt: request.customerPrompt ?? '',
    desiredDeliveryDate: request.desiredDeliveryDate?.slice(0, 10) ?? '',
    note: request.note ?? '',
  });

  const handleSubmit = async () => {
    try {
      await updateRequest({ id: request.id, data: form }).unwrap();
      toast.success('Request updated successfully!');
      onClose();
    } catch {
      toast.error('Failed to update request. Please try again.');
    }
  };

  const field = (label: string, key: keyof typeof form, type = 'text') => (
    <div className="flex flex-col gap-1.5">
      <label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
        {label}
      </label>
      <input
        type={type}
        value={form[key]}
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

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-16 backdrop-blur-sm">
      <div className="bg-card border-border w-full max-w-lg rounded-2xl border shadow-xl">
        {/* Header */}
        <div className="border-border flex items-center justify-between border-b px-6 py-4">
          <h3 className="font-semibold">Update Request Info</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 p-6">
          <div className="grid grid-cols-2 gap-4">
            {field('Length (mm)', 'desiredLengthMm', 'number')}
            {field('Width (mm)', 'desiredWidthMm', 'number')}
            {field('Height (mm)', 'desiredHeightMm', 'number')}
            {field('Quantity', 'desiredQuantity', 'number')}
          </div>
          {field('Budget (₫)', 'targetBudget', 'number')}
          {field('Desired Delivery Date', 'desiredDeliveryDate', 'date')}

          <div className="flex flex-col gap-1.5">
            <label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              My Prompt
            </label>
            <textarea
              rows={4}
              value={form.customerPrompt}
              onChange={(e) => setForm((f) => ({ ...f, customerPrompt: e.target.value }))}
              className="bg-muted/50 border-border text-foreground focus:border-brand focus:ring-brand/30 resize-none rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Note to Staff
            </label>
            <textarea
              rows={2}
              placeholder="Add any additional notes for our team..."
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus:border-brand focus:ring-brand/30 resize-none rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-border flex gap-3 border-t px-6 py-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="border-border hover:bg-muted flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-brand text-brand-foreground hover:bg-brand/90 flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Pencil className="h-4 w-4" />
            )}
            Save Changes
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
          <p className="mt-1 text-sm opacity-75">Please go back and try again.</p>
        </div>
      </div>
    );
  }

  const isMissingInfo = request.status === 'MissingInformation';
  const isSubmitted = request.status === 'Submitted';

  return (
    <>
      {/* Dialogs */}
      {showCancelDialog && (
        <CancelDialog
          onConfirm={handleCancel}
          onClose={() => setShowCancelDialog(false)}
          isLoading={isDeleting}
        />
      )}
      {showEditForm && <EditForm request={request} onClose={() => setShowEditForm(false)} />}

      <div className="flex flex-col gap-6">
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
              <span className="bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-xs font-semibold tracking-wider uppercase">
                {request.type}
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              Created {formatDate(request.createdAt)}
              {request.updatedAt && ` · Updated ${formatDate(request.updatedAt)}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={request.status} />
            {/* ── Action buttons ── */}
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

        {/* Missing info alert */}
        {isMissingInfo && (
          <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-500/20 dark:bg-orange-500/5">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-orange-600 dark:text-orange-400" />
            <div>
              <p className="font-semibold text-orange-700 dark:text-orange-300">Action Required</p>
              <p className="mt-0.5 text-sm text-orange-600 dark:text-orange-400">
                Our team needs more information to proceed with your request. Please update the
                details.
              </p>
            </div>
          </div>
        )}

        {/* Main grid */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Left */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            {/* Specs */}
            <div className="bg-card border-border rounded-xl border p-5 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 font-semibold">
                <Ruler className="text-brand h-4 w-4" />
                Specifications
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: 'Length', value: request.desiredLengthMm },
                  { label: 'Width', value: request.desiredWidthMm },
                  { label: 'Height', value: request.desiredHeightMm },
                  { label: 'Quantity', value: request.desiredQuantity, unit: 'units' },
                ].map(({ label, value, unit = 'mm' }) => (
                  <div key={label} className="bg-muted/50 rounded-lg p-3">
                    <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                      {label}
                    </p>
                    <p className="mt-1 text-lg font-bold">
                      {value.toLocaleString()}{' '}
                      <span className="text-muted-foreground text-xs font-normal">{unit}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-card border-border rounded-xl border p-5 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 font-semibold">
                <FileText className="text-brand h-4 w-4" />
                Description
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                {request.customerPrompt || '—'}
              </p>
            </div>

            {/* Sketches */}
            {request.sketchesUrls && request.sketchesUrls.length > 0 && (
              <div className="bg-card border-border rounded-xl border p-5 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 font-semibold">
                  <ImageIcon className="text-brand h-4 w-4" />
                  Sketches / References
                  <span className="text-muted-foreground text-xs font-normal">
                    ({request.sketchesUrls.length})
                  </span>
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {request.sketchesUrls.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-border group relative aspect-square overflow-hidden rounded-lg border bg-slate-50 transition hover:opacity-90 dark:bg-slate-900"
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

          {/* Right */}
          <div className="flex flex-col gap-4">
            <div className="bg-card border-border rounded-xl border p-5 shadow-sm">
              <h2 className="mb-4 font-semibold">Request Info</h2>
              <div className="flex flex-col gap-3 text-sm">
                {[
                  {
                    icon: <Hash className="h-3.5 w-3.5" />,
                    label: 'Code',
                    value: <span className="font-mono font-semibold">{request.code}</span>,
                  },
                  { icon: <Package className="h-3.5 w-3.5" />, label: 'Type', value: request.type },
                  {
                    icon: <DollarSign className="h-3.5 w-3.5" />,
                    label: 'Budget',
                    value: `${request.targetBudget.toLocaleString()} ₫`,
                  },
                  {
                    icon: <Calendar className="h-3.5 w-3.5" />,
                    label: 'Delivery',
                    value: formatDateShort(request.desiredDeliveryDate),
                  },
                  {
                    icon: <Clock className="h-3.5 w-3.5" />,
                    label: 'Support Used',
                    value: `${request.usedSupportConceptDesignTime}x`,
                  },
                ].map(({ icon, label, value }, i, arr) => (
                  <div key={label}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        {icon} {label}
                      </span>
                      <span className="text-right font-medium">{value}</span>
                    </div>
                    {i < arr.length - 1 && <div className="bg-border mt-3 h-px" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-card border-border rounded-xl border p-5 shadow-sm">
              <h2 className="mb-4 font-semibold">Timeline</h2>
              <ol className="relative border-l border-slate-200 pl-4 dark:border-slate-700">
                <li className="mb-4 last:mb-0">
                  <div className="bg-brand absolute -left-1.5 mt-1 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900" />
                  <p className="text-xs font-semibold">Created</p>
                  <p className="text-muted-foreground text-xs">{formatDate(request.createdAt)}</p>
                </li>
                {request.updatedAt && (
                  <li className="mb-4 last:mb-0">
                    <div className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full border-2 border-white bg-slate-400 dark:border-slate-900" />
                    <p className="text-xs font-semibold">Last Updated</p>
                    <p className="text-muted-foreground text-xs">{formatDate(request.updatedAt)}</p>
                  </li>
                )}
                <li>
                  <div
                    className={`absolute -left-1.5 mt-1 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 ${request.status === 'Completed' ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                  />
                  <p className="text-xs font-semibold">Current Status</p>
                  <p className="text-muted-foreground text-xs">
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

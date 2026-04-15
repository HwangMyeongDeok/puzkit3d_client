'use client';

// src/components/ticket/ReportIssueDialog.tsx

import { useState, useRef } from 'react';
import { toast } from 'sonner';
import {
  Loader2,
  AlertTriangle,
  Link as LinkIcon,
  FileText,
  Package,
  HardDrive,
  UploadCloud,
  Wrench,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';

import type { OrderDetailDto } from '@/types/api/order.api.types';
import {
  useCreateTicketMutation,
  type TicketType,
  type CreateTicketDetailDto,
} from '@/lib/api/endpoints/supportTicketApi';
import { useGetProductBySlugQuery } from '@/lib/api/endpoints/productApi';

import { useGetPresignedUrlMutation } from '@/lib/api/endpoints/uploadApi';

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

const TICKET_TYPES: { value: TicketType; label: string; description: string }[] = [
  {
    value: 'ReplaceDrive',
    label: 'Replace Drive',
    description: 'Request replacement for a missing or damaged drive',
  },
  {
    value: 'Exchange',
    label: 'Exchange',
    description: 'Exchange for a different product',
  },
  {
    value: 'Return',
    label: 'Return',
    description: 'Return for a refund',
  },
];

/* ------------------------------------------------------------------ */
/* Per-item state                                                     */
/* ------------------------------------------------------------------ */

interface ItemSelection {
  selected: boolean;
  driveId: string;
  quantity: number;
  note: string;
}

function defaultItemState(): ItemSelection {
  return { selected: false, driveId: '', quantity: 1, note: '' };
}

/* ------------------------------------------------------------------ */
/* URL validation                                                     */
/* ------------------------------------------------------------------ */

function isValidInput(value: string): boolean {
  return value.trim().length > 0;
}

/* ------------------------------------------------------------------ */
/* Drive selector sub-component                                       */
/* ------------------------------------------------------------------ */

interface DriveSelectorProps {
  productSlug: string;
  value: string;
  onChange: (driveId: string) => void;
  hasError: boolean;
}

function DriveSelector({ productSlug, value, onChange, hasError }: DriveSelectorProps) {
  const {
    data: product,
    isLoading,
    isError,
  } = useGetProductBySlugQuery(productSlug, {
    skip: !productSlug,
  });

  const drives = product?.drives ?? [];

  if (isLoading) {
    return (
      <div className="border-input bg-muted/30 text-muted-foreground flex h-9 items-center gap-2 rounded-md border px-3 text-sm">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Loading drives list...
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex h-9 items-center gap-2 rounded-md border border-blue-900/40 bg-blue-50 px-3 text-sm text-blue-900">
        <AlertTriangle className="h-3.5 w-3.5" />
        Failed to load drives. Try again later.
      </div>
    );
  }

  if (drives.length === 0) {
    return (
      <div className="border-input bg-muted/30 text-muted-foreground flex h-9 items-center gap-2 rounded-md border px-3 text-sm">
        This product has no drives available for replacement.
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={hasError ? 'border-blue-900' : ''}>
        <SelectValue placeholder="Select drive to replace..." />
      </SelectTrigger>
      <SelectContent>
        {drives.map((drive: any) => (
          <SelectItem key={drive.driveId} value={drive.driveId}>
            <div className="flex flex-col gap-0.5">
              <span className="font-medium">{drive.driveName}</span>
              <span className="text-muted-foreground text-xs">Qty: {drive.quantity}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/* ------------------------------------------------------------------ */
/* Props                                                              */
/* ------------------------------------------------------------------ */

interface ReportIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  orderDetails: OrderDetailDto[];
}

/* ------------------------------------------------------------------ */
/* Main component                                                     */
/* ------------------------------------------------------------------ */

export default function ReportIssueDialog({
  open,
  onOpenChange,
  orderId,
  orderDetails,
}: ReportIssueDialogProps) {
  const [createTicket, { isLoading: isSubmitting }] = useCreateTicketMutation();
  const [getPresignedUrl] = useGetPresignedUrlMutation();

  /* ── form state ── */
  const [type, setType] = useState<TicketType | ''>('');
  const [reason, setReason] = useState('');
  const [proof, setProof] = useState('');
  const [items, setItems] = useState<Record<string, ItemSelection>>(() =>
    Object.fromEntries(orderDetails.map((d) => [d.id, defaultItemState()]))
  );

  /* ── upload & preview state ── */
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mediaPreviews, setMediaPreviews] = useState<{ url: string; type: 'image' | 'video' }[]>(
    []
  );

  /* ── field errors ── */
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* ── helpers ── */

  const updateItem = (id: string, patch: Partial<ItemSelection>) =>
    setItems((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const clearError = (...keys: string[]) =>
    setErrors((prev) => {
      const next = { ...prev };
      keys.forEach((k) => delete next[k]);
      return next;
    });

  const resetForm = () => {
    setType('');
    setReason('');
    setProof('');
    setItems(Object.fromEntries(orderDetails.map((d) => [d.id, defaultItemState()])));
    setErrors({});

    mediaPreviews.forEach((media) => URL.revokeObjectURL(media.url));
    setMediaPreviews([]);
  };

  /* ── file upload logic ── */

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
    setMediaPreviews((prev) => [...prev, { url: localUrl, type: mediaType }]);

    try {
      setIsUploading(true);

      const { presignedUrl, path } = await getPresignedUrl({
        contentType: file.type,
        folder: 'support-tickets',
        path: `support-tickets/${orderId}/${Date.now()}_${file.name}`,
        fileName: file.name,
      }).unwrap();

      await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      const currentProof = proof.trim();
      const newProof = currentProof ? `${currentProof}, ${path}` : path;

      setProof(newProof);
      clearError('proof');
      toast.success('File uploaded successfully!');
    } catch (error) {
      console.error('Upload Error:', error);
      toast.error('File upload failed', {
        description: 'Please check your connection or try a smaller file.',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  /* ── validation ── */

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!type) newErrors.type = 'Please select a request type.';
    if (reason.trim().length < 10) newErrors.reason = 'Reason must be at least 10 characters.';
    if (!isValidInput(proof))
      newErrors.proof = 'Please provide a link or upload photo/video evidence.';

    const selectedItems = orderDetails.filter((d) => items[d.id]?.selected);
    if (selectedItems.length === 0) newErrors.items = 'Please select at least one product.';

    if (type === 'ReplaceDrive') {
      selectedItems.forEach((d) => {
        const item = items[d.id];
        if (!item.driveId) newErrors[`driveId_${d.id}`] = 'Please select a drive to replace.';
        if (!item.quantity || item.quantity < 1)
          newErrors[`qty_${d.id}`] = 'Minimum quantity is 1.';
      });
    }

    if (type === 'Exchange') {
      selectedItems.forEach((d) => {
        const item = items[d.id];
        if (!item.quantity || item.quantity < 1)
          newErrors[`qty_${d.id}`] = 'Minimum quantity is 1.';
        if (item.quantity > d.quantity)
          newErrors[`qty_${d.id}`] = `Maximum quantity is ${d.quantity}.`;
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ── submit ── */

  const handleSubmit = async () => {
    if (!validate() || !type) return;

    const details: CreateTicketDetailDto[] = orderDetails
      .filter((d) => items[d.id]?.selected)
      .map((d) => {
        const item = items[d.id];
        const detail: CreateTicketDetailDto = {
          orderDetailId: d.id,
          quantity: Number(item.quantity),
        };

        if (type === 'ReplaceDrive' && item.driveId) {
          detail.driveId = item.driveId;
        }

        const trimmedNote = item.note.trim();
        if (trimmedNote) {
          detail.note = trimmedNote;
        }

        return detail;
      });

    try {
      await createTicket({
        orderId,
        type,
        reason: reason.trim(),
        proof: proof.trim(),
        details,
      }).unwrap();

      toast.success('Support request submitted successfully!', {
        description: 'We will review and respond as soon as possible.',
      });
      resetForm();
      onOpenChange(false);
    } catch {
      toast.error('Unable to submit request.', {
        description: 'An error occurred. Please try again later.',
      });
    }
  };

  const handleClose = () => {
    if (isSubmitting || isUploading) return;
    resetForm();
    onOpenChange(false);
  };

  const isReplaceDrive = type === 'ReplaceDrive';
  const isExchange = type === 'Exchange';

  /* ── render ── */

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-blue-900" />
            Report Order Issue
          </DialogTitle>
          <DialogDescription>
            Describe the issue you encountered. We will process it as soon as possible.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          {/* ── Ticket type ── */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="ticket-type" className="font-semibold">
              support ticket type <span className="text-blue-900">*</span>
            </Label>
            <Select
              value={type}
              onValueChange={(v) => {
                setType(v as TicketType);
                clearError('type');
                setItems((prev) =>
                  Object.fromEntries(
                    Object.entries(prev).map(([id, state]) => [
                      id,
                      { ...state, driveId: '', quantity: 1 },
                    ])
                  )
                );
              }}
            >
              <SelectTrigger id="ticket-type" className={errors.type ? 'border-blue-900' : ''}>
                <SelectValue placeholder="Select request type..." />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4} align="start" alignOffset={8}>
                {TICKET_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{t.label}</span>
                      <span className="text-xs text-slate-500">{t.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && <p className="text-xs text-blue-900">{errors.type}</p>}
          </div>

          {/* ── Reason ── */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="reason" className="font-semibold">
              Reason <span className="text-blue-900">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Describe the issue in detail (minimum 10 characters)..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                clearError('reason');
              }}
              className={`min-h-25 resize-none ${errors.reason ? 'border-blue-900' : ''}`}
            />
            <div className="flex items-center justify-between">
              {errors.reason ? <p className="text-xs text-blue-900">{errors.reason}</p> : <span />}
              <span
                className={`text-xs ${reason.length < 10 ? 'text-muted-foreground' : 'text-emerald-600'}`}
              >
                {reason.length} characters
              </span>
            </div>
          </div>

          {/* ── Proof URL & Upload ── */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="proof" className="font-semibold">
              Evidence (Link or Upload Photo/Video) <span className="text-blue-900">*</span>
            </Label>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <LinkIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  id="proof"
                  placeholder="Enter link or upload file..."
                  value={proof}
                  onChange={(e) => {
                    setProof(e.target.value);
                    clearError('proof');
                  }}
                  className={`pl-9 ${errors.proof ? 'border-blue-900' : ''}`}
                  // Vô hiệu hóa ô nhập Link nếu người dùng ĐÃ tải file lên (tuỳ chọn, bạn có thể bỏ dòng này nếu muốn cho phép cả 2)
                  disabled={mediaPreviews.length > 0}
                />
              </div>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                // Chỉ nhận ảnh hoặc video
                accept="image/*,video/*"
                onChange={handleFileUpload}
              />
              <Button
                type="button"
                variant="outline"
                className="shrink-0 gap-2"
                onClick={() => fileInputRef.current?.click()}
                // Vô hiệu hóa nút Upload nếu đang upload HOẶC đã có 1 file được tải lên
                disabled={isUploading || mediaPreviews.length >= 1}
              >
                {isUploading ? (
                  <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
                ) : (
                  <UploadCloud className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Upload</span>
              </Button>
            </div>

            {errors.proof ? (
              <p className="text-xs text-blue-900">{errors.proof}</p>
            ) : (
              <p className="text-muted-foreground text-xs">
                Provide a link OR upload 1 media file (photo or video).
              </p>
            )}

            {mediaPreviews.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-3">
                {/* Cắt mảng chỉ lấy 1 phần tử đầu tiên để đảm bảo UI không bao giờ hiện > 1 file */}
                {mediaPreviews.slice(0, 1).map((media, idx) => (
                  <div
                    key={idx}
                    className="border-border bg-muted/20 relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border"
                  >
                    {media.type === 'video' ? (
                      <video src={media.url} className="h-full w-full object-cover" controls />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={media.url}
                        alt={`Upload preview ${idx}`}
                        className="h-full w-full object-cover"
                      />
                    )}

                    {/* Gợi ý: Bạn nên có 1 nút X (Xóa) ở đây để user có thể xóa file đã up và chọn file khác */}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* ── Item selection ── */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Package className="text-brand h-4 w-4" />
              <Label className="font-semibold">
                Select Related Products <span className="text-blue-900">*</span>
              </Label>
            </div>
            {errors.items && <p className="text-xs text-blue-900">{errors.items}</p>}

            <div className="flex flex-col gap-3">
              {orderDetails.map((detail) => {
                const itemState = items[detail.id] ?? defaultItemState();
                const isSelected = itemState.selected;
                const productId: string =
                  (detail.productDetails as { productId?: string } | undefined)?.productId ?? '';
                const productSlug: string =
                  (detail.productDetails as { slug?: string } | undefined)?.slug ?? '';

                return (
                  <div
                    key={detail.id}
                    className={`border-border rounded-lg border p-4 transition-colors ${
                      isSelected ? 'bg-brand/5 border-brand/30' : 'bg-muted/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={`item-${detail.id}`}
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          updateItem(detail.id, { selected: !!checked, driveId: '', quantity: 1 });
                          clearError('items', `driveId_${detail.id}`, `qty_${detail.id}`);
                        }}
                        className="mt-0.5"
                      />
                      {detail.thumbnailUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={detail.thumbnailUrl}
                          alt={detail.productName ?? ''}
                          className="border-border h-12 w-12 shrink-0 rounded-md border object-cover"
                        />
                      )}
                      <label htmlFor={`item-${detail.id}`} className="flex-1 cursor-pointer">
                        <p className="text-foreground text-sm leading-tight font-semibold">
                          {detail.productName || detail.sku || detail.id}
                        </p>
                        {detail.variantName && (
                          <p className="text-muted-foreground mt-0.5 text-xs">
                            Variant: {detail.variantName}
                          </p>
                        )}
                        <p className="text-muted-foreground mt-1 text-xs">
                          Quantity: {detail.quantity}
                        </p>
                      </label>
                    </div>

                    {isSelected && (
                      <div className="mt-4 flex flex-col gap-4 pl-7">
                        <div className="flex flex-col gap-1">
                          <Label className="text-xs font-medium">Note for this product</Label>
                          <Input
                            placeholder="Add a note (optional)..."
                            value={itemState.note}
                            onChange={(e) => updateItem(detail.id, { note: e.target.value })}
                            className="h-8 text-sm"
                          />
                        </div>

                        {/* ── Exchange: quantity only ── */}
                        {isExchange && (
                          <div className="flex flex-col gap-1">
                            <Label className="text-xs font-medium">
                              Exchange Quantity <span className="text-blue-900">*</span>
                            </Label>
                            <Input
                              type="number"
                              min={1}
                              max={detail.quantity}
                              value={itemState.quantity}
                              onChange={(e) => {
                                const rawValue = e.target.value;

                                // 1. Cho phép xoá trống input để gõ số mới
                                if (rawValue === '') {
                                  updateItem(detail.id, { quantity: 0 });
                                  return;
                                }

                                let numVal = parseInt(rawValue, 10);

                                if (numVal > detail.quantity) {
                                  numVal = detail.quantity;
                                } else if (numVal < 1) {
                                  numVal = 1;
                                }

                                updateItem(detail.id, { quantity: numVal });
                                clearError(`qty_${detail.id}`);
                              }}
                              onBlur={(e) => {
                                const finalValue = Number(e.target.value);
                                if (!e.target.value || isNaN(finalValue) || finalValue < 1) {
                                  updateItem(detail.id, { quantity: 1 });
                                }
                              }}
                              className={`h-8 w-24 text-sm ${
                                errors[`qty_${detail.id}`] ? 'border-blue-900' : ''
                              }`}
                            />
                            <p className="text-muted-foreground text-xs">Max: {detail.quantity}</p>
                            {errors[`qty_${detail.id}`] && (
                              <p className="text-xs text-blue-900">{errors[`qty_${detail.id}`]}</p>
                            )}
                          </div>
                        )}

                        {/* ── ReplaceDrive: drive selector + quantity ── */}
                        {isReplaceDrive && (
                          <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-1.5">
                              <Label className="text-xs font-medium">
                                <HardDrive className="mr-1 inline h-3 w-3" />
                                Drive to Replace <span className="text-blue-900">*</span>
                              </Label>

                              {productSlug ? (
                                <DriveSelector
                                  productSlug={productSlug}
                                  value={itemState.driveId}
                                  onChange={(driveId) => {
                                    updateItem(detail.id, { driveId });
                                    clearError(`driveId_${detail.id}`);
                                  }}
                                  hasError={!!errors[`driveId_${detail.id}`]}
                                />
                              ) : (
                                <div className="flex h-9 items-center gap-2 rounded-md border border-blue-900/40 bg-blue-50 px-3 text-xs text-blue-900">
                                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                  Product information not found to load drives.
                                </div>
                              )}
                              {errors[`driveId_${detail.id}`] && (
                                <p className="text-xs text-blue-900">
                                  {errors[`driveId_${detail.id}`]}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-col gap-1">
                              <Label className="text-xs font-medium">
                                Replacement Quantity <span className="text-blue-900">*</span>
                              </Label>
                              <Input
                                type="number"
                                min={1}
                                max={detail.quantity}
                                value={itemState.quantity}
                                onChange={(e) => {
                                  updateItem(detail.id, { quantity: Number(e.target.value) });
                                  clearError(`qty_${detail.id}`);
                                }}
                                className={`h-8 w-24 text-sm ${
                                  errors[`qty_${detail.id}`] ? 'border-blue-900' : ''
                                }`}
                              />
                              {errors[`qty_${detail.id}`] && (
                                <p className="text-xs text-blue-900">
                                  {errors[`qty_${detail.id}`]}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting || isUploading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isUploading}
            className="min-w-30"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Submit Request
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

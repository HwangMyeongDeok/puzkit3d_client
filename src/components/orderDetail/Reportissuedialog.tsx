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
  Wrench,
  UploadCloud,
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
  useGetProductPartsQuery,
  type TicketType,
  type CreateTicketDetailDto,
} from '@/lib/api/endpoints/supportTicketApi';

// !!! ĐỪNG QUÊN IMPORT MUTATION UPLOAD CỦA ÔNG VÀO ĐÂY NHÉ !!!
import { useGetPresignedUrlMutation } from '@/lib/api/endpoints/uploadApi';

/* ------------------------------------------------------------------ */
/* Constants — Return is intentionally excluded                      */
/* ------------------------------------------------------------------ */

const TICKET_TYPES: { value: TicketType; label: string; description: string }[] = [
  {
    value: 'ReplacePart',
    label: 'Replace Part',
    description: 'Request replacement for missing or damaged parts',
  },
  {
    value: 'Exchange',
    label: 'Exchange',
    description: 'Exchange for a different product',
  },
];

/* ------------------------------------------------------------------ */
/* Per-item state                                                    */
/* ------------------------------------------------------------------ */

interface ItemSelection {
  selected: boolean;
  partId: string;
  quantity: number;
  note: string;
}

function defaultItemState(): ItemSelection {
  return { selected: false, partId: '', quantity: 1, note: '' };
}

/* ------------------------------------------------------------------ */
/* URL validation (Relaxed a bit to allow multiple comma-separated)  */
/* ------------------------------------------------------------------ */

function isValidInput(value: string): boolean {
  // Chỉ cần có nội dung là tạm chấp nhận vì có thể là path từ S3 hoặc link youtube
  return value.trim().length > 0;
}

/* ------------------------------------------------------------------ */
/* Part selector sub-component                                       */
/* ------------------------------------------------------------------ */

interface PartSelectorProps {
  productId: string;
  value: string;
  onChange: (partId: string) => void;
  hasError: boolean;
}

function PartSelector({ productId, value, onChange, hasError }: PartSelectorProps) {
  const {
    data: parts,
    isLoading,
    isError,
  } = useGetProductPartsQuery(productId, {
    skip: !productId,
  });

  if (isLoading) {
    return (
      <div className="border-input bg-muted/30 text-muted-foreground flex h-9 items-center gap-2 rounded-md border px-3 text-sm">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Loading parts list...
      </div>
    );
  }

  if (isError || !parts) {
    return (
      <div className="border-destructive/40 bg-destructive/5 text-destructive flex h-9 items-center gap-2 rounded-md border px-3 text-sm">
        <AlertTriangle className="h-3.5 w-3.5" />
        Failed to load parts. Try again later.
      </div>
    );
  }

  if (parts.length === 0) {
    return (
      <div className="border-input bg-muted/30 text-muted-foreground flex h-9 items-center gap-2 rounded-md border px-3 text-sm">
        This product has no parts available for replacement.
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={hasError ? 'border-destructive' : ''}>
        <SelectValue placeholder="Select part to replace..." />
      </SelectTrigger>
      <SelectContent>
        {parts.map((part) => (
          <SelectItem key={part.id} value={part.id}>
            <div className="flex flex-col gap-0.5">
              <span className="font-medium">{part.name}</span>
              <span className="text-muted-foreground text-xs">
                Code: {part.code} &bull; Type: {part.partType} &bull; {part.totalPieces} pcs
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/* ------------------------------------------------------------------ */
/* Props                                                             */
/* ------------------------------------------------------------------ */

interface ReportIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  orderDetails: OrderDetailDto[];
}

/* ------------------------------------------------------------------ */
/* Main component                                                    */
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

  /* ── upload state ── */
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  };

  /* ── file upload logic ── */

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // 1. Gọi API lấy Presigned URL
      const { presignedUrl, path } = await getPresignedUrl({
        contentType: file.type,
        folder: 'support-tickets',
        path: `support-tickets/${orderId}/${Date.now()}_${file.name}`,
        fileName: file.name,
      }).unwrap();

      // 2. Upload file trực tiếp lên Storage (S3/Cloud) bằng fetch (PUT)
      await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      // 3. Nối cái path mới vào state proof hiện tại (Cho phép nhập nhiều link)
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
      // Reset input file để có thể up lại cùng 1 file nếu cần
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

    if (type === 'ReplacePart') {
      selectedItems.forEach((d) => {
        const item = items[d.id];
        if (!item.partId) newErrors[`partId_${d.id}`] = 'Please select a part to replace.';
        if (!item.quantity || item.quantity < 1)
          newErrors[`qty_${d.id}`] = 'Minimum quantity is 1.';
      });
    }

    // ── Validate quantity for Exchange ──
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

        if (type === 'ReplacePart' && item.partId) {
          detail.partId = item.partId;
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

  const isReplacePart = type === 'ReplacePart';
  const isExchange = type === 'Exchange';

  /* ── render ── */

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
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
              Request Type <span className="text-destructive">*</span>
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
                      { ...state, partId: '', quantity: 1 },
                    ])
                  )
                );
              }}
            >
              <SelectTrigger id="ticket-type" className={errors.type ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select request type..." />
              </SelectTrigger>
              <SelectContent>
                {TICKET_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{t.label}</span>
                      <span className="text-muted-foreground text-xs">{t.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && <p className="text-destructive text-xs">{errors.type}</p>}
          </div>

          {/* ── Reason ── */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="reason" className="font-semibold">
              Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Describe the issue in detail (minimum 10 characters)..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                clearError('reason');
              }}
              className={`min-h-25 resize-none ${errors.reason ? 'border-destructive' : ''}`}
            />
            <div className="flex items-center justify-between">
              {errors.reason ? (
                <p className="text-destructive text-xs">{errors.reason}</p>
              ) : (
                <span />
              )}
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
              Evidence (YouTube Link or Upload Photo/Video){' '}
              <span className="text-destructive">*</span>
            </Label>

            <div className="flex items-center gap-2">
              {/* Input Link */}
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
                  className={`pl-9 ${errors.proof ? 'border-destructive' : ''}`}
                />
              </div>

              {/* Upload Button */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,video/*"
                onChange={handleFileUpload}
              />
              <Button
                type="button"
                variant="outline"
                className="shrink-0 gap-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
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
              <p className="text-destructive text-xs">{errors.proof}</p>
            ) : (
              <p className="text-muted-foreground text-xs">
                You can enter multiple links separated by commas.
              </p>
            )}
          </div>

          <Separator />

          {/* ── Item selection ── */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Package className="text-brand h-4 w-4" />
              <Label className="font-semibold">
                Select Related Products <span className="text-destructive">*</span>
              </Label>
            </div>
            {errors.items && <p className="text-destructive text-xs">{errors.items}</p>}

            <div className="flex flex-col gap-3">
              {orderDetails.map((detail) => {
                const itemState = items[detail.id] ?? defaultItemState();
                const isSelected = itemState.selected;
                const productId: string =
                  (detail.productDetails as { productId?: string } | undefined)?.productId ?? '';

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
                          updateItem(detail.id, { selected: !!checked, partId: '', quantity: 1 });
                          clearError('items', `partId_${detail.id}`, `qty_${detail.id}`);
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
                              Exchange Quantity <span className="text-destructive">*</span>
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
                                errors[`qty_${detail.id}`] ? 'border-destructive' : ''
                              }`}
                            />
                            <p className="text-muted-foreground text-xs">Max: {detail.quantity}</p>
                            {errors[`qty_${detail.id}`] && (
                              <p className="text-destructive text-xs">
                                {errors[`qty_${detail.id}`]}
                              </p>
                            )}
                          </div>
                        )}

                        {/* ── ReplacePart: part selector + quantity ── */}
                        {isReplacePart && (
                          <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-1.5">
                              <Label className="text-xs font-medium">
                                <Wrench className="mr-1 inline h-3 w-3" />
                                Part to Replace <span className="text-destructive">*</span>
                              </Label>

                              {productId ? (
                                <PartSelector
                                  productId={productId}
                                  value={itemState.partId}
                                  onChange={(partId) => {
                                    updateItem(detail.id, { partId });
                                    clearError(`partId_${detail.id}`);
                                  }}
                                  hasError={!!errors[`partId_${detail.id}`]}
                                />
                              ) : (
                                <div className="flex h-9 items-center gap-2 rounded-md border border-yellow-400/40 bg-yellow-50 px-3 text-xs text-yellow-700">
                                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                  Product information not found to load parts.
                                </div>
                              )}
                              {errors[`partId_${detail.id}`] && (
                                <p className="text-destructive text-xs">
                                  {errors[`partId_${detail.id}`]}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-col gap-1">
                              <Label className="text-xs font-medium">
                                Replacement Quantity <span className="text-destructive">*</span>
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
                                  errors[`qty_${detail.id}`] ? 'border-destructive' : ''
                                }`}
                              />
                              {errors[`qty_${detail.id}`] && (
                                <p className="text-destructive text-xs">
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

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
    label: 'Thay thế linh kiện',
    description: 'Yêu cầu thay thế bộ phận bị thiếu hoặc hỏng',
  },
  {
    value: 'Exchange',
    label: 'Đổi hàng',
    description: 'Đổi sang sản phẩm khác',
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
        Đang tải danh sách linh kiện...
      </div>
    );
  }

  if (isError || !parts) {
    return (
      <div className="border-destructive/40 bg-destructive/5 text-destructive flex h-9 items-center gap-2 rounded-md border px-3 text-sm">
        <AlertTriangle className="h-3.5 w-3.5" />
        Không thể tải linh kiện. Thử lại sau.
      </div>
    );
  }

  if (parts.length === 0) {
    return (
      <div className="border-input bg-muted/30 text-muted-foreground flex h-9 items-center gap-2 rounded-md border px-3 text-sm">
        Sản phẩm này không có linh kiện để thay thế.
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={hasError ? 'border-destructive' : ''}>
        <SelectValue placeholder="Chọn linh kiện cần thay..." />
      </SelectTrigger>
      <SelectContent>
        {parts.map((part) => (
          <SelectItem key={part.id} value={part.id}>
            <div className="flex flex-col gap-0.5">
              <span className="font-medium">{part.name}</span>
              <span className="text-muted-foreground text-xs">
                Mã: {part.code} &bull; Loại: {part.partType} &bull; {part.totalPieces} mảnh
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
      toast.success('Tải tệp lên thành công!');
    } catch (error) {
      console.error('Upload Error:', error);
      toast.error('Tải tệp thất bại', {
        description: 'Vui lòng kiểm tra lại kết nối hoặc thử file nhỏ hơn.',
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

    if (!type) newErrors.type = 'Vui lòng chọn loại yêu cầu.';
    if (reason.trim().length < 10) newErrors.reason = 'Lý do cần ít nhất 10 ký tự.';
    if (!isValidInput(proof))
      newErrors.proof = 'Vui lòng cung cấp link hoặc upload ảnh/video bằng chứng.';

    const selectedItems = orderDetails.filter((d) => items[d.id]?.selected);
    if (selectedItems.length === 0) newErrors.items = 'Vui lòng chọn ít nhất một sản phẩm.';

    if (type === 'ReplacePart') {
      selectedItems.forEach((d) => {
        const item = items[d.id];
        if (!item.partId) newErrors[`partId_${d.id}`] = 'Vui lòng chọn linh kiện cần thay.';
        if (!item.quantity || item.quantity < 1)
          newErrors[`qty_${d.id}`] = 'Số lượng tối thiểu là 1.';
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

      toast.success('Yêu cầu hỗ trợ đã được gửi thành công!', {
        description: 'Chúng tôi sẽ xem xét và phản hồi sớm nhất có thể.',
      });
      resetForm();
      onOpenChange(false);
    } catch {
      toast.error('Không thể gửi yêu cầu.', {
        description: 'Đã có lỗi xảy ra. Vui lòng thử lại sau.',
      });
    }
  };

  const handleClose = () => {
    if (isSubmitting || isUploading) return;
    resetForm();
    onOpenChange(false);
  };

  const isReplacePart = type === 'ReplacePart';

  /* ── render ── */

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Báo cáo sự cố đơn hàng
          </DialogTitle>
          <DialogDescription>
            Mô tả vấn đề bạn gặp phải. Chúng tôi sẽ xử lý trong thời gian sớm nhất.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          {/* ── Ticket type ── */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="ticket-type" className="font-semibold">
              Loại yêu cầu <span className="text-destructive">*</span>
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
                <SelectValue placeholder="Chọn loại yêu cầu..." />
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
              Lý do <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Mô tả chi tiết vấn đề của bạn (tối thiểu 10 ký tự)..."
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
                {reason.length} ký tự
              </span>
            </div>
          </div>

          {/* ── Proof URL & Upload ── */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="proof" className="font-semibold">
              Bằng chứng (Link YouTube hoặc Upload Ảnh/Video){' '}
              <span className="text-destructive">*</span>
            </Label>

            <div className="flex items-center gap-2">
              {/* Input Link */}
              <div className="relative flex-1">
                <LinkIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  id="proof"
                  placeholder="Nhập link hoặc tải file lên..."
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
                Có thể nhập nhiều link ngăn cách bằng dấu phẩy.
              </p>
            )}
          </div>

          <Separator />

          {/* ── Item selection ── */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Package className="text-brand h-4 w-4" />
              <Label className="font-semibold">
                Chọn sản phẩm liên quan <span className="text-destructive">*</span>
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
                            Phân loại: {detail.variantName}
                          </p>
                        )}
                        <p className="text-muted-foreground mt-1 text-xs">
                          Số lượng: {detail.quantity}
                        </p>
                      </label>
                    </div>

                    {isSelected && (
                      <div className="mt-4 flex flex-col gap-4 pl-7">
                        <div className="flex flex-col gap-1">
                          <Label className="text-xs font-medium">Ghi chú cho sản phẩm này</Label>
                          <Input
                            placeholder="Thêm ghi chú (tùy chọn)..."
                            value={itemState.note}
                            onChange={(e) => updateItem(detail.id, { note: e.target.value })}
                            className="h-8 text-sm"
                          />
                        </div>

                        {isReplacePart && (
                          <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-1.5">
                              <Label className="text-xs font-medium">
                                <Wrench className="mr-1 inline h-3 w-3" />
                                Linh kiện cần thay <span className="text-destructive">*</span>
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
                                  Không tìm thấy thông tin sản phẩm để tải linh kiện.
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
                                Số lượng cần thay <span className="text-destructive">*</span>
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
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isUploading}
            className="min-w-30"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Gửi yêu cầu
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

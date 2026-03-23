'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  useGetCustomerOrderByIdQuery,
  useCompleteOrderMutation,
} from '@/lib/api/endpoints/orderApi';
import type { OrderDetailDto } from '@/types/api/order.api.types';
import type { InstockOrderStatus } from '@/types';
import { ORDER_STATUS_MAP, ORDER_STEPPER_STEPS } from '@/constants';
import OrderStepper from '@/components/custom/OrderStepper';
import ReportIssueDialog from '@/components/ticket/Reportissuedialog';
import { toast } from 'sonner';
import {
  Loader2,
  ArrowLeft,
  Package,
  User,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Banknote,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

/* ------------------------------------------------------------------ */
/*  Status badge                                                       */
/* ------------------------------------------------------------------ */

const colorMap: Record<string, string> = {
  yellow: 'border-yellow-500/20  bg-yellow-500/10  text-yellow-600',
  blue: 'border-blue-500/20    bg-blue-500/10    text-blue-600',
  indigo: 'border-indigo-500/20  bg-indigo-500/10  text-indigo-600',
  violet: 'border-violet-500/20  bg-violet-500/10  text-violet-600',
  emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600',
  green: 'border-green-500/20   bg-green-500/10   text-green-600',
  red: 'bg-destructive/10     text-destructive   border-destructive/20',
  orange: 'border-orange-500/20  bg-orange-500/10  text-orange-600',
  rose: 'border-rose-500/20    bg-rose-500/10    text-rose-600',
};

const badgeBase = 'rounded-md border px-3 py-1.5 text-sm font-semibold tracking-wider uppercase';

function StatusBadge({ status }: { status?: InstockOrderStatus }) {
  const info = status ? ORDER_STATUS_MAP[status] : undefined;
  if (!info) {
    return (
      <span className={`${badgeBase} bg-muted text-muted-foreground border-border`}>
        Không xác định
      </span>
    );
  }
  return <span className={`${badgeBase} ${colorMap[info.color] ?? ''}`}>{info.label}</span>;
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = params.id;

  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false);

  const {
    data: order,
    isLoading: isOrderLoading,
    isError: isOrderError,
  } = useGetCustomerOrderByIdQuery(orderId!, {
    refetchOnMountOrArgChange: true,
    skip: !orderId,
  });

  const [completeOrder, { isLoading: isCompleting }] = useCompleteOrderMutation();

  /* ---- loading / error states ---- */

  if (isOrderLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <Loader2 className="text-brand h-10 w-10 animate-spin" />
        <p className="text-muted-foreground">Đang tải chi tiết đơn hàng...</p>
      </div>
    );
  }

  if (isOrderError || !order) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <h2 className="text-xl font-bold">Không tìm thấy đơn hàng</h2>
        <p className="text-muted-foreground">Đơn hàng không tồn tại hoặc bạn không có quyền xem.</p>
        <Button onClick={() => router.back()} variant="outline">
          Quay lại
        </Button>
      </div>
    );
  }

  /* ---- stepper ---- */
  const isCOD = order.paymentMethod === 'COD';
  const stepperSteps = isCOD
    ? ORDER_STEPPER_STEPS.filter((s) => s !== 'Đã thanh toán')
    : [...ORDER_STEPPER_STEPS];
  const statusInfo = order.status
    ? ORDER_STATUS_MAP[order.status as InstockOrderStatus]
    : undefined;
  const activeStep = statusInfo
    ? Math.max(0, (stepperSteps as string[]).indexOf(statusInfo.label))
    : 0;

  /* ---- Visibility logic ---- */
  const currentStatus = order.status as InstockOrderStatus | undefined;

  // Show "Complete Order" only when status is Delivered
  const canComplete = currentStatus === 'Delivered';

  // Hide "Report Issue" once order is Completed
  const canReport = !!order.orderDetails?.length && currentStatus !== 'Completed';

  /* ---- Handler ---- */
  const handleConfirmComplete = async () => {
    try {
      await completeOrder(order.id).unwrap();
      setConfirmCompleteOpen(false);
      toast.success('Xác nhận nhận hàng thành công!', {
        description: 'Cảm ơn bạn đã mua hàng. Đơn hàng đã được hoàn tất.',
      });
    } catch {
      toast.error('Xác nhận thất bại', {
        description: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
      });
    }
  };

  /* ---------------------------------------------------------------- */
  return (
    <div className="container-custom py-8 lg:py-12">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            size="icon"
            className="hover:bg-muted shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold md:text-3xl">Chi tiết đơn hàng</h1>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* ========== LEFT COLUMN ========== */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* Status Header Card */}
            <div className="bg-card border-border flex flex-col gap-4 rounded-xl border p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
                    Mã đơn hàng
                  </p>
                  <p className="text-foreground mt-1 text-2xl font-bold uppercase">
                    #{order.code || order.id.split('-')[0]}
                  </p>
                  {order.createdAt && (
                    <p className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-start gap-2 md:items-end md:text-right">
                  <p className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
                    Trạng thái
                  </p>
                  <StatusBadge status={order.status} />

                  <div className="mt-1 flex flex-col items-end gap-2">
                    {/* ── Complete Order button (only when Delivered) ── */}
                    {canComplete && (
                      <Button
                        variant="default"
                        size="sm"
                        className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
                        onClick={() => setConfirmCompleteOpen(true)}
                        disabled={isCompleting}
                      >
                        {isCompleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                        Đã nhận được hàng
                      </Button>
                    )}

                    {/* ── Report Issue button (hidden when Completed) ── */}
                    {canReport && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 border-orange-500/40 text-orange-600 hover:bg-orange-50"
                        onClick={() => setReportDialogOpen(true)}
                      >
                        <AlertTriangle className="h-4 w-4" />
                        Báo cáo sự cố
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {activeStep >= 0 && (
                <div className="border-border border-t pt-4">
                  <OrderStepper
                    steps={stepperSteps}
                    activeStep={activeStep}
                    isPaid={order.isPaid}
                  />
                </div>
              )}
            </div>

            {/* Products List Card */}
            <div className="bg-card border-border flex flex-col gap-4 rounded-xl border p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
                <Package className="text-brand h-5 w-5" />
                Sản phẩm đã đặt ({order.orderDetails?.length || 0})
              </h3>

              {order.orderDetails && order.orderDetails.length > 0 ? (
                <div className="flex flex-col">
                  {order.orderDetails.map((item: OrderDetailDto, idx) => (
                    <div key={item.id}>
                      {idx > 0 && <Separator className="my-5" />}
                      <div className="flex items-start gap-4">
                        <div className="bg-muted h-16 w-16 shrink-0 overflow-hidden rounded-md border shadow-sm sm:h-24 sm:w-24">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.thumbnailUrl || ''}
                            alt={item.productName || ''}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:justify-between">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-foreground hover:text-brand cursor-pointer text-base leading-tight font-semibold transition-colors">
                              {item.productName || item.sku || item.id}
                            </span>
                            {item.variantName && (
                              <span className="text-muted-foreground text-sm">
                                Phân loại:{' '}
                                <span className="text-foreground font-medium">
                                  {item.variantName}
                                </span>
                              </span>
                            )}
                            <div className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                              <span>{item.unitPrice?.toLocaleString('vi-VN') || 0} ₫</span>
                              <span>✕</span>
                              <span className="text-foreground font-semibold">{item.quantity}</span>
                            </div>
                          </div>
                          <span className="text-brand text-lg font-bold whitespace-nowrap">
                            {item.totalAmount ? item.totalAmount.toLocaleString('vi-VN') : 0} ₫
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-muted/20 rounded-lg border border-dashed py-8 text-center">
                  <Package className="text-muted-foreground/50 mx-auto mb-2 h-8 w-8" />
                  <p className="text-muted-foreground text-sm italic">Không có dữ liệu sản phẩm.</p>
                </div>
              )}
            </div>
          </div>

          {/* ========== RIGHT COLUMN ========== */}
          <div className="flex flex-col gap-6">
            {/* Customer Info Card */}
            <div className="bg-card border-border flex flex-col gap-5 rounded-xl border p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <User className="text-brand h-5 w-5" />
                Thông tin nhận hàng
              </h3>

              <div className="bg-muted/30 border-border/50 flex flex-col gap-3 rounded-lg border p-4 text-sm">
                <div className="flex items-center gap-3">
                  <User className="text-muted-foreground h-4 w-4 shrink-0" />
                  <p className="font-semibold">{order.customerName}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="text-muted-foreground h-4 w-4 shrink-0" />
                  <p className="text-muted-foreground">{order.customerPhone}</p>
                </div>
                {order.customerEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="text-muted-foreground h-4 w-4 shrink-0" />
                    <p className="text-muted-foreground truncate">{order.customerEmail}</p>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="mb-3 flex items-center gap-2 text-base font-bold">
                  <MapPin className="text-brand h-4 w-4" />
                  Địa chỉ giao hàng
                </h3>
                <p className="text-muted-foreground bg-muted/30 border-border/50 rounded-lg border p-4 text-sm leading-relaxed">
                  {order.customerWardName}, {order.customerDistrictName},{' '}
                  {order.customerProvinceName}
                </p>
              </div>
            </div>

            {/* Payment Summary Card */}
            <div className="bg-card border-border flex flex-col gap-5 rounded-xl border p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <Banknote className="text-brand h-5 w-5" />
                Chi tiết thanh toán
              </h3>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Phương thức:</span>
                  <span className="bg-secondary text-secondary-foreground rounded-md px-2.5 py-1 text-xs font-medium tracking-wider uppercase">
                    {order.paymentMethod || 'COD'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Trạng thái:</span>
                  {order.isPaid ? (
                    <span className="text-success flex items-center gap-1.5 font-medium">
                      <div className="bg-success h-2 w-2 rounded-full" /> Đã thanh toán
                    </span>
                  ) : (
                    <span className="text-warning flex items-center gap-1.5 font-medium">
                      <div className="bg-warning h-2 w-2 rounded-full" /> Chờ thanh toán
                    </span>
                  )}
                </div>
              </div>

              <Separator className="border-dashed" />

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tạm tính:</span>
                  <span className="font-medium">
                    {order.subTotalAmount?.toLocaleString('vi-VN') || 0} ₫
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Phí vận chuyển:</span>
                  <span className="font-medium">
                    {order.shippingFee?.toLocaleString('vi-VN') || 0} ₫
                  </span>
                </div>
                {(order.usedCoinAmountAsMoney ?? 0) > 0 && (
                  <div className="text-success flex items-center justify-between">
                    <span>Giảm giá từ xu:</span>
                    <span className="font-medium">
                      -{(order.usedCoinAmountAsMoney ?? 0).toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-brand/5 border-brand/20 mt-2 rounded-lg border p-4">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-brand text-sm tracking-wider uppercase">Tổng cộng</span>
                  <span className="text-brand text-2xl">
                    {order.grandTotalAmount ? order.grandTotalAmount.toLocaleString('vi-VN') : 0} ₫
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Complete Order Confirmation Dialog ── */}
      <AlertDialog open={confirmCompleteOpen} onOpenChange={setConfirmCompleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Xác nhận đã nhận hàng
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn đã nhận đầy đủ hàng hóa và hàng trong tình trạng tốt không? Sau khi
              xác nhận, bạn sẽ không thể yêu cầu hoàn trả, đổi hàng hoặc báo cáo thiếu hàng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCompleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmComplete}
              disabled={isCompleting}
              className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-600"
            >
              {isCompleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Report Issue Dialog ── */}
      {canReport && (
        <ReportIssueDialog
          open={reportDialogOpen}
          onOpenChange={setReportDialogOpen}
          orderId={order.id}
          orderDetails={order.orderDetails!}
        />
      )}
    </div>
  );
}

'use client';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ROUTES } from '@/constants';
import {
  useLazyGetPaymentByOrderIdQuery,
  useCreateTransactionMutation,
} from '@/lib/api/endpoints/paymentApi';

interface PaymentDialogProps {
  open: boolean;
  orderId: string | null;
  onClose: () => void;
}

export default function PaymentActionDialog({ open, orderId, onClose }: PaymentDialogProps) {
  const router = useRouter();
  const [getPayment, { isLoading: isGettingPayment }] = useLazyGetPaymentByOrderIdQuery();
  const [createTransaction, { isLoading: isCreatingTx }] = useCreateTransactionMutation();

  const handlePayNow = async () => {
    if (!orderId) return;
    try {
      const paymentRes = await getPayment(orderId).unwrap();
      const paymentUrl = await createTransaction({
        paymentId: paymentRes.paymentId,
        provider: 'VnPay',
      }).unwrap();
      toast.info('Đang chuyển hướng sang VNPAY...');
      window.location.href = paymentUrl;
    } catch (error) {
      toast.error('Lỗi tạo thanh toán. Bạn có thể thanh toán sau trong Lịch sử đơn hàng.');
      handlePayLater(); // Fallback
    }
  };

  const handlePayLater = () => {
    onClose();
    toast.info('Đã lưu đơn hàng. Bạn có thể thanh toán sau trong Lịch sử đơn hàng.', {
      duration: 5000,
    });
    router.push(ROUTES.ORDERS);
  };

  const isProcessing = isGettingPayment || isCreatingTx;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handlePayLater()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thanh toán trực tuyến</DialogTitle>
          <DialogDescription>
            Đơn hàng của bạn đã được khởi tạo và đang chờ thanh toán. Bạn có muốn thanh toán qua
            cổng VNPAY ngay bây giờ không?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex sm:justify-between">
          <Button variant="outline" onClick={handlePayLater} disabled={isProcessing}>
            Thanh toán sau
          </Button>
          <Button onClick={handlePayNow} disabled={isProcessing}>
            {isProcessing ? 'Đang kết nối...' : 'Thanh toán ngay'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

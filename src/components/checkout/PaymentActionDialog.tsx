'use client';
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
import {
  useLazyGetPaymentByOrderIdQuery,
  useCreateTransactionMutation,
} from '@/lib/api/endpoints/paymentApi';

interface PaymentDialogProps {
  open: boolean;
  orderId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
  mode?: 'checkout' | 'history';
}

export default function PaymentActionDialog({
  open,
  orderId,
  onClose,
  onSuccess,
  mode = 'checkout',
}: PaymentDialogProps) {
  const [getPayment, { isLoading: isGettingPayment }] = useLazyGetPaymentByOrderIdQuery();
  const [createTransaction, { isLoading: isCreatingTx }] = useCreateTransactionMutation();

  const handlePayNow = async () => {
    if (!orderId) return;
    try {
      const paymentRes = await getPayment(orderId).unwrap();

      // Lưu ý: Tạm thời provider vẫn fix cứng 'VnPay' cho API.
      // Nếu sau này bạn có nhiều cổng thanh toán, bạn sẽ cần truyền biến provider này vào linh hoạt nhé.
      const paymentUrl = await createTransaction({
        paymentId: paymentRes.paymentId,
        provider: 'VnPay',
      }).unwrap();

      if (onSuccess) {
        onSuccess();
      }
      toast.info('Redirecting to payment gateway...');

      sessionStorage.removeItem('checkout_active_ids');

      // Chuyển hướng sang cổng thanh toán
      window.location.href = paymentUrl;
    } catch (error) {
      toast.error('Error creating payment. You can pay later in your order history.');
      onClose();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const isProcessing = isGettingPayment || isCreatingTx;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'checkout' ? 'Online Payment' : 'Confirm Payment'}</DialogTitle>
          <DialogDescription>
            {mode === 'checkout'
              ? 'Your order has been created and is pending payment. Would you like to proceed to the secure online payment gateway now?'
              : 'You are about to be redirected to the secure online payment gateway to complete your payment. Do you want to proceed?'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex sm:justify-between">
          <Button variant="outline" onClick={handleCancel} disabled={isProcessing}>
            {mode === 'checkout' ? 'Pay Later' : 'Cancel'}
          </Button>
          <Button onClick={handlePayNow} disabled={isProcessing}>
            {isProcessing ? 'Connecting...' : 'Pay Now'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
import {
  useLazyGetPaymentByOrderIdQuery,
  useCreateTransactionMutation,
} from '@/lib/api/endpoints/paymentApi';
import { ROUTES } from '@/constants';

interface PaymentDialogProps {
  open: boolean;
  orderId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
  redirectRoute?: string;
  orderType?: 'instock' | 'partner';
}

export default function PaymentActionDialog({
  open,
  orderId,
  onClose,
  onSuccess,
  redirectRoute = ROUTES.ORDERS,
  orderType = 'instock',
}: PaymentDialogProps) {
  const router = useRouter();

  const [getPayment, { isLoading: isGettingPayment }] = useLazyGetPaymentByOrderIdQuery();
  const [createTransaction, { isLoading: isCreatingTx }] = useCreateTransactionMutation();

  const isProcessing = isGettingPayment || isCreatingTx;

  const handlePayNow = async () => {
    if (!orderId) return;

    try {
      const paymentRes = await getPayment(orderId).unwrap();

      const paymentUrl = await createTransaction({
        paymentId: paymentRes.paymentId,
        provider: 'VNPAY',
      }).unwrap();

      onSuccess?.();

      sessionStorage.removeItem('checkout_active_ids');
      sessionStorage.setItem('last_payment_order_id', orderId);
      sessionStorage.setItem('last_payment_order_type', orderType);

      toast.info('Opening VNPAY in a new tab...');

      window.open(paymentUrl, '_blank', 'noopener,noreferrer');

      onClose();
      router.push(redirectRoute);
    } catch (error) {
      toast.error('Error creating payment. You can pay later in your order history.');
      onClose();
      router.push(redirectRoute);
    }
  };

  const handlePayLater = () => {
    onClose();
    toast.info('Order saved. You can pay later in your order history.', {
      duration: 5000,
    });
    router.push(redirectRoute);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handlePayLater()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Online Payment</DialogTitle>
          <DialogDescription>
            You are about to be redirected to the secure online payment gateway to complete your
            payment. Do you want to proceed?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 flex sm:justify-between">
          <Button variant="outline" onClick={handlePayLater} disabled={isProcessing}>
            Pay Later
          </Button>
          <Button onClick={handlePayNow} disabled={isProcessing}>
            {isProcessing ? 'Connecting...' : 'Pay Now'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
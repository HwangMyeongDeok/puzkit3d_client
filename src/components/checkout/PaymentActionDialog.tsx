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
      toast.info('Redirecting to VNPAY...');
      window.location.href = paymentUrl;
    } catch (error) {
      toast.error('Error creating payment. You can pay later in your order history.');
      handlePayLater();
    }
  };

  const handlePayLater = () => {
    onClose();
    toast.info('Order saved. You can pay later in your order history.', {
      duration: 5000,
    });
    router.push(ROUTES.ORDERS);
  };

  const isProcessing = isGettingPayment || isCreatingTx;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handlePayLater()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Online Payment</DialogTitle>
          <DialogDescription>
            Your order has been created and is pending payment. Would you like to pay through the
            VNPAY gateway now?
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

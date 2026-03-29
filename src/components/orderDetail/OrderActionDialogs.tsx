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
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

export default function OrderActionDialogs({
  order,
  isCOD,
  isCompleting,
  isCanceling,
  confirmCompleteOpen,
  setConfirmCompleteOpen,
  confirmCancelOpen,
  setConfirmCancelOpen,
  handleConfirmComplete,
  handleCancelOrder,
}: any) {
  // Nếu chưa có order thì khỏi render dialog làm gì cho mệt
  if (!order) return null;

  return (
    <>
      {/* ================= DIALOG: CONFIRM COMPLETE ================= */}
      <AlertDialog open={confirmCompleteOpen} onOpenChange={setConfirmCompleteOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" /> Confirm Received
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-3 text-base leading-relaxed">
              Are you sure you have received all items in good condition?
              <br />
              <br />
              <span className="font-semibold text-slate-700">Note:</span> After confirmation, you
              will not be able to request a return, exchange, or report missing items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel disabled={isCompleting} className="hover:bg-slate-100">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmComplete}
              disabled={isCompleting}
              className="bg-emerald-600 shadow-md hover:bg-emerald-700 focus:ring-emerald-600"
            >
              {isCompleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Yes, I Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ================= DIALOG: CONFIRM CANCEL ================= */}
      <AlertDialog open={confirmCancelOpen} onOpenChange={setConfirmCancelOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl text-red-600">
              <AlertTriangle className="h-6 w-6" /> Cancel Order?
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-3 text-base leading-relaxed text-slate-600">
              Are you sure you want to cancel order{' '}
              <strong>#{order.code || order.id.split('-')[0]}</strong>?
              <br />
              <br />
              {!isCOD ? (
                <>
                  Since you have already paid, <strong>100% of the amount</strong> will be
                  immediately refunded to your wallet as <strong>PuzCoins</strong>. You can use
                  these coins for future purchases.
                </>
              ) : (
                <>
                  This action cannot be undone. You will need to place a new order if you change
                  your mind later.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel disabled={isCanceling} className="hover:bg-slate-100">
              Keep Order
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleCancelOrder();
              }}
              disabled={isCanceling}
              className="bg-red-600 text-white shadow-md hover:bg-red-700 focus:ring-red-600"
            >
              {isCanceling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isCOD ? 'Yes, Cancel Order' : 'Yes, Cancel & Refund'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

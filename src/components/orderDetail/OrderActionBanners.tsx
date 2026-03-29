import { PackageSearch, Wallet, XCircle, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OrderActionBanners({
  canCancel,
  canReport,
  isDelivered,
  isCOD,
  isCanceling,
  isCompleting,
  hasComplaint,
  onCancelClick,
  onCompleteClick,
  onReportClick,
}: any) {
  return (
    <>
      {/* Banner Cancel */}
      {canCancel && (
        <div className="flex flex-col justify-between gap-5 rounded-xl border border-amber-200 bg-linear-to-r from-amber-50 to-orange-50 p-6 shadow-sm transition-all sm:flex-row sm:items-center">
          <div className="flex items-start gap-4 sm:items-center">
            <div className="shrink-0 rounded-full bg-amber-100 p-3">
              {isCOD ? (
                <PackageSearch className="h-6 w-6 text-amber-600" />
              ) : (
                <Wallet className="h-6 w-6 text-amber-600" />
              )}
            </div>
            <div>
              <h4 className="text-lg leading-tight font-bold text-amber-900">
                {isCOD ? 'Order Received' : 'Payment Received'}
              </h4>
              <p className="mt-1 max-w-sm text-sm text-amber-800/80">
                {isCOD
                  ? 'Your order is waiting. You can still cancel this order before we start processing it.'
                  : 'We are preparing your order. You can still cancel this order now and get a 100% refund in PuzCoin.'}
              </p>
            </div>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto">
            <Button
              variant="destructive"
              className="w-full bg-red-600 shadow-md transition-transform hover:-translate-y-0.5 hover:bg-red-700 sm:w-auto"
              onClick={onCancelClick}
              disabled={isCanceling}
            >
              {isCanceling ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              {isCOD ? 'Cancel Order' : 'Cancel & Refund'}
            </Button>
          </div>
        </div>
      )}

      {/* Banner Delivered */}
      {isDelivered && (
        <div className="flex flex-col justify-between gap-5 rounded-xl border border-emerald-200 bg-linear-to-r from-emerald-50 to-teal-50 p-6 shadow-sm transition-all sm:flex-row sm:items-center">
          <div className="flex items-start gap-4 sm:items-center">
            <div className="shrink-0 rounded-full bg-emerald-100 p-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-lg leading-tight font-bold text-emerald-800">
                Package Delivered!
              </h4>
              <p className="mt-1 max-w-sm text-sm text-emerald-700/80">
                Please inspect your items. If everything looks good, please confirm receipt to
                complete this order.
              </p>
            </div>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row">
            {canReport && (
              <Button
                variant="outline"
                className="w-full border-orange-200 bg-white text-orange-600 shadow-sm hover:border-orange-300 hover:bg-orange-50 sm:w-auto"
                onClick={onReportClick}
              >
                <AlertTriangle className="mr-2 h-4 w-4" /> Report Issue
              </Button>
            )}
            <Button
              className="w-full bg-emerald-600 text-white shadow-md transition-transform hover:-translate-y-0.5 hover:bg-emerald-700 sm:w-auto"
              onClick={onCompleteClick}
              disabled={isCompleting || hasComplaint}
            >
              {isCompleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Confirm Received
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

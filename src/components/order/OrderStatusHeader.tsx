import { Calendar, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OrderStepper from '@/components/orderDetail/OrderStepper';
import OrderBadge from '@/components/orderDetail/OrderBadge';
import { DEFAULT_INSTOCK_STEPS } from '@/lib/utils/order-status';

interface OrderStatusHeaderProps {
  order: any;
  activeStep: number;
  canComplete: boolean;
  canCreateTicket: boolean;
  isCompleting: boolean;
  onSetConfirmCompleteOpen: (open: boolean) => void;
  onSetCreateTicketDialogOpen: (open: boolean) => void;
  displayStatus?: string;
  steps?: readonly string[];
  isCancelled?: boolean;
  isReturned?: boolean;
}

export function OrderStatusHeader({
  order,
  activeStep,
  canComplete,
  canCreateTicket,
  isCompleting,
  onSetConfirmCompleteOpen,
  onSetCreateTicketDialogOpen,
  displayStatus,
  steps = DEFAULT_INSTOCK_STEPS,
  isCancelled = false,
  isReturned = false,
}: OrderStatusHeaderProps) {
  return (
    <div className="flex flex-col gap-6 rounded-lg border border-slate-100 bg-linear-to-br from-white to-slate-50/50 p-6 shadow-md">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Order Number
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {order.code || order.id.split('-')[0]}
          </p>
          {order.createdAt && (
            <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
              <Calendar className="h-4 w-4" />
              {new Date(order.createdAt).toLocaleDateString('en-US')}
            </p>
          )}
        </div>

        <div className="flex flex-col items-start gap-3 md:items-end md:text-right">
          <div>
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Order Status
            </p>
            <div className="mt-2">
              <OrderBadge status={displayStatus || order.status} />
            </div>
          </div>

          <div className="mt-2 flex flex-col items-end gap-2">
            {canComplete && (
              <Button
                variant="default"
                size="sm"
                className="gap-2 rounded-lg bg-linear-to-r from-emerald-500 to-emerald-600 font-medium text-white hover:from-emerald-600 hover:to-emerald-700"
                onClick={() => onSetConfirmCompleteOpen(true)}
                disabled={isCompleting}
              >
                {isCompleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Confirm Receipt
              </Button>
            )}

            {canCreateTicket && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-lg border-orange-300 font-medium text-orange-700 hover:border-orange-400 hover:bg-orange-50"
                onClick={() => onSetCreateTicketDialogOpen(true)}
              >
                <AlertTriangle className="h-4 w-4" />
                Report Issue
              </Button>
            )}
          </div>
        </div>
      </div>

      {activeStep >= 0 && (
        <div className="border-t border-slate-100 pt-6">
          <p className="mb-4 text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Order Progress
          </p>
          <OrderStepper
            steps={steps}
            activeStep={activeStep}
            isPaid={order.isPaid}
            isCancelled={isCancelled}
            isReturned={isReturned}
          />
        </div>
      )}
    </div>
  );
}

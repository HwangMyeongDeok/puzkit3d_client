import { Calendar, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ORDER_STATUS_MAP, ORDER_STEPPER_STEPS } from '@/constants';
import OrderStepper from '@/components/custom/OrderStepper';
import type { InstockOrderStatus } from '@/types';

// Copied existing badge logic
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
      <span className={`${badgeBase} bg-muted text-muted-foreground border-border`}>Unknown</span>
    );
  }
  return <span className={`${badgeBase} ${colorMap[info.color] ?? ''}`}>{info.label}</span>;
}

interface OrderStatusHeaderProps {
  order: any;
  activeStep: number;
  canComplete: boolean;
  canCreateTicket: boolean;
  isCompleting: boolean;
  onSetConfirmCompleteOpen: (open: boolean) => void;
  onSetCreateTicketDialogOpen: (open: boolean) => void;
}

export function OrderStatusHeader({
  order,
  activeStep,
  canComplete,
  canCreateTicket,
  isCompleting,
  onSetConfirmCompleteOpen,
  onSetCreateTicketDialogOpen,
}: OrderStatusHeaderProps) {
  return (
    <div className="flex flex-col gap-6 rounded-lg border border-slate-100 bg-gradient-to-br from-white to-slate-50/50 p-6 shadow-md">
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
              <StatusBadge status={order.status} />
            </div>
          </div>

          <div className="mt-2 flex flex-col items-end gap-2">
            {canComplete && (
              <Button
                variant="default"
                size="sm"
                className="gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 font-medium text-white hover:from-emerald-600 hover:to-emerald-700"
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
          <OrderStepper steps={ORDER_STEPPER_STEPS} activeStep={activeStep} isPaid={order.isPaid} />
        </div>
      )}
    </div>
  );
}

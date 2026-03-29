import { Calendar } from 'lucide-react';
import OrderBadge from '@/components/orderDetail/OrderBadge';
import OrderStepper from '@/components/orderDetail/OrderStepper';
import { ORDER_STATUS_MAP } from '@/constants';
import { InstockOrderStatus } from '@/types/api/order.api.types';

export default function OrderHeaderCard({
  order,
  effectiveStatus,
  isCOD,
  isCancelled,
  isReturned,
}: any) {
  // Stepper Logic bưng từ file cũ qua đây
  const defaultSteps = isCOD
    ? [
        ORDER_STATUS_MAP['Waiting']?.label,
        ORDER_STATUS_MAP['Processing'].label,
        ORDER_STATUS_MAP['HandedOverToDelivery'].label,
        ORDER_STATUS_MAP['Delivering'].label,
        ORDER_STATUS_MAP['Delivered'].label,
        ORDER_STATUS_MAP['Completed'].label,
      ]
    : [
        ORDER_STATUS_MAP['Pending'].label,
        ORDER_STATUS_MAP['Paid'].label,
        ORDER_STATUS_MAP['Processing'].label,
        ORDER_STATUS_MAP['HandedOverToDelivery'].label,
        ORDER_STATUS_MAP['Delivering'].label,
        ORDER_STATUS_MAP['Delivered'].label,
        ORDER_STATUS_MAP['Completed'].label,
      ];

  const stepperSteps = [...defaultSteps];
  if (isCancelled) {
    const insertIndex = isCOD ? 1 : 2;
    stepperSteps.splice(insertIndex, 0, ORDER_STATUS_MAP['Cancelled']?.label || 'Cancelled');
  }
  if (isReturned) {
    const deliveringIndex = stepperSteps.indexOf(ORDER_STATUS_MAP['Delivering']?.label);
    if (deliveringIndex !== -1)
      stepperSteps.splice(deliveringIndex + 1, 0, ORDER_STATUS_MAP['Returned']?.label);
  }

  const statusInfo = effectiveStatus
    ? ORDER_STATUS_MAP[effectiveStatus as InstockOrderStatus] || { label: effectiveStatus }
    : undefined;
  const activeStep = isReturned
    ? stepperSteps.indexOf(ORDER_STATUS_MAP['Returned']?.label || 'Returned')
    : statusInfo
      ? Math.max(0, stepperSteps.indexOf(statusInfo.label))
      : 0;

  return (
    <div className="bg-card border-border flex flex-col gap-4 rounded-xl border p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
            Order Code
          </p>
          <p className="text-foreground mt-1 text-2xl font-bold uppercase">
            #{order.code || order.id.split('-')[0]}
          </p>
          {order.createdAt && (
            <p className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              {new Date(order.createdAt).toLocaleDateString('en-US', {
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
            Status
          </p>
          <OrderBadge status={effectiveStatus} />
        </div>
      </div>
      {activeStep >= 0 && (
        <div className="border-border mt-2 border-t pt-6">
          <OrderStepper
            steps={stepperSteps}
            activeStep={activeStep}
            isPaid={order.isPaid ?? false}
            isCancelled={isCancelled}
            isReturned={isReturned}
          />
        </div>
      )}
    </div>
  );
}

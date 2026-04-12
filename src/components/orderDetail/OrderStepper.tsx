import React from 'react';

interface OrderStepperProps {
  steps: readonly string[];
  activeStep?: number;
  isPaid?: boolean;
  isCancelled?: boolean;
  isReturned?: boolean;
  isExpired?: boolean;
}

export default function OrderStepper({
  steps,
  activeStep = 0,
  isPaid = false,
  isCancelled = false,
  isReturned = false,
  isExpired = false,
}: OrderStepperProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto py-2">
      {steps.map((step, idx) => {
        const blocked = step === 'Paid' && !isPaid;

        const isCompleted = !blocked && idx <= activeStep;
        const isActive = !blocked && idx === activeStep;

        const isCancelledStep = isCancelled && step.toLowerCase().includes('cancel');
        const isReturnedStep = isReturned && step.toLowerCase().includes('return');
        const isExpiredStep = isExpired && step.toLowerCase().includes('expired'); // 3. CHECK EXPIRED STEP

        // Gộp logic: Nếu đã Bị Hủy / Trả Hàng / Hết Hạn thì các step sau đó bị mờ hết (blocked)
        const isBlockedAfterError =
          (isReturned && !isReturnedStep && idx > activeStep) ||
          (isCancelled && !isCancelledStep && idx > activeStep) ||
          (isExpired && !isExpiredStep && idx > activeStep);

        const dotClass =
          isCancelledStep || isReturnedStep
            ? 'bg-red-500 text-white'
            : isExpiredStep
              ? 'bg-slate-500 text-white' // 4. MÀU XÁM CHO EXPIRED
              : isBlockedAfterError
                ? 'bg-secondary text-muted-foreground'
                : isCompleted
                  ? 'bg-success text-success-foreground'
                  : isActive
                    ? 'bg-brand text-brand-foreground'
                    : 'bg-secondary text-muted-foreground';

        const labelClass =
          isCancelledStep || isReturnedStep
            ? 'font-bold text-red-500'
            : isExpiredStep
              ? 'font-bold text-slate-500' // 5. CHỮ XÁM ĐẬM CHO EXPIRED
              : isBlockedAfterError
                ? 'text-muted-foreground'
                : isCompleted
                  ? 'text-success'
                  : isActive
                    ? 'text-brand'
                    : 'text-muted-foreground';

        // Gắn icon dấu X cho cả Cancelled, Returned và Expired
        const icon =
          isCancelledStep || isReturnedStep || isExpiredStep ? '✕' : isCompleted ? '✓' : idx + 1;

        // Connector line sau step này
        const lineClass =
          isCompleted &&
          !isCancelledStep &&
          !isReturnedStep &&
          !isExpiredStep &&
          !isBlockedAfterError
            ? 'bg-success'
            : 'bg-border';

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${dotClass}`}
              >
                {icon}
              </div>
              <span
                className={`max-w-20 text-center text-[10px] leading-tight font-medium ${labelClass}`}
              >
                {step}
              </span>
            </div>

            {idx < steps.length - 1 && (
              <div className={`mx-1 h-0.5 w-6 shrink-0 rounded-full lg:w-10 ${lineClass}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

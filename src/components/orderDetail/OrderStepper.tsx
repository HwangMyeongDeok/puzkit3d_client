import React from 'react';

interface OrderStepperProps {
  steps: readonly string[];
  activeStep?: number;
  isPaid?: boolean;
  isCancelled?: boolean;
  isReturned?: boolean;
}

export default function OrderStepper({
  steps,
  activeStep = 0,
  isPaid = false,
  isCancelled = false,
  isReturned = false,
}: OrderStepperProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto py-2">
      {steps.map((step, idx) => {
        const blocked = step === 'Paid' && !isPaid;

        const isCompleted = !blocked && idx <= activeStep;
        const isActive = !blocked && idx === activeStep;

        const isCancelledStep = isCancelled && step.toLowerCase().includes('cancel');
        const isReturnedStep = isReturned && step.toLowerCase().includes('return');

        // Step sau Returned (Delivered, Completed) không được highlight
        const isBlockedAfterReturn = isReturned && !isReturnedStep && idx > activeStep;

        const dotClass =
          isCancelledStep || isReturnedStep
            ? 'bg-red-500 text-white'
            : isBlockedAfterReturn
              ? 'bg-secondary text-muted-foreground'
              : isCompleted
                ? 'bg-success text-success-foreground'
                : isActive
                  ? 'bg-brand text-brand-foreground'
                  : 'bg-secondary text-muted-foreground';

        const labelClass =
          isCancelledStep || isReturnedStep
            ? 'font-bold text-red-500'
            : isBlockedAfterReturn
              ? 'text-muted-foreground'
              : isCompleted
                ? 'text-success'
                : isActive
                  ? 'text-brand'
                  : 'text-muted-foreground';

        const icon = isCancelledStep ? '✕' : isReturnedStep ? '✕' : isCompleted ? '✓' : idx + 1;

        // Connector line sau step này
        const lineClass =
          isCompleted && !isCancelledStep && !isReturnedStep && !isBlockedAfterReturn
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

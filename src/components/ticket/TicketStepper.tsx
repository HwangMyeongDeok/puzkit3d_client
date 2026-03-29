import React from 'react';

export interface TicketStepperProps {
  steps: readonly string[];
  activeStep?: number;
  isRejected?: boolean;
}

export default function TicketStepper({
  steps,
  activeStep = 0,
  isRejected = false,
}: TicketStepperProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto py-2">
      {steps.map((step, idx) => {
        const isCompleted = idx <= activeStep;
        const isActive = idx === activeStep;
        const isRejectedStep = isRejected && idx === steps.length - 1;

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  isRejectedStep
                    ? 'bg-red-500 text-white'
                    : isCompleted
                      ? 'bg-success text-success-foreground'
                      : isActive
                        ? 'bg-brand text-brand-foreground'
                        : 'bg-secondary text-muted-foreground'
                }`}
              >
                {isRejectedStep ? '✕' : isCompleted ? '✓' : idx + 1}
              </div>
              <span
                className={`max-w-20 text-center text-[10px] leading-tight font-medium ${
                  isRejectedStep
                    ? 'font-bold text-red-500'
                    : isCompleted
                      ? 'text-success'
                      : isActive
                        ? 'text-brand'
                        : 'text-muted-foreground'
                }`}
              >
                {step}
              </span>
            </div>

            {idx < steps.length - 1 && (
              <div
                className={`mx-1 h-0.5 w-6 shrink-0 rounded-full lg:w-10 ${
                  isCompleted && !isRejectedStep ? 'bg-success' : 'bg-border'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

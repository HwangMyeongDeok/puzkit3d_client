import React from 'react';

export interface StepItem {
  label: string;
  isCompleted: boolean;
  isActive: boolean;
  isRejected?: boolean;
}

export interface TicketStepperProps {
  steps: StepItem[];
}

export default function TicketStepper({ steps }: TicketStepperProps) {
  return (
    <div className="scrollbar-hide flex items-center gap-1 overflow-x-auto py-4">
      {steps.map((step, idx) => {
        const isRejectedStep = step.isRejected;

        return (
          <div key={`${step.label}-${idx}`} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-sm transition-all duration-300 ${
                  isRejectedStep
                    ? 'bg-rose-500 text-white ring-4 ring-rose-500/20'
                    : step.isCompleted
                      ? 'bg-emerald-500 text-white'
                      : step.isActive
                        ? 'bg-brand text-brand-foreground ring-brand/20 ring-4'
                        : 'border border-slate-200 bg-slate-100 text-slate-400'
                }`}
              >
                {isRejectedStep ? '✕' : step.isCompleted ? '✓' : idx + 1}
              </div>
              <span
                className={`w-24 text-center text-[11px] leading-tight font-bold ${
                  isRejectedStep
                    ? 'text-rose-600'
                    : step.isCompleted
                      ? 'text-emerald-600'
                      : step.isActive
                        ? 'text-brand'
                        : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>

            {idx < steps.length - 1 && (
              <div className="relative mx-1 flex h-6 w-8 -translate-y-3 items-center justify-center lg:w-16">
                <div
                  className={`absolute h-1 w-full rounded-full transition-colors duration-300 ${
                    step.isCompleted && !isRejectedStep ? 'bg-emerald-500' : 'bg-slate-100'
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

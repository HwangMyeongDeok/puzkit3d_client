interface OrderStepperProps {
  steps: string[];
  activeStep?: number;
}

export default function OrderStepper({ steps, activeStep = 0 }: OrderStepperProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto py-2">
      {steps.map((step, idx) => {
        const isActive = idx === activeStep;
        const isCompleted = idx < activeStep;

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  isCompleted
                    ? 'bg-success text-success-foreground'
                    : isActive
                      ? 'bg-brand text-brand-foreground'
                      : 'bg-secondary text-muted-foreground'
                }`}
              >
                {isCompleted ? '✓' : idx + 1}
              </div>
              <span
                className={`max-w-[80px] text-center text-[10px] leading-tight font-medium ${
                  isActive ? 'text-brand' : isCompleted ? 'text-success' : 'text-muted-foreground'
                }`}
              >
                {step}
              </span>
            </div>

            {idx < steps.length - 1 && (
              <div
                className={`mx-1 h-0.5 w-6 shrink-0 rounded-full lg:w-10 ${
                  isCompleted ? 'bg-success' : 'bg-border'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

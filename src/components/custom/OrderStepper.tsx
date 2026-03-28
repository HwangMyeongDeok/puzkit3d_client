import React from 'react';

interface OrderStepperProps {
  steps: string[];
  activeStep?: number;
  isPaid?: boolean;
  isCancelled?: boolean; // đã có prop
}

export default function OrderStepper({
  steps,
  activeStep = 0,
  isPaid = false,
  isCancelled = false, // Nhớ destructure nó ra đây nhé
}: OrderStepperProps) {
  console.log('🔥 Stepper props:', { activeStep, isPaid, isCancelled, steps });

  return (
    <div className="flex items-center gap-1 overflow-x-auto py-2">
      {steps.map((step, idx) => {
        // Step "Đã thanh toán" chỉ completed/active khi isPaid = true
        const blocked = step === 'Paid' && !isPaid;

        const isCompleted = !blocked && idx <= activeStep;
        const isActive = !blocked && idx === activeStep;

        // Bắt điều kiện: Đơn bị hủy VÀ step hiện tại đang là bước Cancelled
        const isCancelledStep = isCancelled && step.toLowerCase().includes('cancel');

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  isCancelledStep
                    ? 'bg-red-500 text-white' // MÀU ĐỎ CHO NÚT CANCEL
                    : isCompleted
                      ? 'bg-success text-success-foreground'
                      : isActive
                        ? 'bg-brand text-brand-foreground'
                        : 'bg-secondary text-muted-foreground'
                }`}
              >
                {/* RENDER DẤU X NẾU LÀ CANCELLED, NGƯỢC LẠI CHẠY LOGIC CŨ */}
                {isCancelledStep ? '✕' : isCompleted ? '✓' : idx + 1}
              </div>
              <span
                className={`max-w-20 text-center text-[10px] leading-tight font-medium ${
                  isCancelledStep
                    ? 'font-bold text-red-500' // TEXT ĐỎ CHO CANCEL
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
                  // Ngăn không cho đường line phía sau Cancelled bị tô màu xanh
                  isCompleted && !isCancelledStep ? 'bg-success' : 'bg-border'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

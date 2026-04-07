import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface StepHeaderProps {
  currentStep: number;
  onExit: () => void;
}

export default function StepHeader({ currentStep, onExit }: StepHeaderProps) {
  return (
    // Đổi viền border dưới thành màu blue nhạt
    <div className="sticky top-0 z-40 w-full border-b border-blue-100 bg-white/90 shadow-sm backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-6 py-4">
        <div className="mb-3 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onExit}
            // Hover đổi sang màu #032a63
            className="flex h-auto items-center gap-2 p-0 text-sm font-medium text-slate-500 transition-colors hover:bg-transparent hover:text-[#032a63]"
          >
            <ChevronLeft className="h-4 w-4" /> Exit
          </Button>

          {/* Đổi màu chữ sang navy */}
          <span className="text-sm font-bold text-[#032a63]">Step {currentStep} of 5</span>
        </div>

        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={cn(
                'h-2.5 flex-1 rounded-full transition-all duration-500',
                // Active màu navy #032a63, Inactive màu blue nhạt
                step <= currentStep ? 'bg-[#032a63]' : 'bg-blue-100'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

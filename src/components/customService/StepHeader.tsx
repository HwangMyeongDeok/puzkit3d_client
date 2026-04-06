import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface StepHeaderProps {
  currentStep: number;
  onExit: () => void;
}

export default function StepHeader({ currentStep, onExit }: StepHeaderProps) {
  return (
    <div className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-6 py-4">
        <div className="mb-3 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onExit}
            className="flex h-auto items-center gap-2 p-0 text-sm font-medium text-slate-500 transition-colors hover:bg-transparent hover:text-blue-950"
          >
            <ChevronLeft className="h-4 w-4" /> Exit
          </Button>

          <span className="text-sm font-bold text-blue-950">Step {currentStep} of 5</span>
        </div>

        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={cn(
                'h-2.5 flex-1 rounded-full transition-all duration-500',
                step <= currentStep ? 'bg-red-600' : 'bg-slate-200'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

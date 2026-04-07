import { Upload, Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ConfiguratorState, Type } from './types';

interface StepInputMethodProps {
  config: ConfiguratorState;
  updateConfig: (updates: Partial<ConfiguratorState>) => void;
}

const INPUT_OPTIONS = [
  {
    id: 'Sketch' as const,
    title: 'Upload Sketch',
    desc: 'I have my own sketch',
    icon: Upload,
  },
  {
    id: 'Idea' as const,
    title: 'AI Generative',
    desc: 'Describe it and let AI design',
    icon: Sparkles,
  },
];

export default function StepInputMethod({ config, updateConfig }: StepInputMethodProps) {
  return (
    <div className="animate-in fade-in mx-auto max-w-3xl space-y-8 duration-500">
      <div className="mb-10 space-y-3 text-center">
        <h2 className="text-3xl font-extrabold text-[#032a63] md:text-4xl">Start your build</h2>
        <p className="text-lg text-slate-600">
          Choose your preferred method to bring your vision to life.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {INPUT_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = config.Type === option.id;
          return (
            <button
              key={option.id}
              onClick={() => {
                const clearData: Partial<ConfiguratorState> = { Type: option.id as Type };
                if (option.id === 'Sketch') {
                  clearData.aiPrompt = '';
                } else {
                  clearData.uploadedFiles = [];
                }
                updateConfig(clearData);
              }}
              className={cn(
                'group relative transform rounded-2xl border-2 p-8 text-left transition-all duration-300',
                isSelected
                  ? 'border-[#032a63] bg-blue-50 shadow-md shadow-blue-100'
                  : 'border-slate-200 bg-white hover:border-[#032a63]'
              )}
            >
              <div
                className={cn(
                  'mb-5 flex h-16 w-16 items-center justify-center rounded-xl transition-all',
                  isSelected ? 'bg-blue-100' : 'bg-slate-50 group-hover:bg-blue-50'
                )}
              >
                <Icon
                  className={cn(
                    'h-8 w-8',
                    isSelected ? 'text-[#032a63]' : 'text-slate-400 group-hover:text-[#032a63]'
                  )}
                />
              </div>
              <h3 className="mb-2 text-xl font-bold text-[#032a63]">{option.title}</h3>
              <p className="text-sm text-slate-500">{option.desc}</p>
              {isSelected && (
                <CheckCircle2 className="absolute top-6 right-6 h-6 w-6 text-[#032a63]" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-12 flex justify-end border-t border-slate-200 pt-8">
        <button
          onClick={() => updateConfig({ step: 2 })}
          disabled={!config.Type}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#032a63] px-8 py-3.5 text-base font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#021744] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-md"
        >
          Next: Core Specifications
        </button>
      </div>
    </div>
  );
}

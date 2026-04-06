import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LandingHeroProps {
  onStart: () => void;
}

export default function LandingHero({ onStart }: LandingHeroProps) {
  return (
    <div className="w-full bg-slate-50 font-sans text-slate-900">
      <section className="relative overflow-hidden border-b border-slate-200 bg-white px-6 py-20 lg:py-32">
        <div className="animate-in fade-in mx-auto max-w-4xl space-y-8 text-center duration-700">
          <h1 className="text-5xl leading-tight font-extrabold tracking-tight text-blue-950 md:text-7xl">
            Turn Your <span className="text-red-600">Brilliant Ideas</span> <br />
            Into Physical Reality
          </h1>

          <Button
            onClick={onStart}
            size="lg"
            className="group h-14 rounded-2xl bg-red-600 px-8 text-lg font-semibold text-white shadow-xl shadow-red-600/20 transition-all duration-300 hover:-translate-y-1 hover:bg-red-700 hover:shadow-red-600/40"
          >
            Start Your Request
            <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </section>
    </div>
  );
}

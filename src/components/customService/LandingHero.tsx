import {
  ChevronRight,
  Lightbulb,
  PenTool,
  Printer,
  Truck,
  CheckCircle2,
  Star,
  Zap,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LandingHeroProps {
  onStart: () => void;
}

export default function LandingHero({ onStart }: LandingHeroProps) {
  return (
    <div className="w-full overflow-hidden border-t border-slate-500 bg-slate-50 font-sans text-slate-900">
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 py-20 lg:px-8">
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-8 mx-auto max-w-5xl text-center duration-1000">
          <div className="mb-8 flex justify-center">
            <span className="inline-flex items-center rounded-full bg-red-50 px-4 py-1.5 text-sm font-semibold text-red-600 ring-1 ring-red-600/20 ring-inset">
              <Star className="mr-2 h-4 w-4 fill-red-600" /> Voted #1 Custom Design Service 2026
            </span>
          </div>

          <h1 className="text-5xl leading-[1.1] font-extrabold tracking-tight text-blue-950 sm:text-7xl">
            Turn Your{' '}
            <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
              Brilliant Ideas
            </span>{' '}
            <br className="hidden sm:block" />
            Into Physical Reality
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
            From rough sketches to premium manufactured products. We provide end-to-end 3D modeling,
            prototyping, and assembly services for creators and businesses worldwide.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-x-6 gap-y-4 sm:flex-row">
            <Button
              onClick={onStart}
              size="lg"
              className="group h-14 w-full rounded-2xl bg-red-600 px-8 text-lg font-semibold text-white shadow-xl shadow-red-600/25 transition-all duration-300 hover:-translate-y-1 hover:bg-red-700 hover:shadow-red-600/40 sm:w-auto"
            >
              Start Your Request
              <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-14 w-full rounded-2xl border-slate-200 bg-white px-8 text-lg font-semibold text-slate-700 transition-all sm:w-auto"
            >
              View Our Portfolio
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 border-t border-slate-200/60 pt-8">
            <p className="text-sm font-medium tracking-widest text-slate-400 uppercase">
              Trusted by innovative teams
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-8 opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0">
              {/* Replace these with actual logos */}
              <div className="text-xl font-bold text-slate-800">TechCorp</div>
              <div className="text-xl font-bold text-slate-800">InnovateLab</div>
              <div className="text-xl font-bold text-slate-800">MakerSpace</div>
              <div className="text-xl font-bold text-slate-800">DesignStudio</div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 2: HOW IT WORKS (Màn hình 2) --- */}
      <section className="bg-white px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 max-w-3xl">
            <h2 className="text-sm font-bold tracking-widest text-red-600 uppercase">Process</h2>
            <p className="mt-2 text-3xl font-extrabold text-blue-950 sm:text-5xl">
              How to bring your idea to life
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
            {/* Step 1 */}
            <div className="group relative">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                <Lightbulb className="h-8 w-8" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">1. Submit Idea</h3>
              <p className="leading-relaxed text-slate-600">
                Share your sketches, reference images, or descriptions. The more details, the
                better.
              </p>
              {/* Connector line (desktop only) */}
              <div className="absolute top-8 right-0 left-20 -z-10 hidden h-[2px] bg-slate-100 lg:block"></div>
            </div>

            {/* Step 2 */}
            <div className="group relative">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                <PenTool className="h-8 w-8" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">2. 3D Design</h3>
              <p className="leading-relaxed text-slate-600">
                Our experts craft precise 3D models and send them to you for review and revisions.
              </p>
              <div className="absolute top-8 right-0 left-20 -z-10 hidden h-[2px] bg-slate-100 lg:block"></div>
            </div>

            {/* Step 3 */}
            <div className="group relative">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                <Printer className="h-8 w-8" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">3. Manufacture</h3>
              <p className="leading-relaxed text-slate-600">
                Once approved, we use premium materials and methods to build your custom product.
              </p>
              <div className="absolute top-8 right-0 left-20 -z-10 hidden h-[2px] bg-slate-100 lg:block"></div>
            </div>

            {/* Step 4 */}
            <div className="group relative">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 transition-colors group-hover:bg-red-600 group-hover:text-white">
                <Truck className="h-8 w-8" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">4. Delivery</h3>
              <p className="leading-relaxed text-slate-600">
                Your finished physical product is carefully packaged and shipped right to your door.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 3: BENEFITS / FEATURES --- */}
      <section className="border-y border-slate-200 bg-slate-50 px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-extrabold text-blue-950 sm:text-4xl">
                Why creators choose our manufacturing platform
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                We bridge the gap between imagination and reality with industry-leading quality,
                transparent pricing, and rapid turnaround times.
              </p>

              <div className="mt-10 space-y-6">
                {[
                  {
                    icon: Zap,
                    title: 'Rapid Prototyping',
                    desc: 'Get your first prototype in as little as 72 hours.',
                  },
                  {
                    icon: Shield,
                    title: 'Premium Quality',
                    desc: 'Industrial-grade materials ensuring durability and precision.',
                  },
                  {
                    icon: CheckCircle2,
                    title: 'Unlimited Revisions',
                    desc: 'We tweak the 3D model until it exactly matches your vision.',
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-100 bg-white shadow-sm">
                      <item.icon className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">{item.title}</h4>
                      <p className="mt-1 text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Placeholder cho Hình ảnh / Mockup */}
            <div className="relative flex h-full min-h-[400px] items-center justify-center overflow-hidden rounded-3xl bg-blue-100 p-8 shadow-inner sm:p-12">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-200/50 to-transparent"></div>
              <div className="relative z-10 text-center">
                <div className="mb-4 inline-block rounded-2xl bg-white p-4 shadow-xl">
                  <div className="flex h-48 w-48 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-100 font-medium text-slate-400">
                    [3D Model / Image Hero]
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 4: BOTTOM CTA --- */}
      <section className="bg-blue-950 px-6 py-24 text-center sm:py-32">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
            Ready to build something amazing?
          </h2>
          <p className="mt-6 text-xl text-blue-200">
            Join thousands of creators who have already brought their custom designs to life. Let's
            start with your idea today.
          </p>
          <div className="mt-10">
            <Button
              onClick={onStart}
              size="lg"
              className="h-16 rounded-2xl bg-red-600 px-10 text-xl font-bold text-white shadow-lg shadow-red-600/30 transition-all hover:scale-105 hover:bg-red-500"
            >
              Start Your Request Now
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

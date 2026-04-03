import { ShieldCheck, Truck, Wrench, RotateCcw } from 'lucide-react';

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Authentic 100%',
    description: 'Genuine products from manufacturers',
  },
  {
    icon: Truck,
    title: 'Fast Shipping',
    description: 'Fast nationwide delivery',
  },
  {
    icon: Wrench,
    title: 'Expert Support',
    description: 'Professional technical support',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    description: '7-day easy returns',
  },
];

export default function FeatureBar() {
  return (
    <section className="relative border-y border-[#deebff] bg-transparent">
      <div className="container-custom py-8 lg:py-10">
        <div className="overflow-hidden rounded-[32px] border border-[#dbe7ff] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(246,250,255,0.96)_100%)] p-3 shadow-[0_16px_50px_rgba(15,23,42,0.05)] md:p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-[24px] border border-transparent bg-white/70 px-4 py-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#dbe7ff] hover:bg-white hover:shadow-[0_14px_30px_rgba(15,23,42,0.06)]"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_35%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#dce9ff] bg-[linear-gradient(180deg,#eef5ff_0%,#e4efff_100%)] text-[#17407f] shadow-sm">
                    <feature.icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold tracking-tight text-[#0f2347]">
                      {feature.title}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

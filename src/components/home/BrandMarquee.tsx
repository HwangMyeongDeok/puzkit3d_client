const BRANDS = [
  'Bandai',
  'Ugears',
  'Tamiya',
  'Lego',
  'Mould King',
  'Xiaomi',
  'CaDA',
  'Metal Earth',
];

export default function BrandMarquee() {
  return (
    <section className="border-border bg-secondary overflow-hidden border-b py-10">
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>

      <p className="text-muted-foreground mb-6 text-center text-xs font-semibold tracking-widest uppercase">
        Trusted Brands
      </p>

      <div className="relative">
        <div className="from-secondary pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r to-transparent" />
        <div className="from-secondary pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l to-transparent" />

        <div className="flex w-max gap-8" style={{ animation: 'marquee 30s linear infinite' }}>
          {[...BRANDS, ...BRANDS].map((brand, i) => (
            <span
              key={`${brand}-${i}`}
              className="border-border bg-card text-foreground/60 hover:text-brand inline-flex shrink-0 items-center rounded-lg border px-8 py-3.5 text-sm font-bold tracking-wide transition-colors"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

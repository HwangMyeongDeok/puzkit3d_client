export default function ProductDetailSkeleton() {
  return (
    <div className="container-custom animate-pulse py-8 lg:py-12">
      <div className="bg-secondary mb-6 h-4 w-60 rounded" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="flex flex-col gap-4">
          <div className="bg-secondary aspect-square w-full rounded-2xl" />
          <div className="flex gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-secondary h-20 w-20 shrink-0 rounded-xl" />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-secondary h-4 w-24 rounded" />
          <div className="bg-secondary h-8 w-3/4 rounded" />
          <div className="flex items-center gap-3">
            <div className="bg-secondary h-4 w-20 rounded" />
            <div className="bg-secondary h-4 w-32 rounded" />
          </div>
          <div className="bg-secondary h-10 w-1/2 rounded" />
          <div className="bg-secondary mt-2 h-20 w-full rounded-lg" />
          <div className="mt-4 flex gap-3">
            <div className="bg-secondary h-12 flex-1 rounded-xl" />
            <div className="bg-secondary h-12 flex-1 rounded-xl" />
          </div>
        </div>
      </div>

      <div className="mt-12">
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-secondary h-10 w-28 rounded-lg" />
          ))}
        </div>
        <div className="bg-secondary mt-4 h-64 w-full rounded-xl" />
      </div>

      <div className="mt-12">
        <div className="bg-secondary mb-6 h-6 w-56 rounded" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr]">
          <div className="flex flex-col items-center gap-2">
            <div className="bg-secondary h-14 w-14 rounded" />
            <div className="bg-secondary h-4 w-24 rounded" />
          </div>
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="bg-secondary h-2 w-3 rounded" />
                <div className="bg-secondary h-2 flex-1 rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-secondary h-24 w-full rounded-lg" />
          ))}
        </div>
      </div>

      <div className="mt-12">
        <div className="bg-secondary mb-6 h-6 w-48 rounded" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="bg-secondary aspect-square w-full rounded-xl" />
              <div className="bg-secondary h-4 w-3/4 rounded" />
              <div className="bg-secondary h-4 w-1/2 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

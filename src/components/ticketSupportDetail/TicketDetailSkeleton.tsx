import { Skeleton } from '@/components/ui/skeleton';

export default function TicketDetailSkeleton() {
  return (
    <div className="container-custom animate-pulse py-8 lg:py-12">
      <div className="mb-6 flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-8 w-48 rounded-md" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Skeleton className="h-[200px] w-full rounded-xl" />
          <Skeleton className="h-[250px] w-full rounded-xl" />
        </div>
        <div className="flex flex-col gap-6 lg:col-span-1">
          <Skeleton className="h-[200px] w-full rounded-xl" />
          <Skeleton className="h-[150px] w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

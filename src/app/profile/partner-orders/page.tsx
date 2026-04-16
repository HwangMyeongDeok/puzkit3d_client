'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function PartnerOrdersPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/profile/orders?tab=partner');
  }, [router]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <Loader2 className="text-brand h-8 w-8 animate-spin" />
      <p className="text-muted-foreground">Redirecting to partner orders...</p>
    </div>
  );
}
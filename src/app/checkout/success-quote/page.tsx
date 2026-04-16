import Link from 'next/link';
import { FileText, ArrowRight, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';

export default function QuoteSuccessPage() {
  return (
    <div className="container-custom flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <div className="relative mb-6">
        <div className="absolute -inset-4 rounded-full bg-blue-500/20 blur-xl" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-blue-500/10">
          <FileText className="h-14 w-14 text-blue-600" />
        </div>
      </div>

      <h1 className="mb-3 text-3xl font-extrabold text-slate-900 md:text-4xl">
        Request Submitted!
      </h1>

      <p className="text-muted-foreground mx-auto mb-6 max-w-md">
        PuzKit3D staff will contact you within{' '}
        <span className="font-bold text-blue-600">24 hours</span> to confirm pricing and delivery
        schedule.
      </p>

      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
        <Link href="/profile/partner-requests">
          <Button
            size="lg"
            className="gap-2 rounded-xl bg-blue-600 px-8 text-white hover:bg-blue-700"
          >
            Go to Request History
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>

        <Link href={ROUTES.HOME}>
          <Button variant="outline" size="lg" className="gap-2 rounded-xl px-8">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
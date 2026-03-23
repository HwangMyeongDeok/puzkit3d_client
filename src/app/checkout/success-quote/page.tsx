import Link from 'next/link';
import { FileText, ArrowRight, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import OrderStepper from '@/components/custom/OrderStepper';

const PARTNER_STEPS = ['Submit Request', 'Staff Quote', 'Deposit Payment', 'Delivery'];

export default function QuoteSuccessPage() {
  return (
    <div className="container-custom flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <div className="relative mb-6">
        <div className="bg-warning/20 absolute -inset-4 rounded-full blur-xl" />
        <div className="bg-warning/10 relative flex h-24 w-24 items-center justify-center rounded-full">
          <FileText className="text-warning h-14 w-14" />
        </div>
      </div>

      <h1 className="mb-3 text-3xl font-extrabold md:text-4xl">Request Submitted!</h1>

      <p className="text-muted-foreground mx-auto mb-2 max-w-md">
        PuzKit3D staff will contact you within{' '}
        <span className="text-warning font-bold">24 hours</span> to confirm pricing and delivery
        schedule.
      </p>

      <div className="border-warning/20 bg-warning/5 my-8 w-full max-w-lg overflow-x-auto rounded-xl border px-6 py-4">
        <OrderStepper steps={PARTNER_STEPS} activeStep={1} />
      </div>

      <div className="border-border bg-card my-4 inline-flex items-center gap-3 rounded-xl border px-6 py-4">
        <Clock className="text-warning h-5 w-5" />
        <div className="text-left">
          <p className="text-muted-foreground text-xs">Status</p>
          <p className="text-card-foreground text-lg font-bold">Waiting for Staff Quote</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
        <Link href={ROUTES.BRANDS}>
          <Button
            size="lg"
            className="bg-warning text-warning-foreground hover:bg-warning/90 gap-2 rounded-xl px-8"
          >
            Browse Partner Products
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

'use client';

import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrderCardPayButtonProps {
  orderId: string;
  onPayNow: (orderId: string) => void;
}

export function OrderCardPayButton({ orderId, onPayNow }: OrderCardPayButtonProps) {
  return (
    <Button
      onClick={() => onPayNow(orderId)}
      className="bg-brand hover:bg-brand/90 h-11 w-full gap-2 font-bold md:w-auto"
    >
      <CreditCard className="h-4 w-4" /> Pay Now
    </Button>
  );
}

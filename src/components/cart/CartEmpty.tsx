import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { ROUTES } from '@/constants';

export default function CartEmpty() {
  return (
    <div className="container-custom flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <ShoppingBag className="text-muted-foreground/40 mb-4 h-16 w-16" />
      <h1 className="mb-2 text-2xl font-bold">Your cart is empty</h1>
      <p className="text-muted-foreground mb-6">You don't have any products in your cart yet.</p>
      <Link
        href={ROUTES.SHOP}
        className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
      >
        Continue Shopping
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

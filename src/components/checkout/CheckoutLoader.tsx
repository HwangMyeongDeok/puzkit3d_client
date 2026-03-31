import { Loader2 } from 'lucide-react';

interface CheckoutLoaderProps {
  isLoading: boolean;
  text?: string;
}

export default function CheckoutLoader({
  isLoading,
  text = 'Processing your order...',
}: CheckoutLoaderProps) {
  if (!isLoading) return null;

  return (
    <div className="bg-background/80 fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 backdrop-blur-md">
      <Loader2 className="text-brand h-12 w-12 animate-spin" />
      <p className="text-xl font-bold">{text}</p>
    </div>
  );
}

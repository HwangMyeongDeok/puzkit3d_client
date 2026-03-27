import { Loader2 } from 'lucide-react';

export default function CartLoading() {
  return (
    <div className="container-custom flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <Loader2 className="text-brand mb-4 h-10 w-10 animate-spin" />
      <p className="text-muted-foreground">Loading cart...</p>
    </div>
  );
}

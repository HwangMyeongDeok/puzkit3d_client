import { User, Phone, Mail, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { GetCustomerOrderByIdResponseDto } from '@/types/api/order.api.types';

export default function OrderCustomerInfo({ order }: { order: GetCustomerOrderByIdResponseDto }) {
  return (
    <div className="bg-card border-border flex flex-col gap-5 rounded-xl border p-6 shadow-sm">
      <h3 className="flex items-center gap-2 text-lg font-bold">
        <User className="text-brand h-5 w-5" />
        Shipping Information
      </h3>

      <div className="bg-muted/30 border-border/50 flex flex-col gap-3 rounded-lg border p-4 text-sm">
        <div className="flex items-center gap-3">
          <User className="text-muted-foreground h-4 w-4 shrink-0" />
          <p className="font-semibold">{order.customerName}</p>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="text-muted-foreground h-4 w-4 shrink-0" />
          <p className="text-muted-foreground">{order.customerPhone}</p>
        </div>
        {order.customerEmail && (
          <div className="flex items-center gap-3">
            <Mail className="text-muted-foreground h-4 w-4 shrink-0" />
            <p className="text-muted-foreground truncate">{order.customerEmail}</p>
          </div>
        )}
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 flex items-center gap-2 text-base font-bold">
          <MapPin className="text-brand h-4 w-4" />
          Delivery Address
        </h3>
        <p className="text-muted-foreground bg-muted/30 border-border/50 rounded-lg border p-4 text-sm leading-relaxed">
          {order.customerWardName}, {order.customerDistrictName}, {order.customerProvinceName}
        </p>
      </div>
    </div>
  );
}

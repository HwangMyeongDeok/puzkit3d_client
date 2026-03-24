import { User, Phone, Mail, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface OrderCustomerInfoProps {
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerProvinceName?: string;
  customerDistrictName?: string;
  customerWardName?: string;
}

export function OrderCustomerInfo({
  customerName,
  customerPhone,
  customerEmail,
  customerProvinceName,
  customerDistrictName,
  customerWardName,
}: OrderCustomerInfoProps) {
  return (
    <div className="flex flex-col gap-0 overflow-hidden rounded-lg border border-slate-100 bg-white shadow-md">
      <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
        <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
          <User className="h-5 w-5 text-blue-600" />
          Delivery Information
        </h3>
      </div>

      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
          <User className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Recipient Name</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{customerName}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
          <Phone className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Phone Number</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{customerPhone}</p>
          </div>
        </div>
        {customerEmail && (
          <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-500 uppercase">Email</p>
              <p className="mt-1 truncate text-sm font-medium text-slate-900">{customerEmail}</p>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 px-6 py-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <MapPin className="h-4 w-4 text-blue-600" />
          Delivery Address
        </h3>
        <p className="text-muted-foreground bg-muted/30 border-border/50 rounded-lg border p-4 text-sm leading-relaxed">
          {customerWardName}, {customerDistrictName}, {customerProvinceName}
        </p>
      </div>
    </div>
  );
}

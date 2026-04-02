import Link from 'next/link';
import { Calendar, ExternalLink, Info, FileWarning, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import AttachedEvidence from './AttachedEvidence';

export default function TicketSidebarInfo({ ticket }: { ticket: any }) {
  return (
    <div className="bg-card border-border flex flex-col overflow-hidden rounded-xl border shadow-sm">
      {/* Header */}
      <div className="bg-muted/40 border-border flex items-center gap-2 border-b p-4">
        <Info className="text-muted-foreground h-4 w-4" />
        <h3 className="text-foreground font-semibold">Ticket Information</h3>
      </div>

      <div className="space-y-6 p-5 text-sm">
        {/* --- Phần 1: Ngày tạo --- */}
        <div>
          <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
            Created At
          </p>
          <p className="flex items-center gap-2 font-medium">
            <Calendar className="text-muted-foreground h-4 w-4" />
            {new Date(ticket.createdAt).toLocaleDateString('en-US', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        {/* --- Phần 2: Lý do từ khách hàng --- */}
        <div>
          <p className="text-muted-foreground mb-2 flex items-center gap-2 text-xs font-medium tracking-wider uppercase">
            <FileWarning className="h-4 w-4" /> Customer Reason
          </p>
          <div className="bg-muted/30 text-foreground border-border/50 rounded-lg border p-3 text-sm leading-relaxed italic">
            "{ticket.reason}"
          </div>
        </div>

        {/* --- Phần 3: Bằng chứng (Video/Image) --- */}
        {ticket.proof && (
          <div>
            <p className="text-muted-foreground mb-2 flex items-center gap-2 text-xs font-medium tracking-wider uppercase">
              <ImageIcon className="h-4 w-4" /> Attached Evidence
            </p>
            {/* Nếu AttachedEvidence của ông chỉ render UI của media, gọi thẳng vào đây */}
            <div className="border-border/50 overflow-hidden rounded-lg border">
              <AttachedEvidence proof={ticket.proof} />
            </div>
          </div>
        )}

        {/* --- Phần 4: Nút về Order (CTA phụ) --- */}
        <div className="border-border border-t pt-5">
          <Button variant="outline" className="w-full gap-2 shadow-sm" asChild>
            <Link href={ROUTES.ORDER_DETAIL(ticket.orderId)}>
              View Original Order <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

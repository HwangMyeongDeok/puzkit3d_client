'use client';

import {
  Calendar,
  Ruler,
  Package,
  DollarSign,
  Truck,
  Eye,
  MessageSquare,
  Image as ImageIcon,
  Lightbulb,
  PenTool,
} from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import CustomDesignStatusBadge from './CustomDesignStatusBadge';
import type { CustomDesignRequestDto } from '@/types/api/customDesign.api.type';
import Link from 'next/link';

interface CustomDesignRequestCardProps {
  request: CustomDesignRequestDto;
}

export default function CustomDesignRequestCard({ request }: CustomDesignRequestCardProps) {
  const TypeIcon = request.type === 'Idea' ? Lightbulb : PenTool;

  const isActionable = request.status === 'MissingInformation';
  const isTerminal = ['Completed', 'Rejected', 'Cancelled', 'Expired'].includes(request.status);

  return (
    <div
      className={`bg-card border-border group relative flex flex-col gap-4 rounded-xl border p-5 shadow-sm transition-all duration-300 hover:shadow-md ${isActionable ? 'border-orange-300 ring-1 ring-orange-200/50' : 'hover:border-brand/30'} ${isTerminal ? 'opacity-80 hover:opacity-100' : ''} `}
    >
      {/* ── CARD HEADER ── */}
      <div className="border-border flex flex-col justify-between gap-4 border-b pb-4 md:flex-row md:items-start">
        <div className="flex items-start gap-3">
          <div className="bg-brand/10 text-brand flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
            <TypeIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h3 className="text-lg leading-none font-bold">
                Request #{request.code || request.id.split('-')[0].toUpperCase()}
              </h3>
              <div className="flex items-center gap-1.5">
                <span className="bg-muted text-muted-foreground rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase">
                  {request.type}
                </span>
                {/* Dấu chấm than cảnh báo gọn gàng bên cạnh Type */}
                {isActionable && (
                  <span
                    className="flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[11px] font-bold text-white shadow-sm"
                    title="Action Required"
                  >
                    !
                  </span>
                )}
              </div>
            </div>

            <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-3 text-sm">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDate(request.createdAt, true)}
              </span>
              {request.updatedAt && (
                <span className="flex items-center gap-1.5 border-l border-slate-300 pl-3">
                  Updated: {formatDate(request.updatedAt)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <CustomDesignStatusBadge status={request.status} />
        </div>
      </div>

      {/* ── CARD BODY ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Dimensions */}
        <div className="bg-muted/30 border-border/50 hover:bg-muted/50 flex items-start gap-3 rounded-lg border p-3 transition-colors">
          <Ruler className="text-brand mt-0.5 h-4 w-4 shrink-0" />
          <div className="min-w-0">
            <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
              Dimensions
            </p>
            <p className="text-foreground text-sm font-bold">
              {request.desiredLengthMm} × {request.desiredWidthMm} × {request.desiredHeightMm}
              <span className="text-muted-foreground ml-1 text-[10px] font-normal">mm</span>
            </p>
          </div>
        </div>

        {/* Quantity */}
        <div className="bg-muted/30 border-border/50 hover:bg-muted/50 flex items-start gap-3 rounded-lg border p-3 transition-colors">
          <Package className="text-brand mt-0.5 h-4 w-4 shrink-0" />
          <div className="min-w-0">
            <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
              Quantity
            </p>
            <p className="text-foreground text-sm font-bold">
              {request.desiredQuantity.toLocaleString()}
              <span className="text-muted-foreground ml-1 text-[10px] font-normal">units</span>
            </p>
          </div>
        </div>

        {/* Budget */}
        <div className="bg-muted/30 border-border/50 hover:bg-muted/50 flex items-start gap-3 rounded-lg border p-3 transition-colors">
          <DollarSign className="text-brand mt-0.5 h-4 w-4 shrink-0" />
          <div className="min-w-0">
            <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
              Budget
            </p>
            <p className="text-foreground text-sm font-bold">{formatPrice(request.targetBudget)}</p>
          </div>
        </div>

        {/* Delivery Date */}
        <div className="bg-muted/30 border-border/50 hover:bg-muted/50 flex items-start gap-3 rounded-lg border p-3 transition-colors">
          <Truck className="text-brand mt-0.5 h-4 w-4 shrink-0" />
          <div className="min-w-0">
            <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
              Desired Delivery
            </p>
            <p className="text-foreground text-sm font-bold">
              {formatDate(request.desiredDeliveryDate)}
            </p>
          </div>
        </div>
      </div>

      {/* ── PROMPT PREVIEW ── */}
      {request.customerPrompt && (
        <div className="bg-muted/20 border-border/50 rounded-lg border p-3">
          <div className="mb-1 flex items-center gap-1.5">
            <MessageSquare className="text-muted-foreground h-3.5 w-3.5" />
            <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
              My Prompt
            </span>
          </div>
          <p className="text-foreground/80 line-clamp-2 text-sm leading-relaxed italic">
            &ldquo;{request.customerPrompt}&rdquo;
          </p>
        </div>
      )}

      {/* ── STAFF NOTE (when MissingInformation) ── */}
      {request.note && (
        <div className="rounded-lg border border-orange-200 bg-orange-50/50 p-3 dark:border-orange-500/20 dark:bg-orange-500/5">
          <div className="mb-1 flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
            <span className="text-[10px] font-semibold tracking-wider text-orange-700 uppercase dark:text-orange-400">
              Staff Note
            </span>
          </div>
          <p className="text-sm leading-relaxed text-orange-900 dark:text-orange-200">
            {request.note}
          </p>
        </div>
      )}

      {/* ── CARD FOOTER ── */}
      <div className="border-border flex flex-col justify-between gap-4 border-t pt-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          {/* Sketch count indicator */}
          {request.sketchesUrls && request.sketchesUrls.length > 0 && (
            <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <ImageIcon className="h-3.5 w-3.5" />
              {request.sketchesUrls.length} file{request.sketchesUrls.length > 1 ? 's' : ''}{' '}
              attached
            </span>
          )}
        </div>

        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
          <Link
            href={`/profile/custom-designs/${request.id}`}
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg px-6 py-2.5 font-semibold shadow-sm transition-colors md:w-auto"
          >
            <Eye className="h-4 w-4" />
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

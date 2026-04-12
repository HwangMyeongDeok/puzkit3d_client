'use client';

import Image from 'next/image';
import { Minus, Plus, X } from 'lucide-react';
import { useMemo } from 'react';

type SingleItemProps = {
  mode?: 'single';
  open: boolean;
  productName: string;
  partnerName?: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  estimatedPriceText: string;
  quantity: number;
  submitting?: boolean;
  title?: string;
  subtitle?: string;
  confirmLabel?: string;
  onDecrease: () => void;
  onIncrease: () => void;
  onCancel: () => void;
  onConfirm: () => void;
};

type CartReviewItem = {
  id: string;
  productName: string;
  partnerName?: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  estimatedPriceText: string;
  quantity: number;
  lineTotalText?: string;
};

type CartModeProps = {
  mode: 'cart';
  open: boolean;
  items: CartReviewItem[];
  submitting?: boolean;
  title?: string;
  subtitle?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

type Props = SingleItemProps | CartModeProps;

export default function PartnerQuoteConfirmModal(props: Props) {
  if (!props.open) return null;

  const title =
    props.title ||
    (props.mode === 'cart' ? 'Review Request' : 'Request Now');

  const subtitle =
    props.subtitle ||
    (props.mode === 'cart'
      ? 'Selected products are grouped by partner. Each partner will become one request.'
      : 'Review this partner product before confirming your request.');

  const groupedItems = useMemo(() => {
    if (props.mode !== 'cart') return [];

    const map = new Map<
      string,
      {
        partnerName: string;
        items: typeof props.items;
      }
    >();

    for (const item of props.items) {
      const partnerName = item.partnerName?.trim() || 'Partner';

      if (!map.has(partnerName)) {
        map.set(partnerName, {
          partnerName,
          items: [],
        });
      }

      map.get(partnerName)!.items.push(item);
    }

    return Array.from(map.values());
  }, [props]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>

          <button
            type="button"
            onClick={props.onCancel}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-6 overflow-y-auto px-6 py-6">
          {props.mode === 'cart' ? (
            <div className="space-y-5">
              {groupedItems.map((group) => (
                <div key={group.partnerName} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{group.partnerName}</h3>
                      <p className="text-xs text-slate-500">
                        {group.items.length} product{group.items.length !== 1 ? 's' : ''} in this request
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {group.items.map((item) => (
                      <div key={item.id} className="rounded-2xl border bg-white p-4 shadow-sm">
                        <div className="flex flex-col gap-4 md:flex-row">
                          <div className="relative h-24 w-full overflow-hidden rounded-2xl border bg-slate-50 md:h-24 md:w-24 md:shrink-0">
                            {item.thumbnailUrl ? (
                              <Image
                                src={item.thumbnailUrl}
                                alt={item.productName}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                                No image
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h4 className="text-base font-bold text-slate-900">{item.productName}</h4>

                            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                              <div>
                                <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                                  Estimated Price
                                </p>
                                <p className="mt-1 text-base font-bold text-rose-600">
                                  {item.estimatedPriceText}
                                </p>
                              </div>

                              <div>
                                <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                                  Quantity
                                </p>
                                <p className="mt-1 text-base font-bold text-slate-900">{item.quantity}</p>
                              </div>

                              <div>
                                <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                                  Estimated Total
                                </p>
                                <p className="mt-1 text-base font-bold text-slate-900">
                                  {item.lineTotalText || '-'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-5 md:flex-row">
                <div className="relative h-40 w-full overflow-hidden rounded-2xl border bg-slate-50 md:h-40 md:w-40 md:shrink-0">
                  {props.thumbnailUrl ? (
                    <Image
                      src={props.thumbnailUrl}
                      alt={props.productName}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">
                      No image
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-bold text-slate-900">{props.productName}</h3>

                  {props.partnerName ? (
                    <p className="mt-1 text-sm font-semibold tracking-wide text-slate-500 uppercase">
                      {props.partnerName}
                    </p>
                  ) : null}

                  <div className="mt-4 space-y-3">
                    <div>
                      <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                        Estimated Price
                      </p>
                      <p className="mt-1 text-lg font-extrabold text-rose-600">
                        {props.estimatedPriceText}
                      </p>
                    </div>

                    {props.description?.trim() ? (
                      <div>
                        <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                          Description
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {props.description}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border bg-slate-50 px-4 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Quantity</p>
                    <p className="text-xs text-slate-500">
                      Adjust the requested quantity before confirming.
                    </p>
                  </div>

                  <div className="inline-flex items-center rounded-2xl border bg-white">
                    <button
                      type="button"
                      onClick={props.onDecrease}
                      disabled={props.quantity <= 1 || props.submitting}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-l-2xl text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Minus className="h-4 w-4" />
                    </button>

                    <div className="flex h-11 min-w-[64px] items-center justify-center border-x text-base font-bold text-slate-900">
                      {props.quantity}
                    </div>

                    <button
                      type="button"
                      onClick={props.onIncrease}
                      disabled={props.submitting}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-r-2xl text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t px-6 py-5">
          <button
            type="button"
            onClick={props.onCancel}
            disabled={props.submitting}
            className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={props.onConfirm}
            disabled={props.submitting}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {props.submitting ? 'Sending...' : props.confirmLabel || 'Confirm Request'}
          </button>
        </div>
      </div>
    </div>
  );
}
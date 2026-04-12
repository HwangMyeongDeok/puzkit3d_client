'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Receipt, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGetCustomerOrdersQuery } from '@/lib/api/endpoints/orderApi';
import { useGetMyPartnerOrdersQuery } from '@/lib/api/endpoints/partnerOrderApi';
import { SupportTicketDto, useGetTicketsQuery } from '@/lib/api/endpoints/supportTicketApi';

import PaymentActionDialog from '@/components/checkout/PaymentActionDialog';
import OrderStatusFilter from '@/components/order/OrderStatusFilter';
import OrderCard from '@/components/order/OrderCard';
import PartnerOrderCard from '@/components/partnerOrder/PartnerOrderCard';

import type { InstockOrderStatus } from '@/types/api/order.api.types';
import type { PartnerOrderStatus } from '@/types/api/partner-order.api.types';
import { INSTOCK_FILTER_OPTIONS, PARTNER_FILTER_OPTIONS } from '@/lib/utils/order-status';

type OrderTab = 'instock' | 'partner';

export default function OrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchTab = searchParams.get('tab');
  const initialTab: OrderTab = searchTab === 'partner' ? 'partner' : 'instock';

  const [activeTab, setActiveTab] = useState<OrderTab>(initialTab);
  const [paymentDialog, setPaymentDialog] = useState<{
    orderId: string | null;
    orderType: 'instock' | 'partner';
  }>({
    orderId: null,
    orderType: 'instock',
  });

  const [instockStatus, setInstockStatus] = useState<InstockOrderStatus | ''>('');
  const [instockPage, setInstockPage] = useState<number>(1);

  const [partnerStatus, setPartnerStatus] = useState<PartnerOrderStatus | ''>('');
  const [partnerPage, setPartnerPage] = useState<number>(1);

  useEffect(() => {
    setActiveTab(searchTab === 'partner' ? 'partner' : 'instock');
  }, [searchTab]);

  const changeTab = (tab: OrderTab) => {
    setActiveTab(tab);
    router.replace(tab === 'partner' ? '/profile/orders?tab=partner' : '/profile/orders', {
      scroll: false,
    });
  };

  const {
    data: instockData,
    isLoading: isInstockLoading,
    isFetching: isInstockFetching,
    isError: isInstockError,
  } = useGetCustomerOrdersQuery(
    {
      pageNumber: instockPage,
      pageSize: 5,
      ...(instockStatus ? { status: instockStatus } : {}),
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const {
    data: partnerData,
    isLoading: isPartnerLoading,
    isFetching: isPartnerFetching,
    isError: isPartnerError,
  } = useGetMyPartnerOrdersQuery(
    {
      pageNumber: partnerPage,
      pageSize: 5,
      ...(partnerStatus ? { status: partnerStatus } : {}),
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const { data: ticketsData } = useGetTicketsQuery({ pageNumber: 1, pageSize: 100 });
  const allTickets = ticketsData?.items || [];

  const instockOrders = instockData?.items || [];
  const partnerOrders = partnerData?.items || [];

  const handleInstockStatusChange = (status: string) => {
    setInstockStatus((status as InstockOrderStatus) || '');
    setInstockPage(1);
  };

  const handlePartnerStatusChange = (status: string) => {
    setPartnerStatus((status as PartnerOrderStatus) || '');
    setPartnerPage(1);
  };

  const currentTabMeta = useMemo(() => {
    if (activeTab === 'partner') {
      return {
        title: 'Partner Product Orders',
        options: PARTNER_FILTER_OPTIONS,
        selectedStatus: partnerStatus,
        onChange: handlePartnerStatusChange,
      };
    }

    return {
      title: 'Instock Product Orders',
      options: INSTOCK_FILTER_OPTIONS,
      selectedStatus: instockStatus,
      onChange: handleInstockStatusChange,
    };
  }, [activeTab, instockStatus, partnerStatus]);

  return (
    <>
      <div className="flex w-full flex-col gap-6">
        <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">Order History</h1>

        <div className="inline-flex w-fit rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => changeTab('instock')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              activeTab === 'instock'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Instock Product Orders
          </button>
          <button
            type="button"
            onClick={() => changeTab('partner')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              activeTab === 'partner'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Partner Product Orders
          </button>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-slate-600">{currentTabMeta.title}</p>
          <OrderStatusFilter
            selectedStatus={currentTabMeta.selectedStatus}
            onChange={currentTabMeta.onChange}
            options={currentTabMeta.options}
          />
        </div>

        {activeTab === 'instock' ? (
          isInstockLoading ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <Loader2 className="text-brand h-8 w-8 animate-spin" />
            </div>
          ) : isInstockError ? (
            <div className="bg-destructive/10 text-destructive border-destructive/20 rounded-xl border p-6 text-center shadow-sm">
              <p className="font-medium">An error occurred while loading instock order history.</p>
            </div>
          ) : instockOrders.length === 0 ? (
            <div className="border-border flex flex-col items-center justify-center rounded-xl border bg-white py-20 text-center shadow-sm">
              <Receipt className="text-muted-foreground/30 mb-5 h-20 w-20" />
              <h2 className="mb-2 text-xl font-bold text-slate-700">
                {instockStatus ? 'No orders found for this status' : 'No instock orders yet'}
              </h2>
              <p className="text-muted-foreground mb-8">
                {instockStatus
                  ? 'Try selecting "All Orders" to see your full history.'
                  : "You haven't made any instock transactions yet."}
              </p>
              {!instockStatus && (
                <Link
                  href="/shop"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-xl px-8 py-3 font-semibold shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <Package className="h-5 w-5" />
                  Discover Products
                </Link>
              )}
            </div>
          ) : (
            <div className="relative flex flex-col gap-5">
              {isInstockFetching && !isInstockLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/50 backdrop-blur-[1px]">
                  <Loader2 className="text-brand h-8 w-8 animate-spin" />
                </div>
              )}

              {instockOrders.map((order) => {
                const activeTicket = allTickets.find(
                  (t: SupportTicketDto) => t.orderId === order.id && t.status !== 'Resolved'
                );

                return (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onPayNow={(id) =>
                      setPaymentDialog({
                        orderId: id,
                        orderType: 'instock',
                      })
                    }
                    hasComplaint={!!activeTicket}
                    ticketId={activeTicket?.id}
                  />
                );
              })}

              {(instockData?.hasPreviousPage || instockData?.hasNextPage) && (
                <div className="mt-6 flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    disabled={!instockData?.hasPreviousPage || isInstockFetching}
                    onClick={() => setInstockPage((p) => p - 1)}
                    className="gap-2 rounded-lg"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>
                  <span className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
                    Page {instockData?.pageNumber} / {instockData?.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={!instockData?.hasNextPage || isInstockFetching}
                    onClick={() => setInstockPage((p) => p + 1)}
                    className="gap-2 rounded-lg"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )
        ) : isPartnerLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="text-brand h-8 w-8 animate-spin" />
          </div>
        ) : isPartnerError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
            <p className="font-medium text-red-600">
              An error occurred while loading partner order history.
            </p>
          </div>
        ) : partnerOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border bg-white py-20 text-center shadow-sm">
            <Receipt className="mb-5 h-20 w-20 text-slate-300" />
            <h2 className="mb-2 text-xl font-bold text-slate-700">
              {partnerStatus ? 'No partner orders found for this status' : 'No partner orders yet'}
            </h2>
            <p className="text-slate-500">
              {partnerStatus
                ? 'Try selecting "All Orders" to see your full partner order history.'
                : 'Your partner product orders will appear here after checkout.'}
            </p>
          </div>
        ) : (
          <div className="relative flex flex-col gap-5">
            {isPartnerFetching && !isPartnerLoading ? (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/50 backdrop-blur-[1px]">
                <Loader2 className="text-brand h-8 w-8 animate-spin" />
              </div>
            ) : null}

            {partnerOrders.map((order) => (
              <PartnerOrderCard
                key={order.id}
                order={order}
                onPayNow={(id: string) =>
                  setPaymentDialog({
                    orderId: id,
                    orderType: 'partner',
                  })
                }
              />
            ))}

            {partnerData?.hasPreviousPage || partnerData?.hasNextPage ? (
              <div className="mt-6 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  disabled={!partnerData?.hasPreviousPage || isPartnerFetching}
                  onClick={() => setPartnerPage((p) => p - 1)}
                  className="gap-2 rounded-lg"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>

                <span className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
                  Page {partnerData?.pageNumber} / {partnerData?.totalPages}
                </span>

                <Button
                  variant="outline"
                  disabled={!partnerData?.hasNextPage || isPartnerFetching}
                  onClick={() => setPartnerPage((p) => p + 1)}
                  className="gap-2 rounded-lg"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <PaymentActionDialog
        open={!!paymentDialog.orderId}
        orderId={paymentDialog.orderId}
        onClose={() =>
          setPaymentDialog({
            orderId: null,
            orderType: 'instock',
          })
        }
        redirectRoute={
          paymentDialog.orderType === 'partner'
            ? '/profile/orders?tab=partner'
            : '/profile/orders'
        }
        orderType={paymentDialog.orderType}
      />
    </>
  );
}
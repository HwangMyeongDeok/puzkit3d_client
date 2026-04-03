'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

// REDUX & API HOOKS
import { useAppSelector, useAppDispatch } from '@/stores';
import { selectCurrentUser } from '@/stores/slices/authSlice';
import { selectSelectedIds, clearSelection } from '@/stores/slices/checkoutSlice';
import { useGetCartQuery } from '@/lib/api/endpoints/cartApi';
import { useCreateInstockOrderMutation } from '@/lib/api/endpoints/orderApi';
import { useGetShippingFeeQuery } from '@/lib/api/endpoints/deliveryApi';
import { useLazyGetProfileQuery, useUpdateProfileMutation } from '@/lib/api/endpoints/authApi';
import { useGetWalletQuery } from '@/lib/api/endpoints/walletApi';
import {
  useGetOrderConfigQuery,
  useGetPaymentConfigQuery,
  useGetWalletConfigQuery,
} from '@/lib/api/endpoints/configApi';

// UTILS & CONSTANTS
import { handleErrorToast } from '@/lib/utils/error-handler';
import { APP_CONFIG, ROUTES } from '@/constants';

// SCHEMAS & TYPES
import {
  checkoutSchema,
  type CheckoutFormValues,
  type Province,
  type District,
  type Ward,
} from '@/schema/checkout.schema';
import type { CreateInstockOrderRequestDto } from '@/types/api/order.api.types';
import type { CartItemDto } from '@/types/api/cart.api.types';

// UI COMPONENTS
import { Form } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';

// CHECKOUT COMPONENTS
import PaymentActionDialog from '@/components/checkout/PaymentActionDialog';
import CheckoutAddressForm from '@/components/checkout/CheckoutAddressForm';
import CheckoutPaymentSection from '@/components/checkout/CheckoutPaymentSection';
import CheckoutOrderSummary from '@/components/checkout/CheckoutOrderSummary';
import BusinessPolicyDialog from '@/components/checkout/BusinessPolicyDialog';
import CheckoutLoader from '@/components/checkout/CheckoutLoader';

interface AuthUser {
  email?: string;
  id?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser) as AuthUser | null;

  // RTK Query hooks
  const [fetchProfile, { data: profile }] = useLazyGetProfileQuery();
  const [updateProfile] = useUpdateProfileMutation();
  const { data: cartData, isLoading: isCartLoading } = useGetCartQuery();
  const [createOrder] = useCreateInstockOrderMutation();
  const { data: walletData, refetch: refetchWallet } = useGetWalletQuery(undefined, {
    skip: !user,
  });

  // Config hooks (Business Rules)
  const { data: orderConfig } = useGetOrderConfigQuery();
  const { data: paymentConfig } = useGetPaymentConfigQuery();
  const { data: walletConfig } = useGetWalletConfigQuery();

  // State Management
  const allCartItems: CartItemDto[] = cartData?.items || [];
  const selectedIdsFromRedux = useAppSelector(selectSelectedIds);

  const [activeIds, setActiveIds] = useState<string[]>([]);
  const [isRestored, setIsRestored] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState<boolean>(false);

  // Coin State
  const [usedCoinInput, setUsedCoinInput] = useState<number>(0);
  const [isUsingMaxCoin, setIsUsingMaxCoin] = useState<boolean>(false);

  // Policy Dialog State
  const [showTermsDialog, setShowTermsDialog] = useState<boolean>(false);
  const [pendingOrderData, setPendingOrderData] = useState<CheckoutFormValues | null>(null);

  // Guard chống double-submit (race condition)
  const isProcessingRef = useRef<boolean>(false);

  // Restore selected items
  useEffect(() => {
    if (selectedIdsFromRedux.length > 0) {
      sessionStorage.setItem('checkout_active_ids', JSON.stringify(selectedIdsFromRedux));
      setActiveIds(selectedIdsFromRedux);
    } else {
      const saved = sessionStorage.getItem('checkout_active_ids');
      if (saved) {
        try {
          setActiveIds(JSON.parse(saved));
        } catch (e) {}
      }
    }

    setIsRestored(true);
  }, [selectedIdsFromRedux]);

  const selectedItems: CartItemDto[] = useMemo(() => {
    if (activeIds.length === 0) return [];
    const idSet = new Set(activeIds);
    return allCartItems.filter((item: CartItemDto) => idSet.has(item.itemId));
  }, [allCartItems, activeIds]);

  useEffect(() => {
    if (
      isRestored &&
      !isCartLoading &&
      selectedItems.length === 0 &&
      !isSubmitting &&
      !isRedirecting &&
      !showPaymentDialog
    ) {
      toast.warning('No items selected!');
      router.replace(ROUTES.CART);
    }
  }, [isCartLoading, selectedItems.length, isSubmitting, isRedirecting, showPaymentDialog, router]);

  const subtotal = selectedItems.reduce(
    (sum, item) => sum + (item.unitPrice ?? 0) * (item.quantity ?? 1),
    0
  );

  // Form setup
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      provinceName: '',
      districtName: '',
      wardName: '',
      address: '',
      paymentMethod: 'COD',
      saveProfile: false,
    },
  });

  const { provinceName, districtName, wardName } = form.watch();
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<string>('');

  const { data: shippingFeeData, isFetching: isShippingFeeLoading } = useGetShippingFeeQuery(
    { provinceName, districtName, wardName },
    { skip: !provinceName || !districtName || !wardName }
  );

  const shippingFee = shippingFeeData ?? 0;
  const availableCoin = walletData?.balance ?? 0;
  const baseTotal = subtotal + shippingFee;
  const finalTotal = Math.max(0, baseTotal - usedCoinInput);

  // Location Data State
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const isAutoFilling = useRef(false);
  const pendingWardName = useRef<string>('');

  // Fetch Profile & Locations
  useEffect(() => {
    fetchProfile(undefined, false);
  }, [fetchProfile]);

  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/v1/p/')
      .then((res) => res.json())
      .then((data: Province[]) => setProvinces(data))
      .catch((err) => console.error('Error fetching Province data:', err));
  }, []);

  useEffect(() => {
    if (selectedProvinceCode) {
      setDistricts([]);
      fetch(`https://provinces.open-api.vn/api/v1/p/${selectedProvinceCode}?depth=2`)
        .then((res) => res.json())
        .then((data: { districts: District[] }) => setDistricts(data.districts || []));
    } else {
      setDistricts([]);
    }
  }, [selectedProvinceCode]);

  useEffect(() => {
    if (selectedDistrictCode) {
      setWards([]);
      fetch(`https://provinces.open-api.vn/api/v1/d/${selectedDistrictCode}?depth=2`)
        .then((res) => res.json())
        .then((data: { wards: Ward[] }) => setWards(data.wards || []));
    } else {
      setWards([]);
    }
  }, [selectedDistrictCode]);

  // Sync Profile -> Form
  useEffect(() => {
    if (!profile) return;
    isAutoFilling.current = true;
    const fullNameArr = [];
    if (profile.firstName) fullNameArr.push(profile.firstName);
    if (profile.lastName) fullNameArr.push(profile.lastName);
    const fullName = fullNameArr.join(' ').trim();

    if (fullName) form.setValue('fullName', fullName);
    if (profile.phoneNumber) form.setValue('phone', profile.phoneNumber);
    if (profile.streetAddress) form.setValue('address', profile.streetAddress);
    if (profile.provinceName) form.setValue('provinceName', profile.provinceName);
    if (profile.districtName) form.setValue('districtName', profile.districtName);
    if (profile.wardName) form.setValue('wardName', profile.wardName);

    if (profile.districtId && !selectedDistrictCode) setSelectedDistrictCode(profile.districtId);
    form.setValue('saveProfile', !profile.streetAddress);

    if (provinces.length > 0 && profile.provinceName) {
      const p = provinces.find(
        (x: Province) =>
          String(x.code) === profile.provinceId ||
          x.name === profile.provinceName ||
          x.name.includes(profile.provinceName!) ||
          profile.provinceName!.includes(x.name)
      );
      if (p) setSelectedProvinceCode(String(p.code));
    } else if (profile.provinceId) {
      setSelectedProvinceCode(profile.provinceId);
    }

    if (profile.districtId) setSelectedDistrictCode(profile.districtId);

    const savedDraft = localStorage.getItem(APP_CONFIG.DRAFT_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft) as Partial<CheckoutFormValues>;
        if (!profile?.phoneNumber && parsed.phone) form.setValue('phone', parsed.phone);
        if (!profile?.streetAddress && parsed.address) form.setValue('address', parsed.address);
        if (!form.getValues('fullName') && parsed.fullName)
          form.setValue('fullName', parsed.fullName);
        if (parsed.paymentMethod) form.setValue('paymentMethod', parsed.paymentMethod);
      } catch (e) {
        localStorage.removeItem(APP_CONFIG.DRAFT_KEY);
      }
    }
    if (profile.wardName) pendingWardName.current = profile.wardName;
  }, [profile, provinces, form, selectedDistrictCode]);

  // Sync Selects <-> Inputs
  useEffect(() => {
    if (provinces.length > 0 && provinceName) {
      const p = provinces.find(
        (x: Province) =>
          String(x.code) === selectedProvinceCode ||
          x.name === provinceName ||
          x.name.includes(provinceName) ||
          provinceName.includes(x.name)
      );
      if (p) {
        if (selectedProvinceCode !== String(p.code)) setSelectedProvinceCode(String(p.code));
        if (p.name !== provinceName)
          form.setValue('provinceName', p.name, { shouldValidate: true });
      }
    }
  }, [provinces, provinceName, selectedProvinceCode, form]);

  useEffect(() => {
    if (districts.length === 0 || !districtName) return;
    const d = districts.find(
      (x: District) =>
        String(x.code) === selectedDistrictCode ||
        x.name === districtName ||
        x.name.includes(districtName) ||
        districtName.includes(x.name)
    );
    if (d) {
      if (selectedDistrictCode !== String(d.code)) setSelectedDistrictCode(String(d.code));
      if (d.name !== districtName) form.setValue('districtName', d.name, { shouldValidate: true });
    }
  }, [districts, districtName, selectedDistrictCode, form]);

  useEffect(() => {
    if (wards.length === 0) return;
    if (isAutoFilling.current && pendingWardName.current) {
      const w = wards.find(
        (x: Ward) =>
          x.name === pendingWardName.current ||
          x.name.includes(pendingWardName.current) ||
          pendingWardName.current.includes(x.name)
      );
      if (w) form.setValue('wardName', w.name, { shouldValidate: true });
      pendingWardName.current = '';
      isAutoFilling.current = false;
      return;
    }
    if (wardName) {
      const w = wards.find(
        (x: Ward) => x.name === wardName || x.name.includes(wardName) || wardName.includes(x.name)
      );
      if (w && w.name !== wardName) form.setValue('wardName', w.name, { shouldValidate: true });
    }
  }, [wards, wardName, form]);

  // ==========================================
  // HANDLERS
  // ==========================================

  // 1. Chặn form submit để mở Dialog Policy
  const handlePreSubmit = (data: CheckoutFormValues) => {
    setPendingOrderData(data);
    setShowTermsDialog(true);
  };

  // 2. Chạy execute order sau khi đồng ý Policy
  const executeOrder = async () => {
    if (!pendingOrderData) return;

    // Guard chống double-submit: nếu đang xử lý thì bỏ qua
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    setShowTermsDialog(false);
    setIsSubmitting(true);

    const data = pendingOrderData;

    try {
      let latestProfile = profile;
      try {
        latestProfile = await fetchProfile(undefined, false).unwrap();
      } catch (profileError) {
        toast.warning('Network unstable. Proceeding with current session data.');
      }

      const isPayFullByCoin = finalTotal === 0 && usedCoinInput > 0;
      const finalPaymentMethod = isPayFullByCoin ? 'COIN' : data.paymentMethod;

      const orderPayload: CreateInstockOrderRequestDto = {
        customerName: data.fullName,
        customerPhone: data.phone,
        customerEmail: latestProfile?.email || user?.email || '',
        customerProvinceName: data.provinceName,
        customerDistrictName: data.districtName,
        customerWardName: data.wardName,
        customerDetailAddress: data.address,
        cartItems: selectedItems.map((item: CartItemDto) => ({
          itemId: item.itemId,
          priceDetailId: item.priceDetailId,
          quantity: item.quantity ?? 1,
        })),
        shippingFee: shippingFee,
        usedCoinAmount: usedCoinInput,
        grandTotalAmount: finalTotal,
        paymentMethod: finalPaymentMethod,
      };

      const orderId = await createOrder(orderPayload).unwrap();
      await refetchWallet();

      if (data.saveProfile) {
        const nameParts = data.fullName.trim().split(' ');
        const lastName = nameParts.length > 1 ? nameParts.pop() || '' : ' ';
        const firstName = nameParts.join(' ');
        try {
          await updateProfile({
            firstName: firstName || data.fullName,
            lastName,
            phoneNumber: data.phone,
            streetAddress: data.address,
            provinceName: data.provinceName,
            districtName: data.districtName,
            wardName: data.wardName,
          }).unwrap();
        } catch (updateErr) {}
      }

      if (finalTotal === 0 || data.paymentMethod === 'COD') {
        dispatch(clearSelection());
        localStorage.removeItem(APP_CONFIG.DRAFT_KEY);
        sessionStorage.removeItem('checkout_active_ids');
        setIsRedirecting(true);
        toast.success('Order placed successfully!');
        router.push(`${ROUTES.CHECKOUT_SUCCESS}?orderId=${orderId}`);
      } else if (data.paymentMethod === 'Online') {
        setCreatedOrderId(orderId);
        setShowPaymentDialog(true);
      }
    } catch (error) {
      handleErrorToast(error);
      setIsRedirecting(false);
    } finally {
      setIsSubmitting(false);
      isProcessingRef.current = false;
    }
  };

  const isButtonDisabled =
    isSubmitting || isShippingFeeLoading || !provinceName || !districtName || !wardName;

  if (isCartLoading || isRedirecting || !isRestored) {
    return (
      <div className="container-custom mx-auto min-h-screen bg-slate-50/50 py-8 lg:py-12">
        <Skeleton className="mb-8 h-10 w-48 rounded-lg" />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="flex flex-col gap-8 lg:col-span-3">
            <Skeleton className="h-[500px] w-full rounded-xl shadow-sm" />
            <Skeleton className="h-[250px] w-full rounded-xl shadow-sm" />
          </div>

          <div className="flex flex-col gap-6 lg:col-span-2">
            <Skeleton className="sticky top-20 h-[600px] w-full rounded-xl shadow-sm" />
          </div>
        </div>
      </div>
    );
  }

  // 2. Màn hình Trống (Empty State) đề phòng useEffect redirect bị delay
  if (selectedItems.length === 0) {
    return (
      <div className="container-custom flex min-h-[60vh] flex-col items-center justify-center py-12">
        <h2 className="mb-2 text-2xl font-bold text-slate-800">No items selected</h2>
        <p className="mb-6 text-slate-500">
          Please select at least one item from the cart to continue checkout.
        </p>
        <button
          onClick={() => router.push(ROUTES.CART)}
          className="rounded-lg bg-[#e51636] px-6 py-2.5 font-semibold text-white transition-colors hover:bg-red-700"
        >
          Back to cart
        </button>
      </div>
    );
  }

  return (
    <>
      {/* LOADER OVERLAY */}
      <CheckoutLoader isLoading={isSubmitting || isRedirecting} />

      {/* POLICY DIALOG */}
      <BusinessPolicyDialog
        isOpen={showTermsDialog}
        onClose={() => setShowTermsDialog(false)}
        onConfirm={executeOrder}
        orderConfig={orderConfig}
        paymentConfig={paymentConfig}
        walletConfig={walletConfig}
      />

      {/* MAIN CHECKOUT PAGE */}
      <div className="container-custom min-h-screen bg-slate-50/50 py-8 lg:py-12">
        <h1 className="mb-8 text-3xl font-bold text-slate-800 md:text-4xl">Checkout</h1>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handlePreSubmit)}
            className="grid grid-cols-1 gap-8 lg:grid-cols-5"
          >
            {/* Cột trái: Thông tin địa chỉ & Phương thức thanh toán */}
            <div className="flex flex-col gap-8 lg:col-span-3">
              <CheckoutAddressForm
                form={form}
                provinces={provinces}
                districts={districts}
                wards={wards}
                selectedProvinceCode={selectedProvinceCode}
                setSelectedProvinceCode={setSelectedProvinceCode}
                selectedDistrictCode={selectedDistrictCode}
                setSelectedDistrictCode={setSelectedDistrictCode}
                isAutoFilling={isAutoFilling}
              />
              <CheckoutPaymentSection form={form} />
            </div>

            {/* Cột phải: Tổng kết đơn hàng & Nút đặt hàng */}
            <div className="flex flex-col gap-6 lg:col-span-2">
              <CheckoutOrderSummary
                selectedItems={selectedItems}
                subtotal={subtotal}
                shippingFee={shippingFee}
                total={finalTotal}
                availableCoin={availableCoin}
                usedCoinInput={usedCoinInput}
                setUsedCoinInput={setUsedCoinInput}
                isUsingMaxCoin={isUsingMaxCoin}
                setIsUsingMaxCoin={setIsUsingMaxCoin}
                isSubmitting={isSubmitting}
                isShippingFeeLoading={isShippingFeeLoading}
                isButtonDisabled={isButtonDisabled}
              />
            </div>
          </form>
        </Form>
      </div>

      {/* ONLINE PAYMENT DIALOG (VNPay / PayOS) */}
      <PaymentActionDialog
        open={showPaymentDialog}
        orderId={createdOrderId}
        onClose={() => {
          setShowPaymentDialog(false);

          dispatch(clearSelection());
          localStorage.removeItem(APP_CONFIG.DRAFT_KEY);
          sessionStorage.removeItem('checkout_active_ids');
          toast.info('Order saved! You can complete the payment later in your profile.');

          router.push('/orders');
        }}
      />
    </>
  );
}

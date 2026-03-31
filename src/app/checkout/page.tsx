'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ShoppingBag, ArrowRight, Loader2, Coins } from 'lucide-react'; // 👉 Đã thêm icon Coins
import { toast } from 'sonner';

import { useAppSelector, useAppDispatch } from '@/stores';
import { selectCurrentUser } from '@/stores/slices/authSlice';
import { selectSelectedIds, clearSelection } from '@/stores/slices/checkoutSlice';
import { useGetCartQuery } from '@/lib/api/endpoints/cartApi';
import { useCreateInstockOrderMutation } from '@/lib/api/endpoints/orderApi';
import { useGetShippingFeeQuery } from '@/lib/api/endpoints/deliveryApi';
import { handleErrorToast } from '@/lib/utils/error-handler';
import { APP_CONFIG, ROUTES } from '@/constants';
import { useLazyGetProfileQuery, useUpdateProfileMutation } from '@/lib/api/endpoints/authApi';
import { Form } from '@/components/ui/form';

import { useGetWalletQuery } from '@/lib/api/endpoints/walletApi';

import {
  checkoutSchema,
  type CheckoutFormValues,
  type Province,
  type District,
  type Ward,
} from '@/schema/checkout.schema';
import type { CreateInstockOrderRequestDto } from '@/types/api/order.api.types';
import type { CartItemDto } from '@/types/api/cart.api.types';

// IMPORT COMPONENTS
import PaymentActionDialog from '@/components/checkout/PaymentActionDialog';
import CheckoutAddressForm from '@/components/checkout/CheckoutAddressForm';
import CheckoutPaymentSection from '@/components/checkout/CheckoutPaymentSection';
import CheckoutOrderSummary from '@/components/checkout/CheckoutOrderSummary';

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

  // 👉 LẤY DATA VÍ
  const { data: walletData, refetch: refetchWallet } = useGetWalletQuery(undefined, {
    skip: !user,
  });

  const allCartItems: CartItemDto[] = cartData?.items || [];
  const selectedIdsFromRedux = useAppSelector(selectSelectedIds);

  const [activeIds, setActiveIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState<boolean>(false);

  // 👉 STATE CHO COIN
  const [usedCoinInput, setUsedCoinInput] = useState<number>(0);
  const [isUsingMaxCoin, setIsUsingMaxCoin] = useState<boolean>(false);

  // Lấy các sản phẩm đang được chọn
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
  }, [selectedIdsFromRedux]);

  const selectedItems: CartItemDto[] = useMemo(() => {
    if (activeIds.length === 0) return [];
    const idSet = new Set(activeIds);
    return allCartItems.filter((item: CartItemDto) => idSet.has(item.itemId));
  }, [allCartItems, activeIds]);

  const subtotal = selectedItems.reduce(
    (sum, item) => sum + (item.unitPrice ?? 0) * (item.quantity ?? 1),
    0
  );

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

  // 👉 LOGIC TÍNH TIỀN MỚI CÓ COIN
  const availableCoin = walletData?.balance ?? 0;
  const baseTotal = subtotal + shippingFee;
  const finalTotal = Math.max(0, baseTotal - usedCoinInput);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // ==========================================
  // GIỮ NGUYÊN TOÀN BỘ LOGIC FETCH ĐỊA CHỈ
  // ==========================================
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

  const isAutoFilling = useRef(false);
  const pendingWardName = useRef<string>('');

  // AUTO-FILL PROFILE
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
  }, [profile, provinces]);

  // ĐỒNG BỘ ĐỊA CHỈ
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
  }, [districts, districtName]);

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
  }, [wards]);

  // ==========================================
  // SUBMIT ĐƠN HÀNG (CẬP NHẬT COIN PAYLOAD)
  // ==========================================
  const onSubmit = async (data: CheckoutFormValues) => {
    setIsSubmitting(true);
    try {
      const latestProfile = await fetchProfile(undefined, false)
        .unwrap()
        .catch(() => profile);

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
      dispatch(clearSelection());
      localStorage.removeItem(APP_CONFIG.DRAFT_KEY);
      sessionStorage.removeItem('checkout_active_ids');

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
        setIsRedirecting(true);
        toast.success('Order placed successfully!');
        router.push(`${ROUTES.CHECKOUT_SUCCESS}?orderId=${orderId}`);
      } else if (data.paymentMethod === 'Online') {
        setCreatedOrderId(orderId);
        setIsSubmitting(false);
        setShowPaymentDialog(true);
      }
    } catch (error) {
      handleErrorToast(error);
      setIsSubmitting(false);
      setIsRedirecting(false);
    }
  };

  const isButtonDisabled =
    isSubmitting || isShippingFeeLoading || !provinceName || !districtName || !wardName;

  return (
    <>
      {(isSubmitting || isRedirecting) && (
        <div className="bg-background/80 fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 backdrop-blur-md">
          <Loader2 className="text-brand h-12 w-12 animate-spin" />
          <p className="text-xl font-bold">Processing your order...</p>
        </div>
      )}

      <div className="container-custom min-h-screen bg-slate-50/50 py-8 lg:py-12">
        <h1 className="mb-8 text-3xl font-bold text-slate-800 md:text-4xl">Checkout</h1>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-8 lg:grid-cols-5"
          >
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

            {/* CỘT BÊN PHẢI ĐƯỢC CHIA LÀM 2 KHỐI RÕ RÀNG */}
            <div className="flex flex-col gap-6 lg:col-span-2">
              {/* KHỐI TỔNG KẾT ĐƠN HÀNG (Giữ nguyên) */}
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

      <PaymentActionDialog
        open={showPaymentDialog}
        orderId={createdOrderId}
        onClose={() => setShowPaymentDialog(false)}
      />
    </>
  );
}

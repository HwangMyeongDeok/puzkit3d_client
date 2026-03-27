'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
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

// IMPORT SCHEMAS & TYPES CHUẨN XÁC
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

// Định nghĩa Type an toàn cho User Redux
interface AuthUser {
  email?: string;
  id?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Ép type rõ ràng cho user
  const user = useAppSelector(selectCurrentUser) as AuthUser | null;

  // RTK Query hooks
  const [fetchProfile, { data: profile }] = useLazyGetProfileQuery();
  const [updateProfile] = useUpdateProfileMutation();
  const { data: cartData, isLoading: isCartLoading } = useGetCartQuery();
  const [createOrder] = useCreateInstockOrderMutation();

  // Ép type mảng giỏ hàng
  const allCartItems: CartItemDto[] = cartData?.items || [];
  const selectedIdsFromRedux = useAppSelector(selectSelectedIds);

  const [activeIds, setActiveIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState<boolean>(false);

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

  // Lọc list sản phẩm có type rõ ràng
  const selectedItems: CartItemDto[] = useMemo(() => {
    if (activeIds.length === 0) return [];
    const idSet = new Set(activeIds);
    return allCartItems.filter((item: CartItemDto) => idSet.has(item.itemId));
  }, [allCartItems, activeIds]);

  const subtotal = selectedItems.reduce(
    (sum, item) => sum + (item.unitPrice ?? 0) * (item.quantity ?? 1),
    0
  );

  // Khởi tạo form
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

  const provinceName = form.watch('provinceName');
  const districtName = form.watch('districtName');
  const wardName = form.watch('wardName');

  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<string>('');

  const { data: shippingFeeData, isFetching: isShippingFeeLoading } = useGetShippingFeeQuery(
    { provinceName, districtName, wardName },
    { skip: !provinceName || !districtName || !wardName }
  );

  const shippingFee = shippingFeeData ?? 0;
  const total = subtotal + shippingFee;

  // State cho Tỉnh/Quận/Phường với type chuẩn từ API
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // ==========================================
  // FETCH LOCATION DATA
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

  // ==========================================
  // AUTO-FILL & ĐỒNG BỘ ĐỊA CHỈ (ĐÃ KHỬ ANY)
  // ==========================================
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
  // XỬ LÝ SUBMIT ĐƠN HÀNG (FIXED BUG PAYLOAD)
  // ==========================================
  const onSubmit = async (data: CheckoutFormValues) => {
    setIsSubmitting(true);
    try {
      const latestProfile = await fetchProfile(undefined, false)
        .unwrap()
        .catch(() => profile);

      // FIX LỖI 400 API CHỖ NÀY: Ép giá trị rõ ràng, ánh xạ đúng tên properties
      const orderPayload: CreateInstockOrderRequestDto = {
        customerName: data.fullName,
        customerPhone: data.phone,
        customerEmail: latestProfile?.email || user?.email || '',
        customerProvinceName: data.provinceName,
        customerDistrictName: data.districtName,
        customerWardName: data.wardName,
        customerDetailAddress: data.address,

        // Map đúng priceDetailId thay vì inStockProductPriceDetailId
        cartItems: selectedItems.map((item: CartItemDto) => ({
          itemId: item.itemId,
          // Đảm bảo lấy ID giá chuẩn xác (dù mảng gốc trả về tên gì)
          priceDetailId: item.priceDetailId,
          // Ép số lượng đàng hoàng, fallback về 1 nếu lỗi null
          quantity: item.quantity ?? 1,
        })),

        shippingFee: shippingFee,
        usedCoinAmount: 0,
        grandTotalAmount: total,
        paymentMethod: data.paymentMethod,
      };

      const orderId = await createOrder(orderPayload).unwrap();
      dispatch(clearSelection());
      localStorage.removeItem(APP_CONFIG.DRAFT_KEY);
      sessionStorage.removeItem('checkout_active_ids');

      const isAddressChanged =
        data.address !== latestProfile?.streetAddress ||
        data.wardName !== latestProfile?.wardName ||
        data.districtName !== latestProfile?.districtName ||
        data.provinceName !== latestProfile?.provinceName ||
        data.phone !== latestProfile?.phoneNumber ||
        data.fullName !== `${latestProfile?.firstName} ${latestProfile?.lastName}`.trim();

      if (data.saveProfile && (!latestProfile?.streetAddress || isAddressChanged)) {
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
        } catch (updateErr: unknown) {
          toast.error('Failed to save information manually in your profile');
        }
      }

      if (data.paymentMethod === 'Online') {
        setCreatedOrderId(orderId);
        setIsSubmitting(false);
        setShowPaymentDialog(true);
      } else {
        setIsRedirecting(true);
        toast.success('Order placed successfully!');
        router.push(`${ROUTES.CHECKOUT_SUCCESS}?orderId=${orderId}`);
      }
    } catch (error) {
      handleErrorToast(error);
      setIsSubmitting(false);
      setIsRedirecting(false);
    }
  };

  // ==========================================
  // RENDER UI CHÍNH
  // ==========================================
  if (isCartLoading) {
    return (
      <div className="container-custom flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <Loader2 className="text-brand mb-4 h-10 w-10 animate-spin" />
        <p className="text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  if (selectedItems.length === 0 && !isSubmitting && !showPaymentDialog && !isRedirecting) {
    return (
      <div className="container-custom flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <ShoppingBag className="text-muted-foreground/40 mb-4 h-16 w-16" />
        <h1 className="mb-2 text-2xl font-bold">No products selected</h1>
        <p className="text-muted-foreground mb-6">
          Please return to the cart and select products to checkout.
        </p>
        <Link
          href={ROUTES.CART}
          className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
        >
          Return to Cart <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const isButtonDisabled =
    isSubmitting || isShippingFeeLoading || !provinceName || !districtName || !wardName;

  return (
    <>
      {(isSubmitting || isRedirecting) && (
        <div className="bg-background/80 fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 backdrop-blur-md">
          <div className="relative">
            <div className="bg-brand/20 absolute -inset-4 animate-pulse rounded-full blur-xl" />
            <Loader2 className="text-brand relative h-12 w-12 animate-spin" />
          </div>
          <p className="text-foreground text-xl font-bold tracking-tight">
            Processing your order...
          </p>
          <p className="text-muted-foreground animate-pulse">Please do not refresh the browser</p>
        </div>
      )}

      <div className="container-custom min-h-screen bg-slate-50/50 py-8 lg:py-12">
        <h1 className="mb-8 text-3xl font-bold text-slate-800 md:text-4xl">Checkout</h1>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-8 lg:grid-cols-5"
          >
            {/* CỘT TRÁI (Address + Payment) */}
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

            {/* CỘT PHẢI (Order Summary) */}
            <div className="lg:col-span-2">
              <CheckoutOrderSummary
                selectedItems={selectedItems}
                subtotal={subtotal}
                shippingFee={shippingFee}
                total={total}
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

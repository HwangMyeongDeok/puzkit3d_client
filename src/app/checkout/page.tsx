'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Banknote,
  CreditCard,
  Wallet,
  ShieldCheck,
  Lock,
  ShoppingBag,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

import { formatPrice } from '@/lib/utils';
import { useAppSelector, useAppDispatch } from '@/stores';
import { selectCurrentUser } from '@/stores/slices/authSlice';
import { selectSelectedIds, clearSelection } from '@/stores/slices/checkoutSlice';
import { useGetCartQuery } from '@/lib/api/endpoints/cartApi';
import { useCreateInstockOrderMutation } from '@/lib/api/endpoints/orderApi';
import { useGetShippingFeeQuery } from '@/lib/api/endpoints/deliveryApi';
import type { CreateInstockOrderRequestDto } from '@/types/api/order.api.types';
import { handleApiError } from '@/lib/utils/error-handle';
import { APP_CONFIG, ROUTES } from '@/constants';

import { useLazyGetProfileQuery, useUpdateProfileMutation } from '@/lib/api/endpoints/authApi';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

// NHẬN CÁC FILE ĐÃ TÁCH TỪ KIẾN TRÚC MỚI
import {
  checkoutSchema,
  type CheckoutFormValues,
  type Province,
  type District,
  type Ward,
} from '@/schema/checkout.schema';
import PaymentActionDialog from '@/components/checkout/PaymentActionDialog';

const PAYMENT_METHODS = [
  {
    id: 'COD',
    label: 'Cash on Delivery (COD)',
    description: 'Pay with cash upon delivery',
    icon: Banknote,
  },
  {
    id: 'Online',
    label: 'Online Payment',
    description: 'Pay via VNPay / MOMO e-wallet',
    icon: Wallet,
  },
] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Type tạm user cho chặt chẽ (hoặc import type chính xác từ model của sếp)
  const user = useAppSelector(selectCurrentUser) as { email?: string } | null;

  // RTK Query hooks
  const [fetchProfile, { data: profile }] = useLazyGetProfileQuery();
  const [updateProfile] = useUpdateProfileMutation();

  const { data: cartData, isLoading: isCartLoading } = useGetCartQuery();
  const allCartItems = cartData?.items || [];

  const [createOrder] = useCreateInstockOrderMutation();

  const selectedIdsFromRedux = useAppSelector(selectSelectedIds);

  // ==========================================
  // FIX 1: CHỐNG F5 MẤT ĐƠN HÀNG BẰNG SESSION
  // ==========================================
  const [activeIds, setActiveIds] = useState<string[]>([]);

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

  const selectedItems = useMemo(() => {
    if (activeIds.length === 0) return [];
    const idSet = new Set(activeIds);
    return allCartItems.filter((item) => idSet.has(item.itemId));
  }, [allCartItems, activeIds]);
  // ==========================================

  const subtotal = selectedItems.reduce(
    (sum, item) => sum + (item.unitPrice ?? 0) * item.quantity,
    0
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState<boolean>(false);

  // Setup Form với Types chặt chẽ
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
      saveProfile: false, // Để false, sẽ tự bật lên nếu user chưa có địa chỉ
    },
  });

  // PHẢI WATCH ĐỂ ĐIỀU KIỆN DISABLED HOẠT ĐỘNG ĐÚNG
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

  // KHAI BÁO STATE CỤC BỘ ĐỂ RE-RENDER CHÍNH XÁC (Tránh lỗi closure của custom hook)
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  useEffect(() => {
    fetchProfile(undefined, false);
  }, [fetchProfile]);

  // FETCH TỈNH/THÀNH VÀO LẦN ĐẦU TIÊN
  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/v1/p/')
      .then((res) => res.json())
      .then((data) => setProvinces(data))
      .catch((err) => console.error('Error fetching Province data:', err));
  }, []);

  // FETCH QUẬN/HUYỆN MỖI KHI TỈNH THAY ĐỔI
  useEffect(() => {
    if (selectedProvinceCode) {
      setDistricts([]); // Reset list tạm
      fetch(`https://provinces.open-api.vn/api/v1/p/${selectedProvinceCode}?depth=2`)
        .then((res) => res.json())
        .then((data) => setDistricts(data.districts || []))
        .catch((err) => console.error('Error fetching District data:', err));
    } else {
      setDistricts([]);
    }
  }, [selectedProvinceCode]);

  // FETCH PHƯỜNG/XÃ MỖI KHI QUẬN THAY ĐỔI
  useEffect(() => {
    if (selectedDistrictCode) {
      setWards([]); // Reset list tạm
      fetch(`https://provinces.open-api.vn/api/v1/d/${selectedDistrictCode}?depth=2`)
        .then((res) => res.json())
        .then((data) => setWards(data.wards || []))
        .catch((err) => console.error('Error fetching Ward data:', err));
    } else {
      setWards([]);
    }
  }, [selectedDistrictCode]);
  const isAutoFilling = useRef(false);
  const pendingWardName = useRef<string>('');
  // 1. AUTO-FILL TỪ PROFILE VÀ DRAFT (Ưu tiên Profile mới nhất cho Địa Chỉ)
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
    if (profile.districtId && !selectedDistrictCode) {
      setSelectedDistrictCode(profile.districtId);
    }
    form.setValue('saveProfile', !profile.streetAddress);

    // ✅ FIX: Chỉ set code nếu provinces đã load rồi, tự tìm code từ tên
    if (provinces.length > 0 && profile.provinceName) {
      const p = provinces.find(
        (x: any) =>
          String(x.code) === profile.provinceId ||
          x.name === profile.provinceName ||
          x.name.includes(profile.provinceName!) ||
          profile.provinceName!.includes(x.name)
      );
      if (p) setSelectedProvinceCode(String(p.code));
    } else if (profile.provinceId) {
      // provinces chưa load, set code trước để khi provinces load sẽ trigger
      setSelectedProvinceCode(profile.provinceId);
    }

    if (profile.districtId) setSelectedDistrictCode(profile.districtId);

    // Draft fallback...
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
    if (profile.wardName) {
      pendingWardName.current = profile.wardName;
    }
  }, [profile, provinces]); // 👈 THÊM provinces vào dependency

  // ĐỒNG BỘ: Tự tìm code Tỉnh/Quận thông qua Name nếu ID bị thiếu (trường hợp user khởi tạo hoặc thiếu ID từ Backend)
  useEffect(() => {
    if (provinces.length > 0 && provinceName) {
      // Ưu tiên tìm theo ID trước, nếu không có ID thì tìm theo tên tương đối
      const p = provinces.find(
        (x: any) =>
          String(x.code) === selectedProvinceCode ||
          x.name === provinceName ||
          x.name.includes(provinceName) ||
          provinceName.includes(x.name)
      );

      if (p) {
        // Kích hoạt lấy Quận/Huyện
        if (selectedProvinceCode !== String(p.code)) {
          setSelectedProvinceCode(String(p.code));
        }
        // Ép Form nhận đúng tên chuẩn của API để Select Shadcn chịu hiển thị label
        if (p.name !== provinceName) {
          form.setValue('provinceName', p.name, { shouldValidate: true });
        }
      }
    }
  }, [provinces, provinceName, selectedProvinceCode, form]);

  // 2. Đồng bộ & Chuẩn hóa tên Quận/Huyện
  useEffect(() => {
    if (districts.length === 0 || !districtName) return;

    const d = districts.find(
      (x: any) =>
        String(x.code) === selectedDistrictCode ||
        x.name === districtName ||
        x.name.includes(districtName) ||
        districtName.includes(x.name)
    );

    if (d) {
      if (selectedDistrictCode !== String(d.code)) {
        setSelectedDistrictCode(String(d.code)); // Trigger fetch wards
      }
      if (d.name !== districtName) {
        form.setValue('districtName', d.name, { shouldValidate: true });
      }
    }
  }, [districts, districtName]);

  // 3. Đồng bộ & Chuẩn hóa tên Phường/Xã (Code cũ của ông bị thiếu block này)
  useEffect(() => {
    if (wards.length === 0) return;

    // 👇 Nếu đang auto-fill và có wardName chờ restore
    if (isAutoFilling.current && pendingWardName.current) {
      const w = wards.find(
        (x: any) =>
          x.name === pendingWardName.current ||
          x.name.includes(pendingWardName.current) ||
          pendingWardName.current.includes(x.name)
      );
      if (w) {
        form.setValue('wardName', w.name, { shouldValidate: true });
      }
      pendingWardName.current = '';
      isAutoFilling.current = false; // 👈 Tắt cờ SAU KHI wards đã về và restore xong
      return;
    }

    // Logic chuẩn hóa tên bình thường khi user tự chọn
    if (wardName) {
      const w = wards.find(
        (x: any) => x.name === wardName || x.name.includes(wardName) || wardName.includes(x.name)
      );
      if (w && w.name !== wardName) {
        form.setValue('wardName', w.name, { shouldValidate: true });
      }
    }
  }, [wards]);
  useEffect(() => {
    console.log(
      'Districts loaded:',
      districts.length,
      '| districtName:',
      districtName,
      '| selectedDistrictCode:',
      selectedDistrictCode
    );
  }, [districts, districtName, selectedDistrictCode]);

  useEffect(() => {
    console.log('Wards loaded:', wards.length, '| wardName:', wardName);
  }, [wards, wardName]);
  const onSubmit = async (data: CheckoutFormValues) => {
    setIsSubmitting(true);

    try {
      const latestProfile = await fetchProfile(undefined, false)
        .unwrap()
        .catch(() => profile);

      const orderPayload: CreateInstockOrderRequestDto = {
        customerName: data.fullName,
        customerPhone: data.phone,
        customerEmail: latestProfile?.email || user?.email || '',
        customerProvinceName: data.provinceName,
        customerDistrictName: data.districtName,
        customerWardName: data.wardName,
        customerDetailAddress: data.address,
        cartItems: selectedItems.map((item) => ({
          itemId: item.itemId,
          priceDetailId: item.inStockProductPriceDetailId || '',
          quantity: item.quantity,
        })),
        shippingFee: shippingFee,
        usedCoinAmount: 0,
        grandTotalAmount: total,
        paymentMethod: data.paymentMethod,
      };

      // Gọi API tạo đơn
      const orderId = await createOrder(orderPayload).unwrap();

      // Thành công thì clear state & nháp
      dispatch(clearSelection());
      localStorage.removeItem(APP_CONFIG.DRAFT_KEY);
      sessionStorage.removeItem('checkout_active_ids'); // Dọn luôn session đã lưu

      // 3. AUTO-UPDATE PROFILE NẾU USER CHECK VÀ THỰC SỰ MUỐN ĐỔI
      // Kiểm tra xem dữ liệu trên form có thực sự KHÁC dữ liệu cũ trong gốc profile không
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
            lastName: lastName,
            phoneNumber: data.phone,
            streetAddress: data.address,
            provinceName: data.provinceName,
            districtName: data.districtName,
            wardName: data.wardName,
          }).unwrap();
        } catch (updateErr: any) {
          console.error('Error automatically updating profile:', updateErr);
          toast.error(
            'Failed to save information: ' +
              (updateErr?.data?.message ||
                updateErr?.message ||
                'Please update manually in your profile')
          );
        }
      }

      // 4. XỬ LÝ ĐIỀU HƯỚNG THANH TOÁN
      if (data.paymentMethod === 'Online') {
        setCreatedOrderId(orderId);
        setIsSubmitting(false); // Stop main submitting spinner to show Dialog
        setShowPaymentDialog(true);
      } else {
        setIsRedirecting(true);
        toast.success('Order placed successfully!');
        router.push(`${ROUTES.CHECKOUT_SUCCESS}?orderId=${orderId}`);
      }
    } catch (error) {
      console.error('Failed to checkout:', error);
      handleApiError(error);
      setIsSubmitting(false);
      setIsRedirecting(false);
    }
  };

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
          Return to Cart
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

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

      <div className="container-custom py-8 lg:py-12">
        <h1 className="mb-8 text-3xl font-bold md:text-4xl">Checkout</h1>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-8 lg:grid-cols-5"
          >
            {/* CỘT TRÁI: FORM ĐIỀN THÔNG TIN */}
            <div className="flex flex-col gap-8 lg:col-span-3">
              {/* Box 1: Địa chỉ */}
              <div className="border-border bg-card rounded-xl border p-6">
                <h2 className="text-card-foreground mb-5 flex items-center gap-2 text-lg font-bold">
                  <ShieldCheck className="text-brand h-5 w-5" />
                  Shipping Address
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" className="h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="0912 345 678"
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* ========================================== */}
                  {/* FIX 2: RESET QUẬN/PHƯỜNG KHI ĐỔI TỈNH/QUẬN */}
                  {/* ========================================== */}
                  <FormField
                    control={form.control}
                    name="provinceName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Province / City *</FormLabel>
                        <Select
                          onValueChange={(val) => {
                            field.onChange(val);
                            const p = provinces?.find((x: any) => x.name === val);
                            setSelectedProvinceCode(p ? String(p.code) : '');
                            setSelectedDistrictCode('');

                            // RESET QUẬN & PHƯỜNG
                            form.setValue('districtName', '');
                            form.setValue('wardName', '');
                          }}
                          value={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select Province/City" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {provinces?.map((p: any) => (
                              <SelectItem key={p.code} value={p.name}>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="districtName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>District *</FormLabel>
                        <Select
                          key={`district-${selectedProvinceCode}`}
                          onValueChange={(val) => {
                            field.onChange(val);
                            const d = districts?.find((x: any) => x.name === val);
                            setSelectedDistrictCode(d ? String(d.code) : '');
                            if (!isAutoFilling.current) {
                              // 👈 chỉ reset khi user tự bấm
                              form.setValue('wardName', '');
                            }
                          }}
                          value={field.value || undefined}
                          // 2. KHÓA MÕM: Chỉ khóa khi chưa chọn Tỉnh
                          disabled={!selectedProvinceCode}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue
                                placeholder={
                                  !selectedProvinceCode
                                    ? 'Please select Province first'
                                    : 'Select District'
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {districts && districts.length > 0 ? (
                              districts.map((d: any) => (
                                <SelectItem key={d.code} value={d.name}>
                                  {d.name}
                                </SelectItem>
                              ))
                            ) : (
                              // 3. THAY div BẰNG SelectItem bị disabled để Radix không bị ngu
                              <SelectItem value="empty" disabled>
                                No data available...
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="wardName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ward / Commune *</FormLabel>
                        <Select
                          key={`ward-${selectedDistrictCode}`}
                          onValueChange={(val) => {
                            field.onChange(val);
                            // Ép chuỗi cẩn thận lúc tìm kiếm
                          }}
                          // FIX TẬN GỐC: Đảm bảo value luôn là String, nếu rỗng ('') thì trả về undefined để hiện Placeholder
                          value={field.value || undefined}
                          // FIX DISABLED: Chỉ cần kiểm tra form có districtCode chưa, dùng watch trực tiếp cho an toàn
                          disabled={!selectedDistrictCode}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select Ward/Commune" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {wards && wards.length > 0 ? (
                              wards.map((w: any) => (
                                <SelectItem key={w.code} value={w.name}>
                                  {w.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="empty" disabled>
                                No Ward/Commune data...
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-1">
                        <FormLabel>Detailed Address *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="House number, street..."
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="saveProfile"
                  render={({ field }) => (
                    <FormItem className="bg-secondary/20 mt-6 flex flex-row items-start space-y-0 space-x-3 rounded-lg border p-4 shadow-sm">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer text-sm font-semibold">
                          Save delivery information as default
                        </FormLabel>
                        <p className="text-muted-foreground mt-1 text-xs">
                          The system will update this information in your Profile.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Box 2: Phương thức thanh toán */}
              <div className="border-border bg-card rounded-xl border p-6">
                <h2 className="text-card-foreground mb-5 flex items-center gap-2 text-lg font-bold">
                  <CreditCard className="text-brand h-5 w-5" />
                  Payment Method
                </h2>

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="gap-0"
                        >
                          {PAYMENT_METHODS.map((method, idx) => (
                            <div key={method.id}>
                              {idx > 0 && <Separator className="my-0" />}
                              <FormItem className="flex items-center space-y-0 space-x-0">
                                <FormControl>
                                  <label
                                    htmlFor={`payment-${method.id}`}
                                    className={`flex w-full cursor-pointer items-center gap-4 rounded-lg px-4 py-4 transition-colors ${
                                      field.value === method.id
                                        ? 'bg-brand/5'
                                        : 'hover:bg-secondary/50'
                                    }`}
                                  >
                                    <RadioGroupItem value={method.id} id={`payment-${method.id}`} />
                                    <div className="bg-secondary text-foreground/70 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                                      <method.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                      <p className="text-normal text-card-foreground text-sm font-semibold">
                                        {method.label}
                                      </p>
                                      <p className="text-muted-foreground text-xs font-normal">
                                        {method.description}
                                      </p>
                                    </div>
                                  </label>
                                </FormControl>
                              </FormItem>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* CỘT PHẢI: TỔNG QUAN ĐƠN HÀNG */}
            <div className="lg:col-span-2">
              <div className="border-border bg-card sticky top-20 rounded-xl border p-6 shadow-sm">
                <h2 className="text-card-foreground mb-5 text-lg font-bold">
                  Your Order ({selectedItems.length} items)
                </h2>

                <div className="flex max-h-60 flex-col gap-4 overflow-y-auto pr-1">
                  {selectedItems.map((item) => (
                    <div key={item.itemId} className="flex items-center gap-3">
                      <div className="bg-muted relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={item.productDetails?.thumbnailUrl || ''}
                          alt={item.productDetails?.name || ''}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                        <span className="bg-accent text-accent-foreground absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shadow-sm">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-card-foreground truncate text-sm font-semibold">
                          {item.productDetails?.name}
                        </p>
                      </div>
                      <span className="text-card-foreground shrink-0 text-sm font-bold">
                        {formatPrice((item.unitPrice ?? 0) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator className="my-5" />

                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-card-foreground font-semibold">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping Fee</span>
                    <span className="text-card-foreground font-semibold">
                      {isShippingFeeLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        formatPrice(shippingFee)
                      )}
                    </span>
                  </div>
                </div>

                <Separator className="my-5" />

                <div className="flex items-center justify-between">
                  <span className="text-card-foreground text-base font-bold">Total</span>
                  <span className="text-accent text-xl font-extrabold">{formatPrice(total)}</span>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={
                    isSubmitting ||
                    isShippingFeeLoading ||
                    !provinceName ||
                    !districtName ||
                    !wardName
                  }
                  className="mt-6 w-full gap-2 rounded-xl py-6 text-base font-bold shadow-lg transition-all"
                >
                  <Lock className="h-4 w-4" />
                  {isSubmitting ? 'Processing...' : 'Place Order'}
                </Button>

                <p className="text-muted-foreground mt-4 text-center text-[11px] leading-relaxed">
                  By placing an order, you agree to PuzKit3D's Terms of Service and Privacy Policy.
                </p>
              </div>
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

'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Banknote,
  CreditCard,
  Wallet,
  ShieldCheck,
  Lock,
  ShoppingBag,
  ArrowRight,
  FileText,
  Info,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

import { formatPrice } from '@/lib/utils';
import { useAppSelector, useAppDispatch } from '@/stores';
import { selectCurrentUser } from '@/stores/slices/authSlice';
// Bỏ import removeSelectedItems, selectCartItems từ cartSlice vì đã bị xóa
import {
  selectSelectedIds,
  selectCheckoutMode,
  clearSelection,
} from '@/stores/slices/checkoutSlice';
import { useGetCartQuery, useRemoveCartItemMutation } from '@/lib/api/endpoints/cartApi';
import { useCreateInstockOrderMutation } from '@/lib/api/endpoints/orderApi';
import type { CreateInstockOrderRequestDto } from '@/types/api/order.api.types';
import {
  useLazyGetPaymentByOrderIdQuery,
  useCreateTransactionMutation,
} from '@/lib/api/endpoints/paymentApi';
import { handleApiError } from '@/lib/utils/error-handle';
import { ROUTES } from '@/constants';
import OrderStepper from '@/components/custom/OrderStepper';

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

// Các interface cho API hành chính VN
interface Province {
  code: number;
  name: string;
}
interface District {
  code: number;
  name: string;
  province_code: number;
}
interface Ward {
  code: number;
  name: string;
  district_code: number;
}

const PAYMENT_METHODS = [
  {
    id: 'COD',
    label: 'Thanh toán khi nhận hàng (COD)',
    description: 'Trả tiền mặt khi nhận hàng',
    icon: Banknote,
  },
  {
    id: 'Online',
    label: 'Thanh toán trực tuyến (VNPay)',
    description: 'Thanh toán qua ví điện tử VNPay / Thẻ ATM',
    icon: Wallet,
  },
] as const;

const PARTNER_STEPS = ['Gửi yêu cầu', 'Staff báo giá', 'Thanh toán cọc', 'Giao hàng'];

const checkoutSchema = z.object({
  fullName: z.string().min(2, { message: 'Họ tên phải có ít nhất 2 ký tự' }),
  phone: z.string().regex(/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/, {
    message: 'Số điện thoại không hợp lệ (Vd: 0912345678)',
  }),
  provinceCode: z.string().min(1, { message: 'Vui lòng chọn Tỉnh / Thành phố' }),
  provinceName: z.string().min(1, { message: 'Thiếu Tên Tỉnh / Thành phố' }),
  districtCode: z.string().min(1, { message: 'Vui lòng chọn Quận / Huyện' }),
  districtName: z.string().min(1, { message: 'Thiếu Tên Quận / Huyện' }),
  wardCode: z.string().min(1, { message: 'Vui lòng chọn Phường / Xã' }),
  wardName: z.string().min(1, { message: 'Thiếu Tên Phường / Xã' }),
  address: z.string().min(5, { message: 'Địa chỉ chi tiết phải có ít nhất 5 ký tự' }),
  paymentMethod: z.enum(['COD', 'Online'], {
    required_error: 'Vui lòng chọn phương thức thanh toán',
  }),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);

  // RTK Query hooks
  const { data: cartData, isLoading: isCartLoading } = useGetCartQuery();
  const allCartItems = cartData?.items || [];

  const [removeItemMutate] = useRemoveCartItemMutation();
  const [createOrder] = useCreateInstockOrderMutation();
  const [getPayment] = useLazyGetPaymentByOrderIdQuery();
  const [createTransaction] = useCreateTransactionMutation();

  const selectedIds = useAppSelector(selectSelectedIds);
  const checkoutMode = useAppSelector(selectCheckoutMode);
  const isPartnerMode = checkoutMode === 'partner';

  // Lọc ra danh sách item đc chọn (Cache sync)
  const selectedItems = useMemo(() => {
    if (selectedIds.length === 0) return [];
    const idSet = new Set(selectedIds);
    return allCartItems.filter((item) => idSet.has(item.itemId));
  }, [allCartItems, selectedIds]);

  const subtotal = selectedItems.reduce(
    (sum, item) => sum + (item.unitPrice ?? 0) * item.quantity,
    0
  );
  const shipping = isPartnerMode ? 0 : 50_000;
  const total = subtotal + shipping;

  const [isSubmitting, setIsSubmitting] = useState(false);

  // States cho API hành chính VN
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      provinceCode: '',
      provinceName: '',
      districtCode: '',
      districtName: '',
      wardCode: '',
      wardName: '',
      address: '',
      paymentMethod: isPartnerMode ? undefined : 'COD',
    },
  });

  // 1. Fetch Provinces mồi
  useState(() => {
    fetch('https://provinces.open-api.vn/api/p/')
      .then((res) => res.json())
      .then((data) => setProvinces(data))
      .catch((err) => console.error('Failed to load provinces:', err));
  });

  // Lắng nghe sự thay đổi Code để fetch cấp độ sau
  const provinceCode = form.watch('provinceCode');
  const districtCode = form.watch('districtCode');

  useMemo(() => {
    if (provinceCode) {
      fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`)
        .then((res) => res.json())
        .then((data) => {
          setDistricts(data.districts || []);
          form.setValue('districtCode', '');
          form.setValue('districtName', '');
          form.setValue('wardCode', '');
          form.setValue('wardName', '');
        });
    } else {
      setDistricts([]);
    }
  }, [provinceCode]);

  useMemo(() => {
    if (districtCode) {
      fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`)
        .then((res) => res.json())
        .then((data) => {
          setWards(data.wards || []);
          form.setValue('wardCode', '');
          form.setValue('wardName', '');
        });
    } else {
      setWards([]);
    }
  }, [districtCode]);

  const onSubmit = async (data: CheckoutFormValues) => {
    setIsSubmitting(true);

    try {
      // 1. Chuẩn bị payload tạo Order theo chuẩn Swagger
      const orderPayload: CreateInstockOrderRequestDto = {
        customerName: data.fullName,
        customerPhone: data.phone,
        customerEmail: user?.email || '',
        customerProvinceCode: data.provinceCode,
        customerProvinceName: data.provinceName,
        customerDistrictCode: data.districtCode,
        customerDistrictName: data.districtName,
        customerWardCode: data.wardCode,
        customerWardName: data.wardName,
        cartItems: selectedItems.map((item) => ({
          itemId: item.itemId,
          priceDetailId: item.inStockProductPriceDetailId || '',
          quantity: item.quantity,
        })),
        shippingFee: shipping,
        usedCoinAmount: 0,
        grandTotalAmount: total,
        paymentMethod: data.paymentMethod || 'COD', // Fallback to prevent empty payload
      };

      // Gọi API tạo đơn
      const orderId = await createOrder(orderPayload).unwrap();

      // Clear rác tạm trên FE state
      dispatch(clearSelection());

      // 2. Xử lý logic Payment
      if (data.paymentMethod === 'Online') {
        // Gọi API lấy Payment ID
        const paymentRes = await getPayment(orderId).unwrap();

        // Gọi API tạo transaction VNPAY
        const paymentUrl = await createTransaction({
          paymentId: paymentRes.paymentId,
          provider: 'VnPay', // Hoặc VNPAY tùy backend
        }).unwrap();

        // Chuyển hướng trình duyệt trang Thanh Toán
        toast.info('Đang chuyển hướng sang VNPAY ...');
        window.location.href = paymentUrl;
        return; // Stop here, redirect takes over
      }

      // 3. Handle COD Success Route
      router.push(isPartnerMode ? ROUTES.CHECKOUT_SUCCESS_QUOTE : ROUTES.CHECKOUT_SUCCESS);
      toast.success(isPartnerMode ? 'Yêu cầu báo giá đã được gửi!' : 'Đặt hàng thành công!');
    } catch (error) {
      console.error('Failed to checkout:', error);
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCartLoading) {
    return (
      <div className="container-custom flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <Loader2 className="text-brand mb-4 h-10 w-10 animate-spin" />
        <p className="text-muted-foreground">Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  if (selectedItems.length === 0 && !isSubmitting) {
    return (
      <div className="container-custom flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <ShoppingBag className="text-muted-foreground/40 mb-4 h-16 w-16" />
        <h1 className="mb-2 text-2xl font-bold">Không có sản phẩm nào được chọn</h1>
        <p className="text-muted-foreground mb-6">
          Vui lòng quay lại giỏ hàng và chọn sản phẩm để thanh toán.
        </p>
        <Link
          href={ROUTES.CART}
          className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
        >
          Quay lại giỏ hàng
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <>
      {isSubmitting && (
        <div className="bg-background/80 fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
          <Loader2 className="text-brand h-10 w-10 animate-spin" />
          <p className="text-foreground text-lg font-semibold">
            {isPartnerMode ? 'Đang gửi yêu cầu...' : 'Đang xử lý đơn hàng...'}
          </p>
        </div>
      )}

      <div className="container-custom py-8 lg:py-12">
        <h1 className="mb-2 text-3xl font-bold md:text-4xl">
          {isPartnerMode ? 'Xác nhận yêu cầu báo giá' : 'Thanh toán'}
        </h1>

        {isPartnerMode && (
          <div className="border-warning/20 bg-warning/5 mt-4 mb-8 overflow-x-auto rounded-xl border px-4 py-3">
            <OrderStepper steps={PARTNER_STEPS} activeStep={0} />
          </div>
        )}

        {isPartnerMode && (
          <div className="border-info/30 bg-info/5 text-info mb-6 flex items-start gap-3 rounded-xl border px-5 py-3 text-sm">
            <Info className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="font-medium">
              Giá cuối cùng sẽ được Staff xác nhận dựa trên tỷ giá và phí vận chuyển thực tế. Sau
              khi gửi yêu cầu, Staff sẽ liên hệ bạn trong vòng 24h.
            </p>
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-8 lg:grid-cols-5"
          >
            <div className="flex flex-col gap-8 lg:col-span-3">
              <div className="border-border bg-card rounded-xl border p-6">
                <h2 className="text-card-foreground mb-5 flex items-center gap-2 text-lg font-bold">
                  <ShieldCheck className="text-brand h-5 w-5" />
                  {isPartnerMode ? 'Thông tin liên hệ' : 'Địa chỉ giao hàng'}
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Họ và tên *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nguyễn Văn A" className="h-11" {...field} />
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
                        <FormLabel>Số điện thoại *</FormLabel>
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

                  <FormField
                    control={form.control}
                    name="provinceCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tỉnh / Thành phố *</FormLabel>
                        <Select
                          onValueChange={(val) => {
                            field.onChange(val);
                            const p = provinces.find((x) => x.code.toString() === val);
                            if (p) form.setValue('provinceName', p.name);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Chọn Tỉnh / Thành phố" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {provinces.map((p) => (
                              <SelectItem key={p.code} value={p.code.toString()}>
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
                    name="districtCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quận / Huyện *</FormLabel>
                        <Select
                          onValueChange={(val) => {
                            field.onChange(val);
                            const d = districts.find((x) => x.code.toString() === val);
                            if (d) form.setValue('districtName', d.name);
                          }}
                          value={field.value}
                          disabled={!provinceCode || districts.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Chọn Quận / Huyện" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {districts.map((d) => (
                              <SelectItem key={d.code} value={d.code.toString()}>
                                {d.name}
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
                    name="wardCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phường / Xã *</FormLabel>
                        <Select
                          onValueChange={(val) => {
                            field.onChange(val);
                            const w = wards.find((x) => x.code.toString() === val);
                            if (w) form.setValue('wardName', w.name);
                          }}
                          value={field.value}
                          disabled={!districtCode || wards.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Chọn Phường / Xã" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {wards.map((w) => (
                              <SelectItem key={w.code} value={w.code.toString()}>
                                {w.name}
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
                    name="address"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-1">
                        <FormLabel>Địa chỉ chi tiết *</FormLabel>
                        <FormControl>
                          <Input placeholder="Số nhà, đường..." className="h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {!isPartnerMode && (
                <div className="border-border bg-card rounded-xl border p-6">
                  <h2 className="text-card-foreground mb-5 flex items-center gap-2 text-lg font-bold">
                    <CreditCard className="text-brand h-5 w-5" />
                    Phương thức thanh toán
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
                                      <RadioGroupItem
                                        value={method.id}
                                        id={`payment-${method.id}`}
                                      />
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
              )}
            </div>

            <div className="lg:col-span-2">
              <div className="border-border bg-card sticky top-20 rounded-xl border p-6">
                <h2 className="text-card-foreground mb-5 text-lg font-bold">
                  {isPartnerMode ? 'Sản phẩm yêu cầu' : 'Đơn hàng của bạn'} ({selectedItems.length}{' '}
                  sản phẩm)
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
                        <span className="bg-accent text-accent-foreground absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-card-foreground truncate text-sm font-semibold">
                          {item.productDetails?.name}
                        </p>
                        {isPartnerMode && (
                          <p className="text-muted-foreground text-[10px]">Giá tham khảo</p>
                        )}
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
                    <span className="text-muted-foreground">
                      {isPartnerMode ? 'Tổng giá dự kiến' : 'Tạm tính'}
                    </span>
                    <span className="text-card-foreground font-semibold">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  {!isPartnerMode && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phí vận chuyển</span>
                      <span className="text-card-foreground font-semibold">
                        {formatPrice(shipping)}
                      </span>
                    </div>
                  )}
                  {isPartnerMode && (
                    <div className="text-muted-foreground flex items-center gap-1 text-xs">
                      <Info className="h-3 w-3 shrink-0" />
                      <span>Phí vận chuyển sẽ được Staff báo sau</span>
                    </div>
                  )}
                </div>

                <Separator className="my-5" />

                <div className="flex items-center justify-between">
                  <span className="text-card-foreground text-base font-bold">
                    {isPartnerMode ? 'Tổng dự kiến' : 'Tổng cộng'}
                  </span>
                  <span
                    className={`text-xl font-extrabold ${isPartnerMode ? 'text-warning' : 'text-accent'}`}
                  >
                    {formatPrice(total)}
                  </span>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className={`mt-6 w-full gap-2 rounded-xl py-6 text-base font-bold shadow-lg ${
                    isPartnerMode ? 'bg-warning text-warning-foreground hover:bg-warning/90' : ''
                  }`}
                >
                  {isPartnerMode ? (
                    <>
                      <FileText className="h-4 w-4" />
                      {isSubmitting ? 'Đang gửi...' : 'Xác nhận yêu cầu'}
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
                    </>
                  )}
                </Button>

                <p className="text-muted-foreground mt-3 text-center text-[11px]">
                  {isPartnerMode
                    ? 'Staff sẽ liên hệ xác nhận giá và thời gian giao hàng trong vòng 24h.'
                    : 'Bằng việc đặt hàng, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của PuzKit3D.'}
                </p>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}

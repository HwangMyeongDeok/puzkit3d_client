'use client';
import { useState } from 'react';
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
import { selectCartItems, removeSelectedItems } from '@/stores/slices/cartSlice';
import {
  selectSelectedIds,
  selectCheckoutMode,
  clearSelection,
} from '@/stores/slices/checkoutSlice';
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

const PAYMENT_METHODS = [
  {
    id: 'cod',
    label: 'Thanh toán khi nhận hàng (COD)',
    description: 'Trả tiền mặt khi nhận hàng',
    icon: Banknote,
  },
  {
    id: 'card',
    label: 'Thẻ tín dụng / Ghi nợ',
    description: 'Visa, Mastercard, JCB',
    icon: CreditCard,
  },
  {
    id: 'ewallet',
    label: 'MoMo / VNPay E-Wallet',
    description: 'Thanh toán qua ví điện tử',
    icon: Wallet,
  },
] as const;

const PARTNER_STEPS = ['Gửi yêu cầu', 'Staff báo giá', 'Thanh toán cọc', 'Giao hàng'];

const checkoutSchema = z.object({
  fullName: z.string().min(2, { message: 'Họ tên phải có ít nhất 2 ký tự' }),
  phone: z.string().regex(/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/, {
    message: 'Số điện thoại không hợp lệ (Vd: 0912345678)',
  }),
  city: z.string().min(2, { message: 'Vui lòng nhập Tỉnh / Thành phố' }),
  district: z.string().min(2, { message: 'Vui lòng nhập Quận / Huyện' }),
  address: z.string().min(5, { message: 'Địa chỉ chi tiết phải có ít nhất 5 ký tự' }),
  paymentMethod: z.enum(['cod', 'card', 'ewallet']).optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const allCartItems = useAppSelector(selectCartItems);
  const selectedIds = useAppSelector(selectSelectedIds);
  const checkoutMode = useAppSelector(selectCheckoutMode);
  const isPartnerMode = checkoutMode === 'partner';

  const selectedItems = (() => {
    if (selectedIds.length === 0) return allCartItems;
    const idSet = new Set(selectedIds);
    return allCartItems.filter((item) => idSet.has(item.itemId));
  })();

  const subtotal = selectedItems.reduce(
    (sum, item) => sum + (item.unitPrice ?? 0) * item.quantity,
    0
  );
  const shipping = isPartnerMode ? 0 : 30_000;
  const total = subtotal + shipping;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      city: '',
      district: '',
      address: '',
      paymentMethod: isPartnerMode ? undefined : 'cod',
    },
  });

  const onSubmit = (data: CheckoutFormValues) => {
    setIsSubmitting(true);
    const idsToRemove = selectedItems.map((item) => item.itemId);

    const targetRoute = isPartnerMode ? ROUTES.CHECKOUT_SUCCESS_QUOTE : ROUTES.CHECKOUT_SUCCESS;
    const toastMsg = isPartnerMode ? 'Yêu cầu báo giá đã được gửi!' : 'Đặt hàng thành công!';

    console.log(isPartnerMode ? 'Quote request submitted:' : 'Order submitted:', {
      ...data,
      items: selectedItems,
      total: isPartnerMode ? subtotal : total,
    });

    setTimeout(() => {
      dispatch(removeSelectedItems(idsToRemove));
      dispatch(clearSelection());
      router.push(targetRoute);
      toast.success(toastMsg);
    }, 800);
  };

  if (selectedItems.length === 0) {
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
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tỉnh / Thành phố *</FormLabel>
                        <FormControl>
                          <Input placeholder="TP. Hồ Chí Minh" className="h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quận / Huyện *</FormLabel>
                        <FormControl>
                          <Input placeholder="Quận 1" className="h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Địa chỉ chi tiết *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Số nhà, tên đường, phường/xã..."
                            className="h-11"
                            {...field}
                          />
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
                            defaultValue={field.value}
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
                          src={item.thumbnailUrl}
                          alt={item.productName}
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
                          {item.productName}
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

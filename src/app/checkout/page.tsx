'use client';

import Link from 'next/link';
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
} from 'lucide-react';
import { toast } from 'sonner';

import { formatPrice } from '@/lib/utils';
import { useAppSelector, useAppDispatch } from '@/stores';
import { selectCartItems, selectCartTotalPrice, clearCart } from '@/stores/slices/cartSlice';
import { ROUTES } from '@/constants';

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

const checkoutSchema = z.object({
  fullName: z.string().min(2, { message: 'Họ tên phải có ít nhất 2 ký tự' }),
  phone: z.string().regex(/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/, {
    message: 'Số điện thoại không hợp lệ (Vd: 0912345678)',
  }),
  city: z.string().min(2, { message: 'Vui lòng nhập Tỉnh / Thành phố' }),
  district: z.string().min(2, { message: 'Vui lòng nhập Quận / Huyện' }),
  address: z.string().min(5, { message: 'Địa chỉ chi tiết phải có ít nhất 5 ký tự' }),
  paymentMethod: z.enum(['cod', 'card', 'ewallet'], {
    message: 'Vui lòng chọn phương thức thanh toán',
  }),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const cartItems = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartTotalPrice);
  const shipping = 30_000;
  const total = subtotal + shipping;

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      city: '',
      district: '',
      address: '',
      paymentMethod: 'cod',
    },
  });

  const onSubmit = (data: CheckoutFormValues) => {
    console.log('Order submitted:', { ...data, cartItems, total });

    setTimeout(() => {
      dispatch(clearCart());
      toast.success('Đặt hàng thành công!');
      router.push(ROUTES.CHECKOUT_SUCCESS);
    }, 1000);
  };

  if (cartItems.length === 0) {
    return (
      <div className="container-custom flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <ShoppingBag className="text-muted-foreground/40 mb-4 h-16 w-16" />
        <h1 className="mb-2 text-2xl font-bold">Giỏ hàng trống</h1>
        <p className="text-muted-foreground mb-6">
          Bạn cần thêm sản phẩm vào giỏ trước khi thanh toán.
        </p>
        <Link
          href={ROUTES.PRODUCTS}
          className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
        >
          Khám phá sản phẩm
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-8 lg:py-12">
      <h1 className="mb-8 text-3xl font-bold md:text-4xl">Thanh toán</h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-8 lg:grid-cols-5"
        >
          <div className="flex flex-col gap-8 lg:col-span-3">
            <div className="border-border bg-card rounded-xl border p-6">
              <h2 className="text-card-foreground mb-5 flex items-center gap-2 text-lg font-bold">
                <ShieldCheck className="text-brand h-5 w-5" />
                Địa chỉ giao hàng
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
                        <Input type="tel" placeholder="0912 345 678" className="h-11" {...field} />
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

          <div className="lg:col-span-2">
            <div className="border-border bg-card sticky top-20 rounded-xl border p-6">
              <h2 className="text-card-foreground mb-5 text-lg font-bold">
                Đơn hàng của bạn ({cartItems.length} sản phẩm)
              </h2>

              <div className="flex max-h-60 flex-col gap-4 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <div className="bg-muted relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                      <span className="bg-accent text-accent-foreground absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-card-foreground truncate text-sm font-semibold">
                        {item.name}
                      </p>
                    </div>
                    <span className="text-card-foreground shrink-0 text-sm font-bold">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator className="my-5" />

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span className="text-card-foreground font-semibold">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phí vận chuyển</span>
                  <span className="text-card-foreground font-semibold">
                    {formatPrice(shipping)}
                  </span>
                </div>
              </div>

              <Separator className="my-5" />

              <div className="flex items-center justify-between">
                <span className="text-card-foreground text-base font-bold">Tổng cộng</span>
                <span className="text-accent text-xl font-extrabold">{formatPrice(total)}</span>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={form.formState.isSubmitting}
                className="mt-6 w-full gap-2 rounded-xl py-6 text-base font-bold shadow-lg"
              >
                <Lock className="h-4 w-4" />
                {form.formState.isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
              </Button>

              <p className="text-muted-foreground mt-3 text-center text-[11px]">
                Bằng việc đặt hàng, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của
                PuzKit3D.
              </p>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

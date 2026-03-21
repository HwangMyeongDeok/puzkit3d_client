import * as z from 'zod';

export const checkoutSchema = z.object({
  fullName: z.string().min(2, { message: 'Họ tên phải có ít nhất 2 ký tự' }),
  phone: z
    .string()
    .transform((v) => v.replace(/[\s-]/g, ''))
    .pipe(
      z.string().regex(/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/, {
        message: 'Số điện thoại không hợp lệ (Vd: 0912345678)',
      })
    ),
  provinceName: z.string().min(1, { message: 'Thiếu Tên Tỉnh / Thành phố' }),
  districtName: z.string().min(1, { message: 'Thiếu Tên Quận / Huyện' }),
  wardName: z.string().min(1, { message: 'Thiếu Tên Phường / Xã' }),
  address: z.string().min(5, { message: 'Địa chỉ chi tiết phải có ít nhất 5 ký tự' }),
  paymentMethod: z.enum(['COD', 'Online'], {
    message: 'Vui lòng chọn phương thức thanh toán',
  }),
  saveProfile: z.boolean(),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export interface Province {
  code: number;
  name: string;
}
export interface District {
  code: number;
  name: string;
}
export interface Ward {
  code: number;
  name: string;
}

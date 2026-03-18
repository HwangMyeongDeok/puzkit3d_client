import * as z from 'zod';

export const addressUpdateSchema = z.object({
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
});

export type AddressUpdateFormValues = z.infer<typeof addressUpdateSchema>;

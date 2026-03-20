import * as z from 'zod';

/* ------------------------------------------------------------------ */
/*  Forgot Password — public                                          */
/* ------------------------------------------------------------------ */
export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Email không hợp lệ' }),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

/* ------------------------------------------------------------------ */
/*  Reset Password — public (token comes from URL searchParams)        */
/* ------------------------------------------------------------------ */
export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
      .regex(/[A-Z]/, { message: 'Cần ít nhất 1 chữ hoa' })
      .regex(/[a-z]/, { message: 'Cần ít nhất 1 chữ thường' })
      .regex(/[0-9]/, { message: 'Cần ít nhất 1 chữ số' })
      .regex(/[^A-Za-z0-9]/, { message: 'Cần ít nhất 1 ký tự đặc biệt' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

/* ------------------------------------------------------------------ */
/*  Change Password — authenticated                                    */
/* ------------------------------------------------------------------ */
export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, { message: 'Vui lòng nhập mật khẩu hiện tại' }),
    newPassword: z
      .string()
      .min(8, { message: 'Mật khẩu mới phải có ít nhất 8 ký tự' })
      .regex(/[A-Z]/, { message: 'Cần ít nhất 1 chữ hoa' })
      .regex(/[a-z]/, { message: 'Cần ít nhất 1 chữ thường' })
      .regex(/[0-9]/, { message: 'Cần ít nhất 1 chữ số' })
      .regex(/[^A-Za-z0-9]/, { message: 'Cần ít nhất 1 ký tự đặc biệt' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: 'Mật khẩu mới phải khác mật khẩu hiện tại',
    path: ['newPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

import * as z from 'zod';

/* ------------------------------------------------------------------ */
/* Forgot Password — public                                          */
/* ------------------------------------------------------------------ */
export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

/* ------------------------------------------------------------------ */
/* Reset Password — public (token comes from URL searchParams)        */
/* ------------------------------------------------------------------ */
export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long' })
      .regex(/[A-Z]/, { message: 'Must contain at least 1 uppercase letter' })
      .regex(/[a-z]/, { message: 'Must contain at least 1 lowercase letter' })
      .regex(/[0-9]/, { message: 'Must contain at least 1 number' })
      .regex(/[^A-Za-z0-9]/, { message: 'Must contain at least 1 special character' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

/* ------------------------------------------------------------------ */
/* Change Password — authenticated                                    */
/* ------------------------------------------------------------------ */
export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, { message: 'Please enter your current password' }),
    newPassword: z
      .string()
      .min(8, { message: 'New password must be at least 8 characters long' })
      .regex(/[A-Z]/, { message: 'Must contain at least 1 uppercase letter' })
      .regex(/[a-z]/, { message: 'Must contain at least 1 lowercase letter' })
      .regex(/[0-9]/, { message: 'Must contain at least 1 number' })
      .regex(/[^A-Za-z0-9]/, { message: 'Must contain at least 1 special character' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: 'New password must be different from the current password',
    path: ['newPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

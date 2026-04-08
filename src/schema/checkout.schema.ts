import * as z from 'zod';

export const checkoutSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters long' }),
  phone: z
    .string()
    .transform((v) => v.replace(/[\s-]/g, ''))
    .pipe(
      z.string().regex(/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/, {
        message: 'Invalid phone number (e.g., 0912345678)',
      })
    ),
  provinceName: z.string().min(1, { message: 'Province/City name is required' }),
  districtName: z.string().min(1, { message: 'District name is required' }),
  wardName: z.string().min(1, { message: 'Ward/Commune name is required' }),
  address: z.string().min(5, { message: 'Detailed address must be at least 5 characters long' }),
  paymentMethod: z.enum(['COD', 'Online', 'COIN'], {
    message: 'Please select a payment method',
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

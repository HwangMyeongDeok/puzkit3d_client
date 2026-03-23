import * as z from 'zod';

export const addressUpdateSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters long' }),
  phone: z.string().regex(/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/, {
    message: 'Invalid phone number (e.g., 0912345678)',
  }),
  provinceCode: z.string().min(1, { message: 'Please select a Province/City' }),
  provinceName: z.string().min(1, { message: 'Province/City name is required' }),
  districtCode: z.string().min(1, { message: 'Please select a District' }),
  districtName: z.string().min(1, { message: 'District name is required' }),
  wardCode: z.string().min(1, { message: 'Please select a Ward/Commune' }),
  wardName: z.string().min(1, { message: 'Ward/Commune name is required' }),
  address: z.string().min(5, { message: 'Detailed address must be at least 5 characters long' }),
});

export type AddressUpdateFormValues = z.infer<typeof addressUpdateSchema>;

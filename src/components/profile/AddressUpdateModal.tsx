'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useUpdateProfileMutation } from '@/lib/api/endpoints/authApi';
import { addressUpdateSchema, type AddressUpdateFormValues } from '@/schema/profile.schema';
import type { Province, District, Ward } from '@/schema/checkout.schema';
import type { User } from '@/types/auth.types';

interface AddressUpdateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export default function AddressUpdateModal({ open, onOpenChange, user }: AddressUpdateModalProps) {
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  // Data states
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // Control states
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<string>('');

  const defaultFullName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '';

  const form = useForm<AddressUpdateFormValues>({
    resolver: zodResolver(addressUpdateSchema),
    defaultValues: {
      fullName: defaultFullName,
      phone: user?.phoneNumber || '',
      provinceCode: user?.provinceId || '',
      provinceName: user?.provinceName || '',
      districtCode: user?.districtId || '',
      districtName: user?.districtName || '',
      wardCode: user?.wardCode || '',
      wardName: user?.wardName || '',
      address: user?.streetAddress || '',
    },
  });

  // 0. RESET FORM KHI MỞ MODAL
  useEffect(() => {
    if (user && open) {
      form.reset({
        fullName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '',
        phone: user.phoneNumber || '',
        provinceCode: user.provinceId || '',
        provinceName: user.provinceName || '',
        districtCode: user.districtId || '',
        districtName: user.districtName || '',
        wardCode: user.wardCode || '',
        wardName: user.wardName || '',
        address: user.streetAddress || '',
      });
    }
  }, [user, open, form]);

  // 1. CHUỖI DOMINO LẦN 1: FETCH PROVINCES -> LẤY MÃ PROVINCE
  useEffect(() => {
    if (open) {
      fetch('https://provinces.open-api.vn/api/v1/p/')
        .then((res) => res.json())
        .then((data) => {
          setProvinces(data);
          const currentPName = form.getValues('provinceName') || user?.provinceName;
          if (currentPName) {
            const p = data.find((x: Province) => x.name === currentPName);
            if (p) {
              setSelectedProvinceCode(String(p.code));
              form.setValue('provinceCode', String(p.code), { shouldValidate: true });
            }
          }
        })
        .catch((err) => console.error('Error fetching provinces:', err));
    } else {
      setSelectedProvinceCode('');
      setSelectedDistrictCode('');
      setProvinces([]);
      setDistricts([]);
      setWards([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user]);

  // 2. CHUỖI DOMINO LẦN 2: FETCH DISTRICTS -> LẤY MÃ DISTRICT
  useEffect(() => {
    if (selectedProvinceCode && open) {
      fetch(`https://provinces.open-api.vn/api/v1/p/${selectedProvinceCode}?depth=2`)
        .then((res) => res.json())
        .then((data) => {
          const loadedDistricts = data.districts || [];
          setDistricts(loadedDistricts);

          const currentDName = form.getValues('districtName');
          if (currentDName) {
            const d = loadedDistricts.find((x: District) => x.name === currentDName);
            if (d) {
              setSelectedDistrictCode(String(d.code));
              form.setValue('districtCode', String(d.code), { shouldValidate: true });
            }
          }
        })
        .catch((err) => console.error('Error fetching districts:', err));
    } else {
      setDistricts([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProvinceCode, open]);

  // 3. CHUỖI DOMINO LẦN 3: FETCH WARDS
  useEffect(() => {
    if (selectedDistrictCode && open) {
      fetch(`https://provinces.open-api.vn/api/v1/d/${selectedDistrictCode}?depth=2`)
        .then((res) => res.json())
        .then((data) => setWards(data.wards || []))
        .catch((err) => console.error('Error fetching wards:', err));
    } else {
      setWards([]);
    }
  }, [selectedDistrictCode, open]);

  // 4. CHUỖI DOMINO LẦN 4: AUTO-POPULATE WARD CODE AFTER WARDS ARE LOADED
  useEffect(() => {
    if (wards && wards.length > 0) {
      const currentWName = form.getValues('wardName');
      if (currentWName) {
        const w = wards.find((x: Ward) => x.name === currentWName);
        if (w) {
          form.setValue('wardCode', String(w.code), { shouldValidate: true });
        }
      }
    }
  }, [wards, form]);

  const onSubmit = async (data: AddressUpdateFormValues) => {
    // Check if anything has actually changed
    const hasChanges =
      data.fullName !== defaultFullName ||
      data.phone !== (user?.phoneNumber || '') ||
      data.provinceName !== (user?.provinceName || '') ||
      data.districtName !== (user?.districtName || '') ||
      data.wardName !== (user?.wardName || '') ||
      data.address !== (user?.streetAddress || '');

    if (!hasChanges) {
      toast.info('No changes made to your address');
      return;
    }

    const nameParts = data.fullName.trim().split(' ');
    const lastName = nameParts.length > 1 ? nameParts.pop() || '' : ' ';
    const firstName = nameParts.join(' ');

    try {
      await updateProfile({
        firstName: firstName || data.fullName,
        lastName: lastName,
        phoneNumber: data.phone,
        streetAddress: data.address,
        provinceId: data.provinceCode,
        provinceName: data.provinceName,
        districtId: data.districtCode,
        districtName: data.districtName,
        wardCode: data.wardCode,
        wardName: data.wardName,
      }).unwrap();

      toast.success('Address updated successfully!');
      onOpenChange(false);
    } catch (err: any) {
      console.error('Error updating address:', err);
      const errorMessage =
        err?.data?.message || err?.message || 'Failed to update address. Please try again.';
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MapPin className="text-brand h-6 w-6" />
            Update Shipping Address
          </DialogTitle>
          <DialogDescription>
            Provide accurate address information for faster delivery from PuzKit3D.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (errs) => console.log('Form errors:', errs))}
            className="space-y-4 py-4"
          >
            {/* TRICK: ÉP FORM PHẢI THEO DÕI 3 THẰNG CODE NÀY ĐỂ ZOD KHÔNG BÁO LỖI ẢO NỮA */}
            <input type="hidden" {...form.register('provinceCode')} />
            <input type="hidden" {...form.register('districtCode')} />
            <input type="hidden" {...form.register('wardCode')} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient *</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
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
                      <Input type="tel" placeholder="0912 345 678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* TỈNH / THÀNH */}
              <FormField
                control={form.control}
                name="provinceName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Province / City *</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        const p = provinces?.find((x: Province) => x.name === val);

                        if (p) {
                          setSelectedProvinceCode(String(p.code));
                          form.setValue('provinceCode', String(p.code), { shouldValidate: true });
                        } else {
                          setSelectedProvinceCode('');
                          form.setValue('provinceCode', '', { shouldValidate: true });
                        }

                        // Reset District & Ward
                        setSelectedDistrictCode('');
                        form.setValue('districtName', '');
                        form.setValue('districtCode', '', { shouldValidate: true });
                        form.setValue('wardName', '');
                        form.setValue('wardCode', '', { shouldValidate: true });
                      }}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Province / City" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 w-[var(--radix-select-trigger-width)] overflow-y-auto">
                        {provinces?.map((p: Province) => (
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

              {/* QUẬN / HUYỆN */}
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
                        const d = districts?.find((x: District) => x.name === val);

                        if (d) {
                          setSelectedDistrictCode(String(d.code));
                          form.setValue('districtCode', String(d.code), { shouldValidate: true });
                        } else {
                          setSelectedDistrictCode('');
                          form.setValue('districtCode', '', { shouldValidate: true });
                        }

                        // Reset Ward
                        form.setValue('wardName', '');
                        form.setValue('wardCode', '', { shouldValidate: true });
                      }}
                      value={field.value || undefined}
                      disabled={!selectedProvinceCode}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !selectedProvinceCode ? 'Select Province first' : 'Select District'
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 w-[var(--radix-select-trigger-width)] overflow-y-auto">
                        {districts && districts.length > 0 ? (
                          districts.map((d: District) => (
                            <SelectItem key={d.code} value={d.name}>
                              {d.name}
                            </SelectItem>
                          ))
                        ) : (
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

              {/* PHƯỜNG / XÃ */}
              <FormField
                control={form.control}
                name="wardName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ward *</FormLabel>
                    <Select
                      key={`ward-${selectedDistrictCode}`}
                      onValueChange={(val) => {
                        field.onChange(val);
                        const w = wards?.find((x: Ward) => x.name === val);

                        if (w) {
                          form.setValue('wardCode', String(w.code), { shouldValidate: true });
                        } else {
                          form.setValue('wardCode', '', { shouldValidate: true });
                        }
                      }}
                      value={field.value || undefined}
                      disabled={!selectedDistrictCode}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !selectedDistrictCode ? 'Select District first' : 'Select Ward'
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 w-[var(--radix-select-trigger-width)] overflow-y-auto">
                        {wards && wards.length > 0 ? (
                          wards.map((w: Ward) => (
                            <SelectItem key={w.code} value={w.name}>
                              {w.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="empty" disabled>
                            Loading Wards...
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
                      <Input placeholder="House number, street name..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="border-border mt-4 flex justify-end gap-3 border-t pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating} className="min-w-[120px]">
                {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Address
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

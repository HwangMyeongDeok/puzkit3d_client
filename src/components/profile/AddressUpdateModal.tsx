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

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

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

  const provinceCode = form.watch('provinceCode');
  const districtCode = form.watch('districtCode');

  // Reset values when user prop changes
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

  // Load Provinces
  useEffect(() => {
    if (open) {
      fetch('https://provinces.open-api.vn/api/v1/p/')
        .then((res) => res.json())
        .then((data) => setProvinces(data))
        .catch((err) => console.error('Error fetching provinces:', err));
    }
  }, [open]);

  // Load Districts
  useEffect(() => {
    if (provinceCode && open) {
      setDistricts([]);
      fetch(`https://provinces.open-api.vn/api/v1/p/${provinceCode}?depth=2`)
        .then((res) => res.json())
        .then((data) => setDistricts(data.districts || []))
        .catch((err) => console.error('Error fetching districts:', err));
    } else {
      setDistricts([]);
    }
  }, [provinceCode, open]);

  // Load Wards
  useEffect(() => {
    if (districtCode && open) {
      setWards([]);
      fetch(`https://provinces.open-api.vn/api/v1/d/${districtCode}?depth=2`)
        .then((res) => res.json())
        .then((data) => setWards(data.wards || []))
        .catch((err) => console.error('Error fetching wards:', err));
    } else {
      setWards([]);
    }
  }, [districtCode, open]);

  const onSubmit = async (data: AddressUpdateFormValues) => {
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
      toast.error(err?.data?.message || err?.message || 'An error occurred while updating.');
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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

              <FormField
                control={form.control}
                name="provinceCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Province / City *</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        const p = provinces?.find((x: any) => x.code.toString() === val);
                        if (p) form.setValue('provinceName', p.name);

                        form.setValue('districtCode', '');
                        form.setValue('districtName', '');
                        form.setValue('wardCode', '');
                        form.setValue('wardName', '');
                      }}
                      value={field.value ? String(field.value) : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Province / City" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 w-[var(--radix-select-trigger-width)] overflow-y-auto">
                        {provinces?.map((p: any) => (
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
                    <FormLabel>District *</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        const d = districts?.find((x: any) => x.code.toString() === val);
                        if (d) form.setValue('districtName', d.name);

                        form.setValue('wardCode', '');
                        form.setValue('wardName', '');
                      }}
                      value={field.value ? String(field.value) : undefined}
                      disabled={!provinceCode}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !provinceCode ? 'Select Province first' : 'Select District'
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 w-[var(--radix-select-trigger-width)] overflow-y-auto">
                        {districts && districts.length > 0 ? (
                          districts.map((d: any) => (
                            <SelectItem key={d.code} value={String(d.code)}>
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

              <FormField
                control={form.control}
                name="wardCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ward *</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        const w = wards?.find((x: any) => String(x.code) === val);
                        if (w) form.setValue('wardName', w.name);
                      }}
                      value={field.value ? String(field.value) : undefined}
                      disabled={!form.watch('districtCode')}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Ward" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 w-[var(--radix-select-trigger-width)] overflow-y-auto">
                        {wards && wards.length > 0 ? (
                          wards.map((w: any) => (
                            <SelectItem key={w.code} value={String(w.code)}>
                              {w.name}
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

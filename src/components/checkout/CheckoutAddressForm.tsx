import { UseFormReturn } from 'react-hook-form';
import { ShieldCheck } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { CheckoutFormValues, Province, District, Ward } from '@/schema/checkout.schema';

interface CheckoutAddressFormProps {
  form: UseFormReturn<CheckoutFormValues>;
  provinces: Province[];
  districts: District[];
  wards: Ward[];
  selectedProvinceCode: string;
  setSelectedProvinceCode: (code: string) => void;
  selectedDistrictCode: string;
  setSelectedDistrictCode: (code: string) => void;
  isAutoFilling: React.MutableRefObject<boolean>;
}

export default function CheckoutAddressForm({
  form,
  provinces,
  districts,
  wards,
  selectedProvinceCode,
  setSelectedProvinceCode,
  selectedDistrictCode,
  setSelectedDistrictCode,
  isAutoFilling,
}: CheckoutAddressFormProps) {
  return (
    <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
      <h2 className="text-card-foreground mb-5 flex items-center gap-2 text-lg font-bold">
        <ShieldCheck className="text-brand h-5 w-5" />
        Shipping Address
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name *</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" className="h-11" {...field} />
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
                <Input type="tel" placeholder="0912 345 678" className="h-11" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="provinceName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Province / City *</FormLabel>
              <Select
                onValueChange={(val) => {
                  field.onChange(val);
                  // TYPE CHECK ĐÃ ĐƯỢC CHUẨN HÓA (Province)
                  const p = provinces?.find((x: Province) => x.name === val);
                  setSelectedProvinceCode(p ? String(p.code) : '');
                  setSelectedDistrictCode('');
                  form.setValue('districtName', '');
                  form.setValue('wardName', '');
                }}
                value={field.value || undefined}
              >
                <FormControl>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select Province/City" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-60 overflow-y-auto">
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
                  // TYPE CHECK ĐÃ ĐƯỢC CHUẨN HÓA (District)
                  const d = districts?.find((x: District) => x.name === val);
                  setSelectedDistrictCode(d ? String(d.code) : '');
                  if (!isAutoFilling.current) {
                    form.setValue('wardName', '');
                  }
                }}
                value={field.value || undefined}
                disabled={!selectedProvinceCode}
              >
                <FormControl>
                  <SelectTrigger className="h-11">
                    <SelectValue
                      placeholder={
                        !selectedProvinceCode ? 'Please select Province first' : 'Select District'
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-60 overflow-y-auto">
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

        <FormField
          control={form.control}
          name="wardName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ward / Commune *</FormLabel>
              <Select
                key={`ward-${selectedDistrictCode}`}
                onValueChange={field.onChange}
                value={field.value || undefined}
                disabled={!selectedDistrictCode}
              >
                <FormControl>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select Ward/Commune" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {wards && wards.length > 0 ? (
                    wards.map((w: Ward) => (
                      <SelectItem key={w.code} value={w.name}>
                        {w.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="empty" disabled>
                      No Ward/Commune data...
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
                <Input placeholder="House number, street..." className="h-11" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="saveProfile"
        render={({ field }) => (
          <FormItem className="bg-secondary/20 mt-6 flex flex-row items-start space-y-0 space-x-3 rounded-lg border p-4 shadow-sm">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel className="cursor-pointer text-sm font-semibold">
                Save delivery information as default
              </FormLabel>
              <p className="text-muted-foreground mt-1 text-xs">
                The system will update this information in your Profile.
              </p>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}

import { UseFormReturn } from 'react-hook-form';
import { Banknote, Wallet } from 'lucide-react';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import type { CheckoutFormValues } from '@/schema/checkout.schema';

interface CheckoutPaymentSectionProps {
  form: UseFormReturn<CheckoutFormValues>;
}

export default function CheckoutPaymentSection({ form }: CheckoutPaymentSectionProps) {
  return (
    <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
      <h2 className="text-card-foreground mb-5 flex items-center gap-2 text-lg font-bold">
        <Wallet className="text-brand h-5 w-5" />
        Payment Method
      </h2>

      <FormField
        control={form.control}
        name="paymentMethod"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value} className="gap-0">
                {/* 1. COD */}
                <div key="COD">
                  <FormItem className="flex items-center space-y-0 space-x-0">
                    <FormControl>
                      <label
                        htmlFor="payment-COD"
                        className={`flex w-full cursor-pointer items-center gap-4 rounded-lg px-4 py-4 transition-colors ${
                          field.value === 'COD'
                            ? 'bg-brand/5 border-brand/20 border'
                            : 'hover:bg-secondary/50 border border-transparent'
                        }`}
                      >
                        <RadioGroupItem value="COD" id="payment-COD" />
                        <div className="bg-secondary text-foreground/70 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                          <Banknote className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-normal text-card-foreground text-sm font-semibold">
                            Cash on Delivery (COD)
                          </p>
                          <p className="text-muted-foreground text-xs font-normal">
                            Pay with cash upon delivery
                          </p>
                        </div>
                      </label>
                    </FormControl>
                  </FormItem>
                </div>

                <Separator className="my-2" />

                {/* 2. ONLINE PAYMENT (VNPay / MoMo) */}
                <div key="Online">
                  <FormItem className="flex items-center space-y-0 space-x-0">
                    <FormControl>
                      <label
                        htmlFor="payment-Online"
                        className={`flex w-full cursor-pointer items-center gap-4 rounded-lg px-4 py-4 transition-colors ${
                          field.value === 'Online'
                            ? 'bg-brand/5 border-brand/20 border'
                            : 'hover:bg-secondary/50 border border-transparent'
                        }`}
                      >
                        <RadioGroupItem value="Online" id="payment-Online" />
                        <div className="bg-secondary text-foreground/70 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                          <Wallet className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-normal text-card-foreground text-sm font-semibold">
                            Online Payment
                          </p>
                          <p className="text-muted-foreground mb-2 text-xs font-normal">
                            Pay securely via VNPay or MoMo e-wallet
                          </p>

                          {/* Nơi hiển thị Logo Ngân hàng / Ví điện tử */}
                          <div className="flex items-center gap-2">
                            {/* Chú ý: Ông tải logo VNPAY và MoMo vứt vào public/icons/ nhé */}
                            <div className="flex h-8 w-12 items-center justify-center rounded-md border bg-white p-1">
                              <span className="text-[10px] font-bold text-blue-600">VNPAY</span>
                            </div>
                            <div className="flex h-8 w-12 items-center justify-center rounded-md border bg-white p-1">
                              <span className="text-[10px] font-bold text-pink-600">MoMo</span>
                            </div>
                          </div>
                        </div>
                      </label>
                    </FormControl>
                  </FormItem>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

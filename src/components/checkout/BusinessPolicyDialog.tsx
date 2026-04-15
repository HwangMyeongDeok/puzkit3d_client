import { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type {
  OrderConfigDto,
  PaymentConfigDto,
  WalletConfigDto,
} from '@/types/api/config.api.types';

interface BusinessPolicyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  orderConfig?: OrderConfigDto;
  paymentConfig?: PaymentConfigDto;
  walletConfig?: WalletConfigDto;
}

export default function BusinessPolicyDialog({
  isOpen,
  onClose,
  onConfirm,
  orderConfig,
  paymentConfig,
  walletConfig,
}: BusinessPolicyDialogProps) {
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

  // Reset cái tick mỗi khi mở lại dialog
  useEffect(() => {
    if (isOpen) {
      setIsTermsAccepted(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-200">
      <div className="animate-in zoom-in-95 flex w-full max-w-lg flex-col gap-5 rounded-2xl bg-white p-6 shadow-2xl duration-200">
        <div className="flex items-center gap-3 border-b pb-4">
          <ShieldAlert className="text-brand h-6 w-6" />
          <h3 className="text-xl font-bold text-slate-800">Business Policies & Terms</h3>
        </div>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-2 text-sm text-slate-600">
          <p>Please review our terms and policies carefully before placing your order:</p>

          <ul className="space-y-4">
            <li className="flex gap-2">
              <CheckCircle2 className="text-brand h-5 w-5 shrink-0" />
              <span>
                <strong>Payment Time Limit:</strong> Please complete your payment within{' '}
                <strong>{paymentConfig?.onlinePaymentExpiredInDays ?? 2} days</strong>. Each payment
                session lasts for{' '}
                <strong>{paymentConfig?.onlineTransactionExpiredInMinutes ?? 10} minutes</strong>.
              </span>
            </li>

            <li className="flex gap-2">
              <CheckCircle2 className="text-brand h-5 w-5 shrink-0" />
              <span>
                <strong>Refunds:</strong> Returned online orders will be refunded at{' '}
                <strong>{walletConfig?.onlineOrderReturnPercentage ?? 80}%</strong> to your wallet.
              </span>
            </li>

            <li className="flex gap-2">
              <CheckCircle2 className="text-brand h-5 w-5 shrink-0" />
              <span>
                <strong>Cashback:</strong> Earn{' '}
                <strong>{walletConfig?.onlineOrderCompletedRewardPercentage ?? 5}%</strong> cashback
                for Online payments and{' '}
                <strong>{walletConfig?.codOrderCompletedRewardPercentage ?? 2}%</strong> for COD
                upon order completion.
              </span>
            </li>
          </ul>
        </div>

        <div className="mt-2 rounded-xl border bg-slate-50 p-4">
          <label className="flex cursor-pointer items-start gap-3 select-none">
            <input
              type="checkbox"
              className="accent-brand mt-0.5 h-5 w-5 rounded border-gray-300"
              checked={isTermsAccepted}
              onChange={(e) => setIsTermsAccepted(e.target.checked)}
            />
            <span className="text-sm leading-tight font-medium text-slate-800">
              I have read, understood, and accept the Business Policies mentioned above.
            </span>
          </label>
        </div>

        <div className="mt-4 flex justify-end gap-3 border-t pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="text-slate-600">
            Go Back
          </Button>
          <Button
            type="button"
            disabled={!isTermsAccepted}
            onClick={onConfirm}
            className="bg-blue-600 text-white shadow-md transition-colors hover:bg-blue-700"
          >
            Confirm & Place Order
          </Button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { formatPrice } from '@/lib/utils';
import { useLazyGetProfileQuery } from '@/lib/api/endpoints/authApi';
import { useGetWalletQuery } from '@/lib/api/endpoints/walletApi';
import { useGetShippingFeeQuery } from '@/lib/api/endpoints/deliveryApi';
import { useGetPartnerQuotationByRequestIdQuery } from '@/lib/api/endpoints/partnerProductQuotationApi';
import { useCreatePartnerOrderMutation } from '@/lib/api/endpoints/partnerOrderApi';
import {
  useGetOrderConfigQuery,
  useGetPaymentConfigQuery,
  useGetWalletConfigQuery,
} from '@/lib/api/endpoints/configApi';

import BusinessPolicyDialog from '@/components/checkout/BusinessPolicyDialog';
import PaymentActionDialog from '@/components/checkout/PaymentActionDialog';
type PaymentMethod = 'Online' | 'Coin';

type Province = {
  code: number;
  name: string;
};

type District = {
  code: number;
  name: string;
};

type Ward = {
  code: number;
  name: string;
};

const PHONE_REGEX = /^\d{10}$/;

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function findByName<T extends { name: string }>(items: T[], keyword?: string) {
  if (!keyword?.trim()) return undefined;
  const normalized = normalizeText(keyword);

  return (
    items.find((item) => normalizeText(item.name) === normalized) ||
    items.find((item) => normalizeText(item.name).includes(normalized)) ||
    items.find((item) => normalized.includes(normalizeText(item.name)))
  );
}

export default function PartnerCheckoutPage() {
  const params = useParams<{ requestId: string }>();
  const router = useRouter();
  const requestId = params?.requestId;

  const [fetchProfile, { data: profile }] = useLazyGetProfileQuery();
  const { data: walletData } = useGetWalletQuery();

  const { data: orderConfig } = useGetOrderConfigQuery();
  const { data: paymentConfig } = useGetPaymentConfigQuery();
  const { data: walletConfig } = useGetWalletConfigQuery();

  const {
    data: quotation,
    isLoading: isQuotationLoading,
    isError: isQuotationError,
  } = useGetPartnerQuotationByRequestIdQuery(requestId || '', {
    skip: !requestId,
    refetchOnMountOrArgChange: true,
  });

  const [createPartnerOrder, { isLoading: isCreatingOrder }] = useCreatePartnerOrderMutation();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [detailAddress, setDetailAddress] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Online');

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('');
  const [selectedWardCode, setSelectedWardCode] = useState('');

  const [profileProvinceName, setProfileProvinceName] = useState('');
  const [profileDistrictName, setProfileDistrictName] = useState('');
  const [profileWardName, setProfileWardName] = useState('');

  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  const selectedProvince = useMemo(
    () => provinces.find((item) => String(item.code) === selectedProvinceCode),
    [provinces, selectedProvinceCode]
  );

  const selectedDistrict = useMemo(
    () => districts.find((item) => String(item.code) === selectedDistrictCode),
    [districts, selectedDistrictCode]
  );

  const selectedWard = useMemo(
    () => wards.find((item) => String(item.code) === selectedWardCode),
    [wards, selectedWardCode]
  );

  const normalizedProvinceName = selectedProvince?.name ?? '';
  const normalizedDistrictName = selectedDistrict?.name ?? '';
  const normalizedWardName = selectedWard?.name ?? '';

  useEffect(() => {
    fetchProfile(undefined, false);
  }, [fetchProfile]);

  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/v1/p/')
      .then((res) => res.json())
      .then((data: Province[]) => setProvinces(data))
      .catch(() => toast.error('Failed to load province data'));
  }, []);

  useEffect(() => {
    if (!selectedProvinceCode) {
      setDistricts([]);
      setSelectedDistrictCode('');
      setWards([]);
      setSelectedWardCode('');
      return;
    }

    fetch(`https://provinces.open-api.vn/api/v1/p/${selectedProvinceCode}?depth=2`)
      .then((res) => res.json())
      .then((data: { districts: District[] }) => {
        setDistricts(data.districts || []);
      })
      .catch(() => toast.error('Failed to load district data'));

    setSelectedDistrictCode('');
    setWards([]);
    setSelectedWardCode('');
  }, [selectedProvinceCode]);

  useEffect(() => {
    if (!selectedDistrictCode) {
      setWards([]);
      setSelectedWardCode('');
      return;
    }

    fetch(`https://provinces.open-api.vn/api/v1/d/${selectedDistrictCode}?depth=2`)
      .then((res) => res.json())
      .then((data: { wards: Ward[] }) => {
        setWards(data.wards || []);
      })
      .catch(() => toast.error('Failed to load ward data'));

    setSelectedWardCode('');
  }, [selectedDistrictCode]);

  useEffect(() => {
    if (!profile) return;

    const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();

    setCustomerName((prev) => prev || fullName || '');
    setCustomerPhone((prev) => prev || profile.phoneNumber || '');
    setCustomerEmail((prev) => prev || profile.email || '');
    setDetailAddress((prev) => prev || profile.streetAddress || '');

    setProfileProvinceName(profile.provinceName || '');
    setProfileDistrictName(profile.districtName || '');
    setProfileWardName(profile.wardName || '');
  }, [profile]);

  useEffect(() => {
    if (!provinces.length || !profileProvinceName || selectedProvinceCode) return;

    const match = findByName(provinces, profileProvinceName);
    if (match) {
      setSelectedProvinceCode(String(match.code));
    }
  }, [provinces, profileProvinceName, selectedProvinceCode]);

  useEffect(() => {
    if (!districts.length || !profileDistrictName || selectedDistrictCode) return;

    const match = findByName(districts, profileDistrictName);
    if (match) {
      setSelectedDistrictCode(String(match.code));
    }
  }, [districts, profileDistrictName, selectedDistrictCode]);

  useEffect(() => {
    if (!wards.length || !profileWardName || selectedWardCode) return;

    const match = findByName(wards, profileWardName);
    if (match) {
      setSelectedWardCode(String(match.code));
    }
  }, [wards, profileWardName, selectedWardCode]);

  const { data: shippingFeeData, isFetching: isFetchingShippingFee } = useGetShippingFeeQuery(
    {
      provinceName: normalizedProvinceName,
      districtName: normalizedDistrictName,
      wardName: normalizedWardName,
    },
    {
      skip: !normalizedProvinceName || !normalizedDistrictName || !normalizedWardName,
    }
  );

  const shippingFee = shippingFeeData ?? 0;
  const walletBalance = walletData?.balance ?? 0;
  const quotationTotal = quotation?.grandTotalAmount ?? 0;
  const totalBeforeCoin = quotationTotal + shippingFee;
  const autoCoinAmount = Math.min(walletBalance, totalBeforeCoin);
  const finalPayableTotal = Math.max(0, totalBeforeCoin - autoCoinAmount);

  const orderItems = useMemo(() => {
    return (
      quotation?.details?.map((detail) => ({
        partnerProductId: detail.partnerProductId,
        quantity: detail.quantity,
        price: detail.totalAmount ?? 0,
      })) ?? []
    );
  }, [quotation]);

  const isCreateDisabled =
    isCreatingOrder ||
    isFetchingShippingFee ||
    !quotation ||
    !customerName.trim() ||
    !customerEmail.trim() ||
    !PHONE_REGEX.test(customerPhone) ||
    !detailAddress.trim() ||
    !normalizedProvinceName ||
    !normalizedDistrictName ||
    !normalizedWardName ||
    orderItems.length === 0;

  function handlePhoneChange(value: string) {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
    setCustomerPhone(digitsOnly);
  }

  function handleOpenTermsDialog() {
    if (!quotation) {
      toast.error('Quotation not found');
      return;
    }

    if (!customerName.trim() || !customerEmail.trim() || !detailAddress.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!PHONE_REGEX.test(customerPhone)) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }

    if (!normalizedProvinceName || !normalizedDistrictName || !normalizedWardName) {
      toast.error('Please choose a valid province, district and ward');
      return;
    }

    if (paymentMethod === 'Coin' && finalPayableTotal > 0) {
      toast.error('Wallet balance is not enough to pay fully by Coin');
      return;
    }

    setShowTermsDialog(true);
  }

  async function executeCreatePartnerOrder() {
    if (!quotation) {
      toast.error('Quotation not found');
      return;
    }

    try {
      const orderId = await createPartnerOrder({
        quotationId: quotation.id,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        customerProvinceName: normalizedProvinceName,
        customerDistrictName: normalizedDistrictName,
        customerWardName: normalizedWardName,
        detailAddress: detailAddress.trim(),
        userCoinAmount: autoCoinAmount,
        shippingFee,
        paymentMethod,
        items: orderItems,
      }).unwrap();

      setShowTermsDialog(false);

      if (paymentMethod === 'Online') {
        setCreatedOrderId(orderId);
        setShowPaymentDialog(true);
      } else {
        toast.success('Partner order created successfully');
        router.push('/partner-orders');
      }
    } catch (error: any) {
      setShowTermsDialog(false);

      const status = error?.status ?? error?.originalStatus;
      if (status === 409) {
        toast.error('This quotation already has a partner order.');
        router.push('/partner-orders');
        return;
      }

      toast.error(error?.data?.message || 'Failed to create partner order');
    }
  }

  if (isQuotationLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-3xl border bg-white p-6 shadow-sm">Loading partner checkout...</div>
      </div>
    );
  }

  if (isQuotationError || !quotation) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600">
          Failed to load quotation.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-8 lg:px-6">
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold text-slate-900">Partner Checkout</h1>
            <p className="mt-2 text-sm text-slate-500">
              Enter customer information and choose a valid address to calculate the final total.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6 rounded-3xl border bg-white p-6 shadow-sm">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Customer Information</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Customer name
                  </label>
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-slate-900"
                    placeholder="Nhập tên khách hàng"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Phone number
                  </label>
                  <input
                    value={customerPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    inputMode="numeric"
                    maxLength={10}
                    className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-slate-900"
                    placeholder="Nhập số điện thoại 10 số"
                  />
                  {customerPhone.length > 0 && !PHONE_REGEX.test(customerPhone) ? (
                    <p className="mt-1 text-xs text-red-500">
                      Phone number must be exactly 10 digits.
                    </p>
                  ) : null}
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                  <input
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-slate-900"
                    placeholder="Nhập email"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Province
                  </label>
                  <select
                    value={selectedProvinceCode}
                    onChange={(e) => setSelectedProvinceCode(e.target.value)}
                    className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-slate-900"
                  >
                    <option value="">Select province</option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.code}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    District
                  </label>
                  <select
                    value={selectedDistrictCode}
                    onChange={(e) => setSelectedDistrictCode(e.target.value)}
                    disabled={!selectedProvinceCode}
                    className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-slate-900 disabled:bg-slate-100"
                  >
                    <option value="">Select district</option>
                    {districts.map((district) => (
                      <option key={district.code} value={district.code}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Ward</label>
                  <select
                    value={selectedWardCode}
                    onChange={(e) => setSelectedWardCode(e.target.value)}
                    disabled={!selectedDistrictCode}
                    className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-slate-900 disabled:bg-slate-100"
                  >
                    <option value="">Select ward</option>
                    {wards.map((ward) => (
                      <option key={ward.code} value={ward.code}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Detail address
                  </label>
                  <input
                    value={detailAddress}
                    onChange={(e) => setDetailAddress(e.target.value)}
                    className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-slate-900"
                    placeholder="Ví dụ: 360 Đỗ Xuân Hợp"
                  />
                </div>
              </div>

              <p className="text-sm text-slate-500">
                To calculate shipping correctly, province / district / ward must match the official
                location name.
              </p>

              <div>
                <h2 className="text-lg font-bold text-slate-900">Payment Method</h2>

                <div className="mt-4 flex flex-col gap-3">
                  <label className="flex items-center gap-3 rounded-2xl border p-4">
                    <input
                      type="radio"
                      checked={paymentMethod === 'Online'}
                      onChange={() => setPaymentMethod('Online')}
                    />
                    <span className="text-sm font-medium text-slate-800">Online</span>
                  </label>

                  <label className="flex items-center gap-3 rounded-2xl border p-4">
                    <input
                      type="radio"
                      checked={paymentMethod === 'Coin'}
                      onChange={() => setPaymentMethod('Coin')}
                    />
                    <span className="text-sm font-medium text-slate-800">Coin</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">Order Summary</h2>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Quotation code</span>
                    <span className="font-semibold text-slate-900">{quotation.code}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Quotation total</span>
                    <span className="font-semibold text-slate-900">
                      {formatPrice(quotationTotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Wallet balance</span>
                    <span className="font-semibold text-emerald-700">
                      {formatPrice(walletBalance)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Auto applied coin</span>
                    <span className="font-semibold text-amber-700">
                      {formatPrice(autoCoinAmount)}
                    </span>
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-slate-700">Final payable</span>
                      <span className="text-2xl font-extrabold text-slate-900">
                        {isFetchingShippingFee ? 'Calculating...' : formatPrice(finalPayableTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOpenTermsDialog}
                  disabled={isCreateDisabled}
                  className="mt-6 w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
                >
                  Create Partner Order
                </button>
              </div>

              <div className="rounded-3xl border bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900">Quotation Items</h3>

                <div className="mt-4 space-y-3">
                  {quotation.details?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-2xl border p-4"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {item.partnerProductId}
                        </p>
                        <p className="text-xs text-slate-500">Quantity: {item.quantity}</p>
                      </div>

                      <p className="text-sm font-bold text-slate-900">
                        {formatPrice(item.totalAmount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BusinessPolicyDialog
        isOpen={showTermsDialog}
        onClose={() => setShowTermsDialog(false)}
        onConfirm={executeCreatePartnerOrder}
        orderConfig={orderConfig}
        paymentConfig={paymentConfig}
        walletConfig={walletConfig}
      />

      <PaymentActionDialog
        open={showPaymentDialog}
        orderId={createdOrderId}
        onClose={() => setShowPaymentDialog(false)}
        redirectRoute="/partner-orders"
        orderType="partner"
      />
    </>
  );
}

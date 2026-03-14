'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLazyGetProfileQuery } from '@/lib/api/endpoints/authApi';

export default function ProfilePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const [triggerGetProfile, { isLoading, isError, error }] = useLazyGetProfileQuery();

  useEffect(() => {
    setMounted(true);

    const token = localStorage.getItem('accessToken');

    if (!token) {
      router.replace('/login');
      return;
    }

    triggerGetProfile()
      .unwrap()
      .then((res) => {
        setProfile(res);
      })
      .catch((err) => {
        console.log('PROFILE API ERROR:', err);
      });
  }, [router, triggerGetProfile]);

  const handleBackHome = () => {
    router.push('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('expiresAt');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#f8fafc] px-4 py-10 md:px-6">
        <div className="mx-auto max-w-4xl rounded-[28px] border border-slate-200 bg-white p-6">
          Đang tải...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-10 md:px-6">
      <div className="mx-auto max-w-4xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:p-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="mb-2 inline-flex rounded-full bg-[#052a5b]/10 px-4 py-2 text-sm font-semibold text-[#052a5b]">
              MY ACCOUNT
            </p>
            <h1 className="text-3xl font-extrabold text-slate-900">Thông tin tài khoản</h1>
            <p className="mt-2 text-sm text-slate-500">
              Xem thông tin hồ sơ của tài khoản đang đăng nhập.
            </p>
          </div>

          <button
            onClick={handleBackHome}
            className="rounded-2xl border border-slate-200 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Về trang chủ
          </button>
        </div>

        {isLoading && (
          <div className="rounded-2xl bg-slate-50 px-4 py-4 text-slate-600">
            Đang tải thông tin tài khoản...
          </div>
        )}

        {isError && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-4 text-red-600">
            Không lấy được thông tin profile.
            <div className="mt-2 text-sm">
              {typeof error === 'object' && error !== null && 'message' in error
                ? String((error as { message?: string }).message)
                : 'Vui lòng đăng nhập lại.'}
            </div>
          </div>
        )}

        {profile && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
                <p className="mb-2 text-sm font-medium text-slate-500">Họ và tên</p>
                <p className="text-base font-semibold text-slate-900">
                  {[profile.lastName, profile.firstName].filter(Boolean).join(' ') ||
                    'Chưa có dữ liệu'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-2 text-sm font-medium text-slate-500">Email</p>
                <p className="text-base font-semibold text-slate-900">
                  {profile.email || 'Chưa có dữ liệu'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-2 text-sm font-medium text-slate-500">Vai trò</p>
                <p className="text-base font-semibold text-slate-900">
                  {profile.role || 'Chưa có dữ liệu'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-2 text-sm font-medium text-slate-500">Số điện thoại</p>
                <p className="text-base font-semibold text-slate-900">
                  {profile.phoneNumber || 'Chưa có dữ liệu'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-2 text-sm font-medium text-slate-500">Tỉnh / Thành phố</p>
                <p className="text-base font-semibold text-slate-900">
                  {profile.provinceName || 'Chưa có dữ liệu'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-2 text-sm font-medium text-slate-500">Quận / Huyện</p>
                <p className="text-base font-semibold text-slate-900">
                  {profile.districtName || 'Chưa có dữ liệu'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-2 text-sm font-medium text-slate-500">Phường / Xã</p>
                <p className="text-base font-semibold text-slate-900">
                  {profile.wardName || 'Chưa có dữ liệu'}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-2 text-sm font-medium text-slate-500">Địa chỉ cụ thể</p>
              <p className="text-base font-semibold text-slate-900">
                {profile.streetAddress || 'Chưa có dữ liệu'}
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={handleLogout}
                className="rounded-2xl bg-[#e51636] px-5 py-3 font-bold text-white transition hover:opacity-95"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

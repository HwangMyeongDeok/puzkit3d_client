'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLoginMutation } from '@/lib/api/endpoints/authApi';

export default function LoginForm() {
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Vui lòng nhập email và mật khẩu.');
      return;
    }

    try {
      const result = await login(form).unwrap();

      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('refreshToken', result.refreshToken);
      localStorage.setItem('expiresAt', result.expiresAt);
      localStorage.setItem('user', JSON.stringify(result.user));

      router.push('/profile');
    } catch (err: unknown) {
      const message =
        typeof err === 'object' &&
        err !== null &&
        'message' in err &&
        typeof (err as { message?: string }).message === 'string'
          ? (err as { message?: string }).message!
          : 'Đăng nhập thất bại';

      setError(message);
    }
  };

  return (
    <section className="mx-auto w-full max-w-[1200px] px-4 py-12 md:px-6 md:py-16">
      <div className="grid overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:grid-cols-2">
        <div className="bg-[#052a5b] px-8 py-10 text-white md:px-12 md:py-14">
          <p className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold tracking-wide">
            CUSTOMER ACCOUNT
          </p>

          <h1 className="mb-4 text-4xl leading-tight font-extrabold md:text-5xl">
            Welcome back to PuzKit3D
          </h1>

          <p className="max-w-md text-base leading-7 text-slate-200 md:text-lg">
            Đăng nhập để theo dõi đơn hàng, tìm kiếm sản phẩm yêu thích và tiếp tục trải nghiệm mua
            sắm mô hình 3D trên PuzKit3D.
          </p>

          <div className="mt-10 space-y-4 text-sm text-slate-200">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              Theo dõi và trạng thái đơn hàng và yêu cầu hỗ trợ nhanh chóng
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              Thiết kế tùy chỉnh mô hình sản phẩm yêu thích
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              Truy cập các ưu đãi và thông tin tài khoản cá nhân
            </div>
          </div>
        </div>

        <div className="px-6 py-8 md:px-10 md:py-12">
          <div className="mx-auto w-full max-w-md">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Đăng nhập</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Nhập email và mật khẩu để truy cập tài khoản của bạn.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-800">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Nhập email"
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base transition outline-none focus:border-[#052a5b] focus:bg-white"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Mật khẩu
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu"
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base transition outline-none focus:border-[#052a5b] focus:bg-white"
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="flex h-14 w-full items-center justify-center rounded-2xl bg-[#e51636] px-6 text-base font-bold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>

              <p className="text-center text-sm text-slate-500">
                Chưa có tài khoản?{' '}
                <Link href="/register" className="font-semibold text-[#052a5b] hover:underline">
                  Đăng ký ngay
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

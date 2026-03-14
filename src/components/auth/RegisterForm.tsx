'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRegisterMutation } from '@/lib/api/endpoints/authApi';

export default function RegisterForm() {
  const router = useRouter();
  const [register, { isLoading }] = useRegisterMutation();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    try {
      await register(form).unwrap();
      setSuccess('Đăng ký thành công. Đang chuyển sang trang đăng nhập...');

      setTimeout(() => {
        router.push('/login');
      }, 1200);
    } catch (err: unknown) {
      const message =
        typeof err === 'object' &&
        err !== null &&
        'message' in err &&
        typeof (err as { message?: string }).message === 'string'
          ? (err as { message?: string }).message!
          : 'Đăng ký thất bại';

      setError(message);
    }
  };

  return (
    <section className="mx-auto w-full max-w-[1200px] px-4 py-12 md:px-6 md:py-16">
      <div className="grid overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:grid-cols-2">
        <div className="bg-[#052a5b] px-8 py-10 text-white md:px-12 md:py-14">
          <p className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold tracking-wide">
            CREATE ACCOUNT
          </p>

          <h1 className="mb-4 text-4xl leading-tight font-extrabold md:text-5xl">
            Tham gia PuzKit3D ngay để nhận được nhiều ưu đãi hấp dẫn
          </h1>

          <p className="max-w-md text-base leading-7 text-slate-200 md:text-lg">
            Tạo tài khoản để mua sắm thuận tiện hơn, tìm kiếm sản phẩm yêu thích và tra cứu đơn hàng
            của bạn.
          </p>

          <div className="mt-10 space-y-4 text-sm text-slate-200">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              Mua sắm nhanh hơn với tài khoản cá nhân
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              Quản lý đơn hàng và thông tin dễ dàng
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              Đặt sản phẩm thiết kế tùy chỉnh theo ý thích của bạn
            </div>
          </div>
        </div>

        <div className="px-6 py-8 md:px-10 md:py-12">
          <div className="mx-auto w-full max-w-md">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Đăng ký ngay</h2>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="lastName"
                    className="mb-2 block text-sm font-semibold text-slate-800"
                  >
                    Họ
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Nhập họ"
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base transition outline-none focus:border-[#052a5b] focus:bg-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-2 block text-sm font-semibold text-slate-800"
                  >
                    Tên
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="Nhập tên"
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base transition outline-none focus:border-[#052a5b] focus:bg-white"
                  />
                </div>
              </div>

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

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Nhập mật khẩu"
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-14 text-base transition outline-none focus:border-[#052a5b] focus:bg-white"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-500 transition hover:text-slate-800"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="flex h-14 w-full items-center justify-center rounded-2xl bg-[#e51636] px-6 text-base font-bold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
              </button>

              <p className="text-center text-sm text-slate-500">
                Đã có tài khoản?{' '}
                <Link href="/login" className="font-semibold text-[#052a5b] hover:underline">
                  Đăng nhập
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

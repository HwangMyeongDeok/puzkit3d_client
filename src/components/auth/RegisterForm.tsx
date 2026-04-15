'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRegisterMutation } from '@/lib/api/endpoints/authApi';
import { toast } from 'sonner';
import { handleErrorToast } from '@/lib/utils/error-handler';

export default function RegisterForm() {
  const [register, { isLoading }] = useRegisterMutation();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      // Gọi API đăng ký
      await register(form).unwrap();

      toast.success(
        'Registration successful! Please check your email (and spam folder) to verify your account.'
      );

      setForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
      });
    } catch (err: any) {
      handleErrorToast(err);
    }
  };

  return (
    <section className="mx-auto w-full max-w-300 px-4 py-12 md:px-6 md:py-16">
      <div className="grid overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:grid-cols-2">
        <div className="bg-[#052a5b] px-8 py-10 text-white md:px-12 md:py-14">
          <p className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold tracking-wide">
            CREATE ACCOUNT
          </p>

          <h1 className="mb-4 text-4xl leading-tight font-extrabold md:text-5xl">
            Join PuzKit3D now to get attractive offers
          </h1>

          <p className="max-w-md text-base leading-7 text-slate-200 md:text-lg">
            Create an account to shop more conveniently, find your favorite products and check your
            orders.
          </p>

          <div className="mt-10 space-y-4 text-sm text-slate-200">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              Shop faster with a personal account
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              Manage orders and information easily
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              Place custom designed products according to your preferences
            </div>
          </div>
        </div>

        <div className="px-6 py-8 md:px-10 md:py-12">
          <div className="mx-auto w-full max-w-md">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Sign Up Now</h2>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="lastName"
                    className="mb-2 block text-sm font-semibold text-slate-800"
                  >
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Enter your last name"
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base transition outline-none focus:border-[#052a5b] focus:bg-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-2 block text-sm font-semibold text-slate-800"
                  >
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="Enter your first name"
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
                  placeholder="Enter your email"
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base transition outline-none focus:border-[#052a5b] focus:bg-white"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base transition outline-none focus:border-[#052a5b] focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex h-14 w-full items-center justify-center rounded-2xl bg-[#e51636] px-6 text-base font-bold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Registering...' : 'Register'}
              </button>

              <p className="text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-[#052a5b] hover:underline">
                  Sign In
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

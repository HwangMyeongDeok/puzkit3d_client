'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLoginMutation } from '@/lib/api/endpoints/authApi';
import { useAppDispatch } from '@/stores/hooks';
import { setCredentials } from '@/stores/slices/authSlice';
import { handleErrorToast } from '@/lib/utils/error-handler';
import { toast } from 'sonner';
import { APP_CONFIG } from '@/constants';

export default function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const [notVerifiedError, setNotVerifiedError] = useState(false);

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Hide error message when user types again
    if (notVerifiedError) setNotVerifiedError(false);

    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNotVerifiedError(false);

    if (!form.email || !form.password) {
      toast.error('Please enter your email and password!');
      return;
    }

    try {
      const result = await login(form).unwrap();

      // Use full user object from API if available, fallback to basic info
      const userData = result.user || {
        id: result.userId,
        email: result.email,
      };

      const authData = {
        user: userData,
        accessToken: result.token,
        refreshToken: result.refreshToken,
      };

      dispatch(setCredentials(authData as any));

      // Save only user info (non-sensitive) to localStorage
      localStorage.setItem(APP_CONFIG.AUTH_STORAGE_KEY, JSON.stringify(userData));

      // Save tokens (sensitive) directly to Cookie for security
      document.cookie = `${APP_CONFIG.ACCESS_TOKEN_KEY}=${result.token}; path=/; max-age=604800; SameSite=Lax`;
      if (result.refreshToken) {
        document.cookie = `${APP_CONFIG.REFRESH_TOKEN_KEY}=${result.refreshToken}; path=/; max-age=2592000; SameSite=Lax`;
      }

      // Get redirect URL from query params, default to home
      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get('redirect') || '/';

      router.push(decodeURIComponent(redirectUrl));
    } catch (err: any) {
      const errorMessage = err?.data?.message || err?.message || '';
      if (
        errorMessage.toLowerCase().includes('not verified') ||
        errorMessage.toLowerCase().includes('chưa xác thực') ||
        err?.status === 403
      ) {
        setNotVerifiedError(true);
        toast.error('Account has not been verified.');
      } else {
        handleErrorToast(err);
      }
    }
  };

  return (
    <section className="mx-auto w-full max-w-300 px-4 py-12 md:px-6 md:py-16">
      <div className="grid overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:grid-cols-2">
        <div className="bg-[#052a5b] px-8 py-10 text-white md:px-12 md:py-14">
          <p className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold tracking-wide">
            CUSTOMER ACCOUNT
          </p>

          <h1 className="mb-4 text-4xl leading-tight font-extrabold md:text-5xl">
            Welcome back to PuzKit3D
          </h1>

          <p className="max-w-md text-base leading-7 text-slate-200 md:text-lg">
            Sign in to track your orders, find your favorite products, and continue your 3D model
            shopping experience on PuzKit3D.
          </p>

          <div className="mt-10 space-y-4 text-sm text-slate-200">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              Track order status and request support quickly
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              Customize your favorite product designs
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              Access exclusive offers and personal account information
            </div>
          </div>
        </div>

        <div className="px-6 py-8 md:px-10 md:py-12">
          <div className="mx-auto w-full max-w-md">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Sign In</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Enter your email and password to access your account.
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

              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-[#052a5b] hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex h-14 w-full items-center justify-center rounded-2xl bg-[#e51636] px-6 text-base font-bold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>

              <p className="text-center text-sm text-slate-500">
                Don't have an account?{' '}
                <Link href="/register" className="font-semibold text-[#052a5b] hover:underline">
                  Sign up now
                </Link>
              </p>

              {/* Error message when account is not verified */}
              {notVerifiedError && (
                <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4 text-center">
                  <p className="text-sm text-red-800">
                    Your account has not been verified. Please check your email again or{' '}
                    <Link href="/register" className="font-bold underline hover:text-red-900">
                      sign up again
                    </Link>{' '}
                    to receive a new verification link.
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

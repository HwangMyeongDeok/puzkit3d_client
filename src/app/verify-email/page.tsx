'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useConfirmEmailMutation } from '@/lib/api/endpoints/authApi';
import { ROUTES } from '@/constants/routes';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const userId = searchParams.get('userId');

  const [confirmEmail, { isLoading, isSuccess, isError }] = useConfirmEmailMutation();
  const hasFiredRef = useRef(false);

  useEffect(() => {
    if (!token || !userId || hasFiredRef.current) return;
    hasFiredRef.current = true;

    const safeToken = token.replace(/ /g, '+');
    confirmEmail({ userId, token: safeToken });
  }, [token, userId, confirmEmail]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center gap-4 text-center">
          {isLoading || (!isSuccess && !isError) ? (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-slate-500" />
              <p className="text-slate-600">Verifying...</p>
            </>
          ) : isSuccess ? (
            <>
              <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <p className="mb-4 text-xl font-semibold text-slate-900">Verified!</p>
              <Link href={ROUTES.LOGIN} className="w-full">
                <button className="w-full rounded-md bg-slate-900 py-2 font-medium text-white transition-colors hover:bg-slate-800">
                  Go to Login
                </button>
              </Link>
            </>
          ) : (
            <>
              <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <p className="mb-1 text-xl font-semibold text-slate-900">Verification failed</p>
              <p className="mb-4 text-sm text-slate-500">The link may be invalid or expired.</p>
              <Link href={ROUTES.HOME} className="w-full">
                <button className="w-full rounded-md border border-slate-300 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-50">
                  Go to Home
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
          <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

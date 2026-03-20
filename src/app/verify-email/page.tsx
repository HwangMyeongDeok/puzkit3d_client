'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useVerifyEmailMutation } from '@/lib/api/endpoints/authApi';
import { ROUTES } from '@/constants';
import { Loader2, CheckCircle2, XCircle, MailCheck } from 'lucide-react';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type VerifyState = 'verifying' | 'success' | 'error' | 'no-token';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [verifyEmail] = useVerifyEmailMutation();
  const [state, setState] = useState<VerifyState>(token ? 'verifying' : 'no-token');
  const hasFiredRef = useRef(false);

  // Single-fire: prevent React StrictMode / concurrent-mode double invocation
  useEffect(() => {
    if (!token || hasFiredRef.current) return;
    hasFiredRef.current = true;

    verifyEmail({ token })
      .unwrap()
      .then(() => setState('success'))
      .catch(() => setState('error'));
  }, [token, verifyEmail]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="bg-brand/10 mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full">
            <MailCheck className="text-brand h-7 w-7" />
          </div>
          <CardTitle className="text-2xl font-bold">Xác minh email</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-4 text-center">
          {state === 'verifying' && (
            <>
              <Loader2 className="text-brand h-12 w-12 animate-spin" />
              <p className="text-muted-foreground text-sm">
                Đang xác minh email của bạn, vui lòng chờ...
              </p>
            </>
          )}

          {state === 'success' && (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-green-700">Xác minh thành công!</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Email của bạn đã được xác minh. Bạn có thể đăng nhập ngay bây giờ.
                </p>
              </div>
            </>
          )}

          {state === 'error' && (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-red-700">Xác minh thất bại</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Liên kết không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu gửi lại email xác minh từ
                  trang đăng nhập.
                </p>
              </div>
            </>
          )}

          {state === 'no-token' && (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                <XCircle className="h-8 w-8 text-yellow-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-yellow-700">Thiếu mã xác minh</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Không tìm thấy mã xác minh trong liên kết. Vui lòng sử dụng đúng liên kết trong
                  email.
                </p>
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className="flex justify-center">
          <Link href={ROUTES.LOGIN}>
            <Button variant={state === 'success' ? 'default' : 'outline'}>
              {state === 'success' ? 'Đăng nhập ngay' : 'Quay lại đăng nhập'}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}

// Wrap in Suspense because useSearchParams() requires it in Next.js App Router
export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
          <Loader2 className="text-brand h-8 w-8 animate-spin" />
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

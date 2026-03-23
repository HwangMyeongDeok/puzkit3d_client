'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useResetPasswordMutation } from '@/lib/api/endpoints/authApi';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/schema/auth.schema';
import { handleApiError } from '@/lib/utils/error-handle';
import { ROUTES } from '@/constants';
import { toast } from 'sonner';
import { KeyRound, Loader2, ArrowLeft, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const userId = searchParams.get('userId');

  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  // No token → dead end guard
  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100">
              <XCircle className="h-7 w-7 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Invalid Link</CardTitle>
            <CardDescription>
              The password reset link is invalid or has expired. Please request a new link.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-3">
            <Link href={ROUTES.FORGOT_PASSWORD} className="w-full">
              <Button className="w-full">Request New Link</Button>
            </Link>
            <Link
              href={ROUTES.LOGIN}
              className="text-brand hover:text-brand/80 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
          </CardFooter>
        </Card>
      </main>
    );
  }

  const onSubmit = async (values: ResetPasswordFormValues) => {
    try {
      const safeToken = token.replace(/ /g, '+');
      await resetPassword({
        userId: userId as string,
        token: safeToken,
        newPassword: values.newPassword,
      }).unwrap();
      setIsSuccess(true);
      toast.success('Password has been reset successfully!');
    } catch (err) {
      handleApiError(err);
    }
  };

  if (isSuccess) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Password Reset Successful!</CardTitle>
            <CardDescription>
              Your password has been changed. Please sign in with your new password.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Link href={ROUTES.LOGIN}>
              <Button>Sign In Now</Button>
            </Link>
          </CardFooter>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="bg-brand/10 mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full">
            <KeyRound className="text-brand h-7 w-7" />
          </div>
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>Enter a new password for your account.</CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Minimum 8 characters"
                          autoComplete="new-password"
                          disabled={isLoading}
                          {...field}
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirm ? 'text' : 'password'}
                          placeholder="Re-enter new password"
                          autoComplete="new-password"
                          disabled={isLoading}
                          {...field}
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                          onClick={() => setShowConfirm(!showConfirm)}
                        >
                          {showConfirm ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password strength hints */}
              <div className="text-muted-foreground space-y-1 text-xs">
                <p className="font-medium">Password must contain:</p>
                <ul className="list-inside list-disc space-y-0.5 pl-1">
                  <li>At least 8 characters</li>
                  <li>1 uppercase, 1 lowercase letter, 1 number</li>
                  <li>1 special character (!@#$...)</li>
                </ul>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
              <Link
                href={ROUTES.LOGIN}
                className="text-brand hover:text-brand/80 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </main>
  );
}

// Wrap in Suspense because useSearchParams() requires it in Next.js App Router
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
          <Loader2 className="text-brand h-8 w-8 animate-spin" />
        </main>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

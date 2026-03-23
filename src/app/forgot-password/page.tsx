'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForgotPasswordMutation } from '@/lib/api/endpoints/authApi';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/schema/auth.schema';
import { ROUTES } from '@/constants';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

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
import { Label } from '@/components/ui/label';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';

export default function ForgotPasswordPage() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      await forgotPassword(values).unwrap();
    } catch {
      // Intentionally swallow — never reveal if email exists or not
    } finally {
      // Always show success to prevent email enumeration
      setIsSubmitted(true);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="bg-brand/10 mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full">
            <Mail className="text-brand h-7 w-7" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {isSubmitted ? 'Check your email' : 'Forgot password'}
          </CardTitle>
          <CardDescription>
            {isSubmitted
              ? 'If this email exists in our system, you will receive a password reset link in a few minutes.'
              : 'Enter your registered email to receive a password reset link.'}
          </CardDescription>
        </CardHeader>

        {isSubmitted ? (
          <>
            <CardContent className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-muted-foreground text-sm">
                Didn't receive the email? Check your <strong>Spam</strong> folder or try again in a
                few minutes.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setIsSubmitted(false);
                  form.reset();
                }}
              >
                Resend email
              </Button>
              <Link
                href={ROUTES.LOGIN}
                className="text-brand hover:text-brand/80 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </CardFooter>
          </>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          autoComplete="email"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send reset link'
                  )}
                </Button>
                <Link
                  href={ROUTES.LOGIN}
                  className="text-brand hover:text-brand/80 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Link>
              </CardFooter>
            </form>
          </Form>
        )}
      </Card>
    </main>
  );
}

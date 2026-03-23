'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useChangePasswordMutation } from '@/lib/api/endpoints/authApi';
import { changePasswordSchema, type ChangePasswordFormValues } from '@/schema/auth.schema';
import { handleApiError } from '@/lib/utils/error-handle';
import { toast } from 'sonner';
import { KeyRound, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function ChangePasswordForm() {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [showFields, setShowFields] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: ChangePasswordFormValues) => {
    try {
      await changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      }).unwrap();
      toast.success('Password changed successfully!', {
        icon: <CheckCircle2 className="h-4 w-4 text-green-600" />,
      });
      form.reset();
    } catch (err) {
      handleApiError(err);
    }
  };

  const toggleVisibility = (field: keyof typeof showFields) => {
    setShowFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const PasswordInput = ({
    field,
    visibilityKey,
    placeholder,
  }: {
    field: any;
    visibilityKey: keyof typeof showFields;
    placeholder: string;
  }) => (
    <div className="relative">
      <Input
        type={showFields[visibilityKey] ? 'text' : 'password'}
        placeholder={placeholder}
        autoComplete={visibilityKey === 'old' ? 'current-password' : 'new-password'}
        disabled={isLoading}
        {...field}
      />
      <button
        type="button"
        tabIndex={-1}
        className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
        onClick={() => toggleVisibility(visibilityKey)}
      >
        {showFields[visibilityKey] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-brand/10 flex h-10 w-10 items-center justify-center rounded-full">
            <KeyRound className="text-brand h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Change Password</CardTitle>
            <CardDescription>Update your password to secure your account.</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="oldPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      field={field}
                      visibilityKey="old"
                      placeholder="Enter your current password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      field={field}
                      visibilityKey="new"
                      placeholder="At least 8 characters"
                    />
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
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      field={field}
                      visibilityKey="confirm"
                      placeholder="Re-enter your new password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password strength hints */}
            <div className="text-muted-foreground space-y-1 text-xs">
              <p className="font-medium">New password must have:</p>
              <ul className="list-inside list-disc space-y-0.5 pl-1">
                <li>At least 8 characters</li>
                <li>1 uppercase, 1 lowercase, 1 number</li>
                <li>1 special character (!@#$...)</li>
                <li>Different from current password</li>
              </ul>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

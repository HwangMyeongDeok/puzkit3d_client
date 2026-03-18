'use client';

import { useAppSelector } from '@/stores';
import { ShieldCheck, User as UserIcon, Mail } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold md:text-3xl">Hồ sơ cá nhân</h1>

      <div className="bg-card border-border rounded-xl border p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="bg-primary/10 text-primary flex h-20 w-20 items-center justify-center rounded-full">
            <UserIcon className="h-10 w-10" />
          </div>
          <div>
            <h2 className="text-xl font-bold">
              {user?.firstName
                ? `${user.firstName} ${user.lastName || ''}`
                : user?.email?.split('@')[0] || 'Khách hàng'}
            </h2>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-muted-foreground text-sm font-medium">Email</label>
            <div className="bg-muted flex items-center gap-3 rounded-lg p-3">
              <Mail className="text-muted-foreground h-5 w-5" />
              <span>{user?.email || 'Chưa cập nhật'}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-muted-foreground text-sm font-medium">
              Trạng thái tài khoản
            </label>
            <div
              className={`flex items-center gap-3 rounded-lg p-3 font-medium ${user?.emailConfirmed ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}
            >
              <ShieldCheck className="h-5 w-5" />
              <span>{user?.emailConfirmed ? 'Đã xác thực' : 'Đang xử lý'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

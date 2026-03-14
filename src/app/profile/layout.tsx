'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Receipt, Settings, LogOut } from 'lucide-react';
import { toast } from 'sonner';

import { useAppDispatch } from '@/stores/hooks';
import { logout } from '@/stores/slices/authSlice';

export default function ProfileLayout({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Đã đăng xuất thành công!');
    router.push('/');
  };
  return (
    <div className="container-custom py-8 lg:py-12">
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Sidebar */}
        <aside className="w-full shrink-0 md:w-64">
          <div className="bg-card border-border rounded-xl border p-4">
            <nav className="flex flex-col gap-2">
              <Link
                href="/profile"
                className="hover:bg-muted text-card-foreground flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors"
              >
                <User className="text-muted-foreground h-5 w-5" />
                Hồ sơ cá nhân
              </Link>
              <Link
                href="/orders"
                className="hover:bg-muted text-card-foreground flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors"
              >
                <Receipt className="text-muted-foreground h-5 w-5" />
                Lịch sử mua hàng
              </Link>
              <Link
                href="#"
                className="hover:bg-muted text-card-foreground flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors"
              >
                <Settings className="text-muted-foreground h-5 w-5" />
                Cài đặt
              </Link>
              <div className="bg-border my-2 h-px w-full" />
              <button
                className="hover:bg-destructive/10 text-destructive flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left font-medium transition-colors"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                Đăng xuất
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { User, Receipt, Settings, LogOut, Palette, Wallet } from 'lucide-react';
import { toast } from 'sonner';

import { useAppDispatch } from '@/stores/hooks';
import { logout } from '@/stores/slices/authSlice';

import { clearAxiosState } from '@/lib/api/axiosInstance';
import { apiSlice } from '@/lib/api/apiSlice';

export default function ProfileLayout({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    clearAxiosState();

    dispatch(apiSlice.util.resetApiState());

    dispatch(logout());

    localStorage.clear();
    sessionStorage.clear();

    toast.success('Logged out successfully!');
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
                className={`flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors ${pathname === '/profile' ? 'bg-brand/10 text-brand' : 'hover:bg-muted text-card-foreground'}`}
              >
                <User
                  className={`h-5 w-5 ${pathname === '/profile' ? 'text-brand' : 'text-muted-foreground'}`}
                />
                Profile
              </Link>
              <Link
                href="/orders"
                className={`flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors ${pathname?.startsWith('/orders') ? 'bg-brand/10 text-brand' : 'hover:bg-muted text-card-foreground'}`}
              >
                <Receipt
                  className={`h-5 w-5 ${pathname?.startsWith('/orders') ? 'text-brand' : 'text-muted-foreground'}`}
                />
                Order History
              </Link>
              <Link
                href="/profile/custom-designs"
                className={`flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors ${pathname?.startsWith('/profile/custom-designs') ? 'bg-brand/10 text-brand' : 'hover:bg-muted text-card-foreground'}`}
              >
                <Palette
                  className={`h-5 w-5 ${pathname?.startsWith('/profile/custom-designs') ? 'text-brand' : 'text-muted-foreground'}`}
                />
                Custom Designs
              </Link>
              <Link
                href="/ticket-support"
                className={`flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors ${pathname?.startsWith('/ticket-support') ? 'bg-brand/10 text-brand' : 'hover:bg-muted text-card-foreground'}`}
              >
                <Receipt
                  className={`h-5 w-5 ${pathname?.startsWith('/ticket-support') ? 'text-brand' : 'text-muted-foreground'}`}
                />
                Ticket Support
              </Link>
              <Link
                href="/wallet"
                className={`flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors ${pathname?.startsWith('/wallet') ? 'bg-brand/10 text-brand' : 'hover:bg-muted text-card-foreground'}`}
              >
                <Wallet
                  className={`h-5 w-5 ${pathname?.startsWith('/wallet') ? 'text-brand' : 'text-muted-foreground'}`}
                />
                Wallet
              </Link>
              <Link
                href="#"
                className="hover:bg-muted text-card-foreground flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors"
              >
                <Settings className="text-muted-foreground h-5 w-5" />
                Settings
              </Link>
              <div className="bg-border my-2 h-px w-full" />
              <button
                className="hover:bg-destructive/10 text-destructive flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left font-medium transition-colors"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                Logout
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

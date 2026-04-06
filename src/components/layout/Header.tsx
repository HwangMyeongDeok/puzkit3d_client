'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, Menu, X, User, LogOut, Coins } from 'lucide-react';

import { ROUTES } from '@/constants';
import MiniCart from '@/components/custom/MiniCart';
import { useGetCartQuery } from '@/lib/api/endpoints/cartApi';
import { useGetWalletQuery } from '@/lib/api/endpoints/walletApi';
import { toast } from 'sonner';
import type { CartItemDto } from '@/types/api/cart.api.types';

import { clearAxiosState } from '@/lib/api/axiosInstance';
import { apiSlice } from '@/lib/api/apiSlice';

// Redux
import { useAppSelector, useAppDispatch } from '@/stores/hooks';
import {
  selectIsAuthenticated,
  selectCurrentUser,
  logout,
  selectAuthLoading,
} from '@/stores/slices/authSlice';

const NAV_LINKS = [
  { href: ROUTES.HOME, label: 'Home' },
  { href: ROUTES.PRODUCTS, label: 'Shop' },
  { href: ROUTES.BRANDS, label: 'Brands' },
  { href: ROUTES.CUSTOM_SERVICE, label: 'Custom Service' },
];

const MINI_CART_DISABLED_ROUTES = [ROUTES.CART, ROUTES.CHECKOUT];

export default function Header() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);
  const isAuthLoading = useAppSelector(selectAuthLoading);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: cartData } = useGetCartQuery(undefined, {
    skip: !mounted || isAuthLoading || !isAuthenticated,
  });

  const { data: walletData, error: walletError } = useGetWalletQuery(undefined, {
    skip: !mounted || isAuthLoading || !isAuthenticated,
  });

  useEffect(() => {
    const isUnauthorized = (walletError as any)?.status === 401;

    if (isUnauthorized && isAuthenticated && !isAuthLoading) {
      handleLogout(true);
    }
  }, [walletError, isAuthenticated, isAuthLoading]);

  const cartCount = useMemo(() => {
    if (!cartData?.items) return 0;
    return cartData.items.reduce((acc: number, item: CartItemDto) => acc + (item.quantity ?? 0), 0);
  }, [cartData]);

  const isMiniCartDisabled = MINI_CART_DISABLED_ROUTES.some((route) => pathname.startsWith(route));

  const handleCartClick = () => {
    if (isMiniCartDisabled) {
      router.push(ROUTES.CART);
    }
  };

  const handleLogout = (isForced = false) => {
    clearAxiosState();
    dispatch(apiSlice.util.resetApiState());
    dispatch(logout());
    localStorage.clear();
    sessionStorage.clear();

    if (!isForced) {
      toast.success('Logged out successfully!');
      router.push('/');
    } else {
      toast.error('Session expired. Please log in again.');
      router.push('/login');
    }
  };

  if (!mounted) return <div className="h-16 w-full bg-[#f8fbff]" />;

  const cartButton = (
    <button
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#dbe7ff] bg-[linear-gradient(180deg,#ffffff_0%,#f5f9ff_100%)] text-[#0f2347] shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
      onClick={handleCartClick}
      aria-label="Cart"
    >
      <ShoppingCart className="h-5 w-5" />
      {isAuthenticated && cartCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#ef233c] px-1 text-[10px] font-bold text-white shadow-sm">
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      )}
    </button>
  );

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/40 bg-[rgba(248,251,255,0.82)] backdrop-blur-xl">
      <div className="container-custom flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <span className="inline-flex h-10 items-center rounded-full border border-[#dbe7ff] bg-[linear-gradient(180deg,#ffffff_0%,#f5f9ff_100%)] px-4 text-[20px] font-extrabold tracking-tight text-[#052a5b] shadow-sm">
            PuzKit3D
          </span>
        </Link>

        <nav className="hidden items-center rounded-full border border-[#dbe7ff] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(245,249,255,0.96)_100%)] p-1 shadow-[0_10px_24px_rgba(15,23,42,0.05)] md:flex">
          {NAV_LINKS.map((link) => {
            const isActive =
              pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-[#0f2347] text-white shadow-sm'
                    : 'text-[#4b6797] hover:bg-white hover:text-[#0f2347]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated && !isAuthLoading && (
            <Link
              href="/wallet"
              title="My PuzCoins"
              className="inline-flex h-11 min-w-[60px] items-center justify-center gap-1.5 rounded-full border border-amber-200/80 bg-[linear-gradient(180deg,#fff8e7_0%,#fff2c7_100%)] px-3 text-amber-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-100"
            >
              <Coins className="h-4 w-4" />
              <span className="text-sm font-bold">
                {walletData?.balance ? walletData.balance.toLocaleString() : 0}
              </span>
            </Link>
          )}

          <Link
            href={isAuthenticated ? '/profile' : ROUTES.LOGIN}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#dbe7ff] bg-[linear-gradient(180deg,#ffffff_0%,#f5f9ff_100%)] text-[#052a5b] shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
            aria-label="Profile"
            title={isAuthenticated ? user?.lastName || 'Profile' : 'Login'}
          >
            <User className="h-5 w-5" />
          </Link>

          {!isMiniCartDisabled && !isAuthLoading ? <MiniCart>{cartButton}</MiniCart> : cartButton}

          {isAuthenticated && (
            <button
              onClick={() => handleLogout(false)}
              className="hidden h-11 w-11 items-center justify-center rounded-full border border-[#dbe7ff] bg-[linear-gradient(180deg,#ffffff_0%,#f5f9ff_100%)] text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:text-red-600 sm:inline-flex"
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}

          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#dbe7ff] bg-[linear-gradient(180deg,#ffffff_0%,#f5f9ff_100%)] text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-white md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-[#dbe7ff] bg-[rgba(255,255,255,0.94)] p-4 shadow-xl backdrop-blur-xl md:hidden">
          <div className="space-y-2 rounded-[24px] border border-[#e4ecf8] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-3 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
            {NAV_LINKS.map((link) => {
              const isActive =
                pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActive ? 'bg-[#0f2347] text-white' : 'text-slate-700 hover:bg-[#f4f8ff]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {isAuthenticated && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout(false);
                }}
                className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

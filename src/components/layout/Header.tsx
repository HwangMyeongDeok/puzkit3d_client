'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, Menu, X, Search, User, LogOut, Coins } from 'lucide-react';

import { ROUTES, APP_CONFIG } from '@/constants';
import MiniCart from '@/components/custom/MiniCart';
import { useGetCartQuery } from '@/lib/api/endpoints/cartApi';
import { useGetWalletQuery } from '@/lib/api/endpoints/walletApi';
import { toast } from 'sonner';
import type { CartItemDto } from '@/types/api/cart.api.types';

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
  { href: '/custom-service', label: 'Custom Service' },
];

const MINI_CART_DISABLED_ROUTES = ['/cart', '/checkout'];

export default function Header() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);
  const isAuthLoading = useAppSelector(selectAuthLoading);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 1. Chỉ đánh dấu mounted khi đã chạy trên Browser
  useEffect(() => {
    setMounted(true);
  }, []);

  // 2. Gọi API Giỏ hàng
  const { data: cartData } = useGetCartQuery(undefined, {
    skip: !mounted || isAuthLoading || !isAuthenticated,
  });

  // 3. Gọi API Wallet + Bắt lỗi (Radar dò bóng ma)
  const { data: walletData, error: walletError } = useGetWalletQuery(undefined, {
    skip: !mounted || isAuthLoading || !isAuthenticated,
  });

  // 👉 HIỆU ỨNG RADAR: Bắt lỗi nếu mất User trong Database
  useEffect(() => {
    if (walletError && isAuthenticated) {
      console.warn('Phát hiện User ảo (DB bị xóa hoặc lỗi Token). Đang dọn dẹp state...');
      handleLogout(true); // Tham số true để báo hiệu là force logout
    }
  }, [walletError, isAuthenticated]);

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

  // 👉 HÀM LOGOUT MẠNH TAY HƠN
  const handleLogout = (isForced = false) => {
    dispatch(logout());

    // Xóa cứng toàn bộ local/session storage
    localStorage.clear();
    sessionStorage.clear();

    // Xóa cookies
    document.cookie = `${APP_CONFIG.ACCESS_TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    document.cookie = `${APP_CONFIG.REFRESH_TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

    if (!isForced) {
      toast.success('Logged out successfully!');
    } else {
      toast.error('Session expired. Please log in again.');
    }

    // F5 lại toàn bộ app để clean sạch RAM và Redux Store
    window.location.href = '/login';
  };

  if (!mounted) return <div className="h-16 w-full bg-white shadow-sm" />;

  const cartButton = (
    <button
      className="text-foreground/80 hover:bg-secondary hover:text-brand-accent relative rounded-lg p-2 transition-colors"
      onClick={handleCartClick}
    >
      <ShoppingCart className="h-5 w-5" />
      {isAuthenticated && cartCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#e51636] text-[10px] font-bold text-white">
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      )}
    </button>
  );

  return (
    <header className="glass border-border fixed top-0 right-0 left-0 z-50 border-b bg-white/80 backdrop-blur-md">
      <div className="container-custom flex h-16 items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-[#052a5b]">PuzKit3D</span>
        </Link>

        {/* DESKTOP NAV LINKS */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-[#e51636] ${
                pathname === link.href ? 'text-[#e51636]' : 'text-slate-600'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ACTIONS */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Search */}
          <button className="text-foreground/80 hover:bg-secondary hidden rounded-lg p-2 transition-colors sm:block">
            <Search className="h-5 w-5" />
          </button>

          {/* HIỂN THỊ COIN (CHỈ HIỆN KHI ĐÃ LOGIN) */}
          {isAuthenticated && !isAuthLoading && (
            <Link
              href="/wallet"
              title="My PuzCoins"
              className="mr-1 flex items-center gap-1.5 rounded-full border border-amber-200/60 bg-amber-50 px-3 py-1.5 text-amber-600 shadow-sm transition-all hover:bg-amber-100"
            >
              <Coins className="h-4 w-4 drop-shadow-sm" />
              <span className="text-sm font-bold">
                {walletData?.balance ? walletData.balance.toLocaleString() : 0}
              </span>
            </Link>
          )}

          {/* User/Profile */}
          <Link
            href={isAuthenticated ? '/profile' : ROUTES.LOGIN}
            className={`flex items-center gap-2 rounded-lg p-2 transition-colors ${
              isAuthenticated
                ? 'bg-slate-100 text-[#052a5b]'
                : 'text-foreground/80 hover:bg-secondary'
            }`}
          >
            <User className="h-5 w-5" />
            {isAuthenticated && !isAuthLoading && user && (
              <span className="hidden text-xs font-semibold italic lg:block">
                {user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.email?.split('@')[0]}
              </span>
            )}
          </Link>

          {/* Cart */}
          {!isMiniCartDisabled && !isAuthLoading ? <MiniCart>{cartButton}</MiniCart> : cartButton}

          {/* Logout button */}
          {isAuthenticated && (
            <button
              onClick={() => handleLogout(false)}
              className="ml-1 hidden p-2 text-slate-500 transition-colors hover:text-red-600 sm:block"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="p-2 text-slate-600 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="space-y-4 border-t bg-white p-4 shadow-xl md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-medium text-slate-700"
            >
              {link.label}
            </Link>
          ))}
          {/* Menu Mobile cho nút Logout */}
          {isAuthenticated && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout(false);
              }}
              className="flex w-full items-center gap-2 text-base font-medium text-red-600"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          )}
        </div>
      )}
    </header>
  );
}

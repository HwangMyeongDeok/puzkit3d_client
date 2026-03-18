'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, Menu, X, Search, User, LogOut } from 'lucide-react';

import { ROUTES, APP_CONFIG } from '@/constants';
import MiniCart from '@/components/custom/MiniCart';
import { useGetCartQuery } from '@/lib/api/endpoints/cartApi';
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

  // 2. CHỐT CHẶN API: Chỉ gọi Cart khi Auth đã nạp xong (isAuthLoading === false)
  // và thực sự đã login (isAuthenticated === true)
  const { data: cartData } = useGetCartQuery(undefined, {
    skip: !mounted || isAuthLoading || !isAuthenticated,
  });

  const cartCount = useMemo(() => {
    if (!cartData?.items) return 0;
    return cartData.items.reduce((acc: number, item: CartItemDto) => acc + (item.quantity ?? 0), 0);
  }, [cartData]);

  const isMiniCartDisabled = MINI_CART_DISABLED_ROUTES.some((route) => pathname.startsWith(route));

  const handleCartClick = () => {
    // Nếu đang ở trang /cart hoặc /checkout thì bấm icon sẽ chuyển về trang /cart
    if (isMiniCartDisabled) {
      router.push(ROUTES.CART);
    }
    // Còn nếu ở trang khác thì cứ để MiniCart tự xổ ra bình thường
  };

  const handleLogout = () => {
    // 1. Xóa trong Redux
    dispatch(logout());

    // 2. Xóa trong LocalStorage
    localStorage.removeItem(APP_CONFIG.AUTH_STORAGE_KEY);

    // 3. Xóa Cookie bằng cách set expire về ngày hôm qua
    document.cookie = `${APP_CONFIG.ACCESS_TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    document.cookie = `${APP_CONFIG.REFRESH_TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

    toast.success('Đã đăng xuất!');
    router.push('/');
    router.refresh(); // Ép Next.js fetch lại trang để middleware nhận diện đã mất cookie
  };

  // 3. Tránh Hydration Mismatch: Không render gì cho đến khi Client-side mounted
  if (!mounted) return <div className="h-16 w-full bg-white shadow-sm" />;

  // Định nghĩa JSX cho cái nút giỏ hàng để lát tái sử dụng cho gọn
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
          <button className="text-foreground/80 hover:bg-secondary rounded-lg p-2 transition-colors">
            <Search className="h-5 w-5" />
          </button>

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
            {isAuthenticated && !isAuthLoading && (
              <span className="hidden text-xs font-semibold italic lg:block">
                {user?.email?.split('@')[0]}
              </span>
            )}
          </Link>

          {/* Cart Logic: Chỉ hiện MiniCart khi thực sự đã Auth xong */}
          {!isMiniCartDisabled && !isAuthLoading ? <MiniCart>{cartButton}</MiniCart> : cartButton}

          {/* Logout button */}
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="ml-1 p-2 text-slate-500 transition-colors hover:text-red-600"
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
        </div>
      )}
    </header>
  );
}

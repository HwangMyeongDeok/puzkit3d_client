'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, Menu, X, Search, User } from 'lucide-react';

import { useAppSelector } from '@/stores';
import { selectCartTotalQuantity } from '@/stores/slices/cartSlice';
import { ROUTES } from '@/constants';
import MiniCart from '@/components/custom/MiniCart';

const NAV_LINKS = [
  { href: ROUTES.HOME, label: 'Home' },
  { href: ROUTES.PRODUCTS, label: 'Shop All' },
  { href: ROUTES.BRANDS, label: 'Brands' },
  { href: '/custom-service', label: 'Custom Service' },
];

const MINI_CART_DISABLED_ROUTES = ['/cart', '/checkout'];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartCount = useAppSelector(selectCartTotalQuantity);
  const pathname = usePathname();
  const router = useRouter();

  const isMiniCartDisabled = MINI_CART_DISABLED_ROUTES.some((route) => pathname.startsWith(route));

  const cartButton = (
    <button
      className="text-foreground/80 hover:bg-secondary hover:text-brand-accent relative rounded-lg p-2 transition-colors"
      aria-label="Cart"
      onClick={isMiniCartDisabled ? () => router.push(ROUTES.CART) : undefined}
    >
      <ShoppingCart className="h-5 w-5" />
      {cartCount > 0 && (
        <span className="bg-accent text-accent-foreground absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold">
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      )}
    </button>
  );

  return (
    <header className="glass border-border fixed top-0 right-0 left-0 z-50 border-b">
      <div className="container-custom flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-heading text-brand text-xl font-bold">PuzKit3D</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-foreground/80 hover:text-brand text-sm font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href={ROUTES.PRODUCTS}
            className="text-foreground/80 hover:bg-secondary hover:text-brand-accent rounded-lg p-2 transition-colors"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Link>

          <Link
            href="/profile"
            className="text-foreground/80 hover:bg-secondary hover:text-brand-accent rounded-lg p-2 transition-colors"
            aria-label="Account"
          >
            <User className="h-5 w-5" />
          </Link>

          {isMiniCartDisabled ? cartButton : <MiniCart>{cartButton}</MiniCart>}

          <button
            className="text-foreground/80 hover:bg-secondary rounded-lg p-2 transition-colors md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="glass animate-slide-up border-border border-t md:hidden">
          <div className="container-custom flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-foreground/80 hover:bg-secondary hover:text-brand rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

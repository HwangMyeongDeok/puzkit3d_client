import Link from 'next/link';

const QUICK_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop All' },
  { href: '/brands', label: 'Brands' },
  { href: '/custom-service', label: 'Custom Service' },
  { href: '/contact', label: 'Contact' },
];

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-custom py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h3 className="mb-4 text-lg font-bold">PuzKit3D</h3>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Đặt mua mô hình lắp ráp 3D chất lượng cao. Đa dạng chất liệu: giấy, nhựa, gỗ, kim
              loại. Hỗ trợ đặt hàng nước ngoài và thiết kế theo yêu cầu.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold">Quick Links</h3>
            <ul className="flex flex-col gap-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold">Contact</h3>
            <ul className="text-primary-foreground/70 flex flex-col gap-2.5 text-sm">
              <li>
                <span className="text-primary-foreground/90 font-medium">Email:</span>{' '}
                hello@puzkit3d.vn
              </li>
              <li>
                <span className="text-primary-foreground/90 font-medium">Phone:</span> +84 123 456
                789
              </li>
              <li>
                <span className="text-primary-foreground/90 font-medium">Address:</span> Ho Chi Minh
                City, Vietnam
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-primary-foreground/10 border-t">
        <div className="container-custom flex items-center justify-center py-6">
          <p className="text-primary-foreground/50 text-xs">
            © {new Date().getFullYear()} PuzKit3D. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

import type { Metadata } from 'next';
import { Inter, Outfit, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';

import './globals.css';
import { ReduxProvider } from '@/providers/ReduxProvider';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
});

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'PuzKit3D - Mô hình Lắp ráp Trí tuệ 3D',
    template: '%s | PuzKit3D',
  },
  description:
    'Đặt mua mô hình lắp ráp 3D chất lượng cao. Đa dạng chất liệu: giấy, nhựa, gỗ, kim loại. Hỗ trợ đặt hàng nước ngoài và thiết kế theo yêu cầu.',
  keywords: ['mô hình 3D', 'lắp ráp', 'puzzle 3D', 'Gundam', 'model kit', 'PuzKit3D'],
  authors: [{ name: 'PuzKit3D Team' }],
  creator: 'PuzKit3D',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: 'PuzKit3D',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${outfit.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ReduxProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </ReduxProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import { Toaster } from 'sonner';

import './globals.css';
import { ReduxProvider } from '@/providers/ReduxProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AuthSyncProvider } from '@/lib/auth/AuthSyncProvider';

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

export const metadata: Metadata = {
  title: {
    default: 'PuzKit3D - 3D Intelligence Assembly Model',
    template: '%s | PuzKit3D',
  },
  description:
    'Order high-quality 3D assembly models. Various materials: paper, plastic, wood, metal. Support for international orders and custom designs.',
  keywords: ['3D model', 'assembly', 'puzzle 3D', 'Gundam', 'model kit', 'PuzKit3D'],
  authors: [{ name: 'PuzKit3D Team' }],
  creator: 'PuzKit3D',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'PuzKit3D',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${outfit.variable} min-h-screen bg-[#f4f8ff] font-sans text-slate-900 antialiased selection:bg-[#0f3c8a]/20 selection:text-[#0f2347]`}
      >
        <ReduxProvider>
          <AuthSyncProvider>
            <Header />

            <main className="relative min-h-screen overflow-x-hidden pt-16">
              <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.10),transparent_22%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.08),transparent_20%),linear-gradient(180deg,#f8fbff_0%,#f4f8ff_45%,#eef5ff_100%)]" />
              {children}
            </main>

            <Footer />
            <Toaster position="top-right" richColors closeButton />
          </AuthSyncProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}

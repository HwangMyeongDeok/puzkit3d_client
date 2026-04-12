'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, Phone, Mail, MapPin, Package, Star } from 'lucide-react';

import PartnerProductCard from '@/components/custom/PartnerProductCard';
import { useGetPartnerBySlugQuery } from '@/lib/api/endpoints/partnerApi';
import { useGetPartnerProductsQuery } from '@/lib/api/endpoints/partnerProductApi';
import { useGetImportServiceConfigsSelectQuery } from '@/lib/api/endpoints/importServiceConfigApi';

function getPartnerAvatar(name?: string) {
  const safeName = encodeURIComponent(name || 'Partner Shop');
  return `https://ui-avatars.com/api/?name=${safeName}&background=ffffff&color=0f2a5f&size=180&bold=true`;
}

function getWatermarkFontSize(name?: string) {
  const length = (name || 'PARTNER').trim().length;

  if (length >= 14) return 'clamp(48px, 8vw, 150px)';
  if (length >= 10) return 'clamp(60px, 10vw, 200px)';
  return 'clamp(72px, 13vw, 260px)';
}

export default function PartnerBrandPage() {
  const params = useParams<{ partnerSlug: string }>();
  const partnerSlug = params.partnerSlug;

  const { data: partner, isLoading: isPartnerLoading } = useGetPartnerBySlugQuery(partnerSlug);
  const { data: productsResponse, isLoading: isProductsLoading } = useGetPartnerProductsQuery({
    pageNumber: 1,
    pageSize: 100,
    ascending: true,
  });
  const { data: configResponse } = useGetImportServiceConfigsSelectQuery();

  const importConfig = configResponse?.find((item) => item.id === partner?.importServiceConfigId);
  const allProducts = productsResponse?.items ?? [];

  const products = useMemo(() => {
    if (!partner?.id) return [];
    return allProducts.filter((item) => item.partnerId === partner.id);
  }, [allProducts, partner?.id]);

  const watermarkText = (partner?.name || 'PARTNER').toUpperCase();
  const watermarkFontSize = getWatermarkFontSize(partner?.name);

  const totalProducts = products.length;

  if (isPartnerLoading || isProductsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white">
      <section className="sticky top-0 z-0 flex h-[105vh] w-full items-center justify-center overflow-hidden bg-[#020617] text-white">
        <div className="absolute inset-0">
          <div className="absolute -left-[10%] -top-[10%] h-[80%] w-[80%] rounded-full bg-blue-600/30 blur-[120px]" />
          <div className="absolute -right-[5%] top-[10%] h-[70%] w-[70%] rounded-full bg-purple-600/25 blur-[100px]" />
          <div className="absolute bottom-0 left-[20%] h-[50%] w-[60%] rounded-full bg-cyan-500/20 blur-[110px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
        </div>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 md:px-8">
          <span
            className="block max-w-[92vw] whitespace-nowrap text-center font-black uppercase text-white/[0.04]"
            style={{
              fontSize: watermarkFontSize,
              letterSpacing: '-0.08em',
              lineHeight: 0.85,
            }}
          >
            {watermarkText}
          </span>
        </div>

        <div className="relative z-10 flex flex-col items-center px-4 text-center">
          <div className="relative mb-6 h-32 w-32 transition-transform duration-500 hover:scale-105 md:h-40 md:w-40">
            <div className="absolute inset-0 animate-pulse rounded-full bg-blue-500/20 blur-2xl" />
            <div className="relative h-full w-full overflow-hidden rounded-full border-4 border-white/10 bg-white">
              <img
                src={getPartnerAvatar(partner?.name)}
                alt={partner?.name}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-300">
              <Star className="h-3 w-3 fill-current" />
              Verified Partner
            </div>

            <h1 className="bg-gradient-to-b from-white to-white/50 bg-clip-text text-6xl font-black leading-none tracking-tight text-transparent md:text-8xl">
              {partner?.name}
            </h1>

            <div className="mt-6 flex flex-col items-center gap-3">
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-white/90">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <Phone className="h-4 w-4 text-blue-400" />
                  <span>0192391923</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold">
                  <Mail className="h-4 w-4 text-blue-400" />
                  <span>mizuno@gmail.com</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-white/40">
                <MapPin className="h-3.5 w-3.5 text-blue-400" />
                <span>35 united kingdom</span>
              </div>
            </div>
          </div>

          <div className="mt-12 flex gap-4">
            <div className="min-w-[100px] rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <p className="text-xl font-bold text-white">{totalProducts}</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">
                Products
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-24 min-h-screen">
        <div className="mx-auto max-w-7xl rounded-t-[60px] bg-white px-4 pb-24 pt-20 lg:px-8">
          <div className="mb-16 flex flex-col items-center text-center">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 md:text-5xl">
              Collection
            </h2>
            <div className="mt-4 h-1.5 w-16 rounded-full bg-blue-600" />
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center py-24 text-slate-400">
              <Package className="mb-4 h-16 w-16 opacity-10" />
              <p className="text-xs font-bold uppercase tracking-widest">
                No products currently available
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <div key={product.id} className="transition-transform duration-300 hover:-translate-y-2">
                  <PartnerProductCard
                    product={product}
                    partnerName={partner?.name}
                    partnerSlug={partner?.slug}
                    countryName={importConfig?.countryName}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
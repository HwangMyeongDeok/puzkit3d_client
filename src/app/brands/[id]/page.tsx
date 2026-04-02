'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { FileText, ShoppingCart, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

import { formatPrice } from '@/lib/utils';
import { useGetPartnerProductByIdQuery } from '@/lib/api/endpoints/partnerProductApi';
import { useGetPartnersQuery } from '@/lib/api/endpoints/partnerApi';
import { useAddItemToPartnerCartMutation } from '@/lib/api/endpoints/partnerCartApi';

export default function PartnerProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const {
    data: product,
    isLoading,
    isError,
    error: productError,
  } = useGetPartnerProductByIdQuery(id, {
    skip: !id,
  });

  const { data: partnerResponse } = useGetPartnersQuery(
    {
      pageNumber: 1,
      pageSize: 100,
    },
    {
      skip: !product?.partnerId,
    }
  );

  const [addItemToPartnerCart, { isLoading: isAddingToCart }] = useAddItemToPartnerCartMutation();

  const partnerName = useMemo(() => {
    if (!product?.partnerId) return '';
    const partners = partnerResponse?.items ?? [];
    return partners.find((item) => item.id === product.partnerId)?.name ?? '';
  }, [partnerResponse?.items, product?.partnerId]);

  const gallery = useMemo(() => {
    if (!product) return [];
    return product.previewImages?.length ? product.previewImages : [product.thumbnailUrl];
  }, [product]);

  const [selectedImage, setSelectedImage] = useState(0);

  async function handleAddToCart() {
    if (!product?.id) return;

    try {
      await addItemToPartnerCart({
        itemId: product.id,
        quantity: 1,
      }).unwrap();

      toast.success(`Added "${product.name}" to cart`);
      window.dispatchEvent(new Event('open-mini-cart'));
    } catch (error) {
      console.error('Add partner product to cart failed:', error);
      toast.error('Failed to add partner product to cart');
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="text-sm">Loading product...</div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Failed to load product detail.
          <pre className="mt-3 text-xs whitespace-pre-wrap">
            {JSON.stringify(productError, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  const activeImage = gallery[selectedImage] || product.thumbnailUrl;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <Link href="/" className="hover:text-slate-900">
                Home
              </Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/brands" className="hover:text-slate-900">
                Partner Products
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-slate-900">{product.name}</span>
            </nav>

            <div className="relative h-[420px] overflow-hidden rounded-3xl border bg-white shadow-sm md:h-[520px]">
              <Image
                src={activeImage}
                alt={product.name}
                fill
                priority
                className="object-contain p-4"
              />
            </div>

            {gallery.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {gallery.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-24 overflow-hidden rounded-2xl border bg-white ${
                      selectedImage === index ? 'ring-2 ring-amber-500' : ''
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} preview ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
              Partner Product
            </span>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
              {product.name}
            </h1>

            {partnerName ? (
              <p className="mt-2 text-sm font-semibold tracking-wide text-slate-500 uppercase">
                {partnerName}
              </p>
            ) : null}

            <div className="mt-5 text-3xl font-extrabold text-rose-600">
              {formatPrice(product.referencePrice)}
            </div>

            <p className="mt-2 text-sm text-slate-500">Estimated partner product price</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ShoppingCart className="h-4 w-4" />
                {isAddingToCart ? 'Adding...' : 'Add to Cart'}
              </button>

              <button
                type="button"
                onClick={() => toast.success(`Requested quote for "${product.name}"`)}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <FileText className="h-4 w-4" />
                Request Quote
              </button>
            </div>

            <div className="mt-8">
              <h2 className="mb-2 text-sm font-bold tracking-wide text-slate-500 uppercase">
                Product Description
              </h2>
              <p className="text-sm leading-7 whitespace-pre-line text-slate-600">
                {product.description || 'No description available'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

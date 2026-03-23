'use client';

import { Loader2, Check, Ruler } from 'lucide-react';
import type { ProductVariantDto } from '@/types';
import { useGetProductVariantsQuery } from '@/lib/api/endpoints/productApi';

interface ProductVariantsProps {
  productId: string;
  selectedVariantId?: string;
  onVariantSelect?: (variant: ProductVariantDto | null) => void;
}

export default function ProductVariants({
  productId,
  selectedVariantId,
  onVariantSelect,
}: ProductVariantsProps) {
  const { data, isLoading, isError } = useGetProductVariantsQuery(productId, {
    skip: !productId,
  });

  const variants = data?.variants ?? [];

  // XÓA BỎ useState ở đây, dùng luôn selectedVariantId từ props!

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4">
        <Loader2 className="text-brand h-5 w-5 animate-spin" />
        <span className="text-muted-foreground text-sm">Loading variants...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-destructive py-4 text-sm">Failed to load variants. Please try again.</p>
    );
  }

  if (variants.length === 0) {
    return <p className="text-muted-foreground py-4 text-sm">This product has no variants yet.</p>;
  }

  const activeVariants = variants.filter((v) => v.isActive);

  // Lọc ra cái Variant đang được chọn dựa theo ID của Cha truyền xuống
  const currentSelectedVariant = activeVariants.find((v) => v.id === selectedVariantId);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-foreground text-sm font-semibold">
        Select Variant ({activeVariants.length})
      </h3>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {activeVariants.map((variant) => {
          // Check xem ID có trùng với ID Cha truyền xuống không
          const isSelected = selectedVariantId === variant.id;

          return (
            <button
              key={variant.id}
              onClick={() => {
                // Chỉ cần báo lên cho Cha biết là tui vừa bị click
                onVariantSelect?.(variant);
              }}
              className={`relative flex flex-col gap-2 rounded-xl border-2 p-4 text-left transition-all ${
                isSelected
                  ? 'border-brand bg-brand/5 ring-brand/20 ring-2'
                  : 'border-border hover:border-brand/40 cursor-pointer'
              }`}
            >
              {/* Selected indicator */}
              {isSelected && (
                <span className="bg-brand text-brand-foreground absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full">
                  <Check className="h-3 w-3" />
                </span>
              )}

              {/* SKU */}
              <span className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
                SKU: {variant.sku}
              </span>

              {/* Color */}
              <div className="flex items-center gap-2">
                <span className="bg-brand/10 text-brand rounded-full px-2.5 py-0.5 text-xs font-bold">
                  {variant.color}
                </span>
              </div>

              {/* Dimensions */}
              <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Ruler className="h-3 w-3" />
                <span>
                  {variant.assembledLengthMm} × {variant.assembledWidthMm} ×{' '}
                  {variant.assembledHeightMm} mm
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected summary */}
      {currentSelectedVariant && (
        <div className="bg-brand/5 border-brand/20 rounded-xl border px-4 py-3">
          <p className="text-foreground text-sm font-semibold">
            Selected: {currentSelectedVariant.sku}
          </p>
          <p className="text-muted-foreground text-xs">
            Color: {currentSelectedVariant.color} · Dimensions:{' '}
            {currentSelectedVariant.assembledLengthMm} × {currentSelectedVariant.assembledWidthMm} ×{' '}
            {currentSelectedVariant.assembledHeightMm} mm
          </p>
        </div>
      )}
    </div>
  );
}

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { CartItemDto } from '@/types/api/cart.api.types';

interface CartItemRowProps {
  item: CartItemDto;
  isChecked: boolean;
  onToggle: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

export default function CartItemRow({
  item,
  isChecked,
  onToggle,
  onIncrement,
  onDecrement,
  onRemove,
}: CartItemRowProps) {
  // Xử lý logic hiển thị tên biến thể (variant) cho gọn
  const variantDisplay = item.variantName || item.color;

  return (
    <div
      className={`border-border bg-card flex flex-col gap-4 rounded-xl border p-4 transition-all hover:shadow-md sm:flex-row ${
        isChecked ? 'ring-primary/20 bg-primary/5 ring-1' : ''
      }`}
    >
      {/* KHỐI TRÊN (Mobile) / BÊN TRÁI (Desktop): Checkbox + Hình ảnh */}
      <div className="flex items-center gap-4 sm:items-start">
        {/* 1. Checkbox */}
        <div className="flex shrink-0 items-center justify-center pt-0 sm:pt-1">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={onToggle}
            className="border-border text-primary accent-primary h-5 w-5 cursor-pointer rounded transition-all focus:ring-0"
            aria-label={`Select ${item.name}`}
          />
        </div>

        {/* 2. Image */}
        <Link
          href={`/shop/${item.slug}`}
          className="border-border bg-muted relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border transition-opacity hover:opacity-80 sm:h-24 sm:w-24"
        >
          <Image
            src={item.thumbnailUrl}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 80px, 96px"
            className="object-cover"
          />
        </Link>
      </div>

      {/* 3. Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            {/* Tên sản phẩm */}
            <Link href={`/shop/${item.slug}`}>
              <h4 className="text-card-foreground hover:text-primary line-clamp-2 cursor-pointer text-sm font-semibold transition-colors sm:text-base">
                {item.name}
              </h4>
            </Link>

            {/* Hiển thị Variant / SKU */}
            <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-1.5 text-xs">
              {variantDisplay && (
                <span className="bg-secondary text-secondary-foreground rounded-md px-2 py-0.5 font-medium">
                  {variantDisplay}
                </span>
              )}
              {item.sku && <span className="opacity-70">SKU: {item.sku}</span>}
            </div>

            {/* Giá 1 sản phẩm (Ẩn ở mobile vì có tổng tiền bên dưới, hiện ở Desktop) */}
            <p className="text-muted-foreground mt-2 hidden text-sm font-medium sm:block">
              {formatPrice(item.unitPrice)} <span className="text-xs opacity-60">/ item</span>
            </p>
          </div>

          {/* Nút Xóa (Đẩy lên góc phải ở Desktop) */}
          <button
            onClick={onRemove}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive shrink-0 rounded-md p-2 transition-colors"
            aria-label="Remove item"
          >
            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* Controller Số lượng & Tổng tiền của Item */}
        <div className="mt-4 flex items-center justify-between sm:mt-auto">
          {/* Box chọn số lượng */}
          <div className="border-border bg-background flex h-9 items-center overflow-hidden rounded-md border shadow-sm">
            <button
              onClick={onDecrement}
              disabled={item.quantity <= 1}
              className="text-foreground/70 hover:bg-muted flex h-full w-9 cursor-pointer items-center justify-center transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>

            <span className="border-border flex h-full w-12 items-center justify-center border-x text-sm font-bold">
              {item.quantity}
            </span>

            <button
              onClick={onIncrement}
              className="text-foreground/70 hover:bg-muted flex h-full w-9 cursor-pointer items-center justify-center transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Tổng tiền của Item (Price * Quantity) */}
          <div className="flex flex-col items-end">
            <span className="text-primary text-base font-bold sm:text-lg">
              {formatPrice(item.totalPrice)}
            </span>
            {/* Hiện giá đơn vị ở mobile thay cho phần bị ẩn ở trên */}
            <span className="text-muted-foreground text-[10px] sm:hidden">
              {formatPrice(item.unitPrice)} / item
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

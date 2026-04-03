'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';

interface CartItemCheckboxProps {
  isChecked: boolean;
  onToggle: () => void;
  itemName: string;
}

export function CartItemCheckbox({ isChecked, onToggle, itemName }: CartItemCheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={isChecked}
      onChange={onToggle}
      className="border-border text-primary accent-primary h-5 w-5 cursor-pointer rounded transition-all focus:ring-0"
      aria-label={`Select ${itemName}`}
    />
  );
}

interface CartItemQuantityControlsProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function CartItemQuantityControls({
  quantity,
  onIncrement,
  onDecrement,
}: CartItemQuantityControlsProps) {
  return (
    <div className="border-border bg-background flex h-9 items-center overflow-hidden rounded-md border shadow-sm">
      <button
        onClick={onDecrement}
        disabled={quantity <= 1}
        className="text-foreground/70 hover:bg-muted flex h-full w-9 cursor-pointer items-center justify-center transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Decrease quantity"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>

      <span className="border-border flex h-full w-12 items-center justify-center border-x text-sm font-bold">
        {quantity}
      </span>

      <button
        onClick={onIncrement}
        className="text-foreground/70 hover:bg-muted flex h-full w-9 cursor-pointer items-center justify-center transition-colors"
        aria-label="Increase quantity"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

interface CartItemDeleteButtonProps {
  onRemove: () => void;
}

export function CartItemDeleteButton({ onRemove }: CartItemDeleteButtonProps) {
  return (
    <button
      onClick={onRemove}
      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive shrink-0 rounded-md p-2 transition-colors"
      aria-label="Remove item"
    >
      <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
    </button>
  );
}

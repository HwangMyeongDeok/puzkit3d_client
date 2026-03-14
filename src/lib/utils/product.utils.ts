import type { InstockProduct, InstockProductVariantWithDetails } from '@/types';

export function getDefaultVariant(product: InstockProduct): InstockProductVariantWithDetails {
  return product.variants[0];
}

export function getProductPrice(product: InstockProduct): number {
  return getDefaultVariant(product).priceDetail.unitPrice;
}

export function isProductInStock(product: InstockProduct): boolean {
  return product.variants.some((v) => v.inventory.totalQuantity > 0);
}

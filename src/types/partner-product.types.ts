export interface PartnerProductListItem {
  id: string;
  partnerId: string;
  name: string;
  referencePrice: number;
  thumbnailUrl: string;
  slug: string;
  description: string | null;
}

export interface PartnerProductDetail {
  id: string;
  partnerId: string;
  name: string;
  referencePrice: number;
  thumbnailUrl: string;
  previewImages: string[];
  slug: string;
  description: string | null;
}

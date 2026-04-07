export type CustomDesignRequestType = 'Idea' | 'Sketch';

export type CustomDesignRequestStatus =
  | 'Submitted'
  | 'MissingInformation'
  | 'Approved'
  | 'Completed'
  | 'Rejected'
  | 'Cancelled'
  | 'Expired';

export interface CreateCustomDesignRequestDto {
  type: string;
  customDesignRequirementId?: string | null;
  desiredLengthMm: number;
  desiredWidthMm: number;
  desiredHeightMm: number;
  sketches: string[];
  customerPrompt: string;
  desiredDeliveryDate: string;
  desiredQuantity: number;
  targetBudget: number;
}

export interface UpdateCustomDesignRequestDto {
  desiredLengthMm?: number;
  desiredWidthMm?: number;
  desiredHeightMm?: number;
  sketches?: string[];
  customerPrompt?: string;
  desiredDeliveryDate?: string;
  desiredQuantity?: number;
  targetBudget?: number;
  status?: CustomDesignRequestStatus;
  note?: string;
}

export interface CustomDesignRequestDto {
  id: string;
  code: string;
  customerId: string;
  type: CustomDesignRequestType;
  status: CustomDesignRequestStatus;
  customDesignRequirementId?: string | null;
  desiredLengthMm: number;
  desiredWidthMm: number;
  desiredHeightMm: number;
  sketchesUrls: string[];
  customerPrompt: string;
  desiredDeliveryDate: string;
  desiredQuantity: number;
  targetBudget: number;
  note?: string | null;
  usedSupportConceptDesignTime: number;
  createdAt: string;
  updatedAt?: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export type CustomDesignAssetStatus =
  | 'ImageProcessing'
  | 'RoughModelGenerating'
  | 'Completed'
  | 'Failed';

export interface CustomDesignAsset {
  id: string;
  code: string;
  version: number;
  status: CustomDesignAssetStatus | string;
  multiviewImages: string[];
  compositeMultiviewImage?: string;
  rough3DModel?: string;
  rough3DModelTaskId?: string;
  customerPrompt?: string;
  normalizePrompt?: string;
  isNeedSupport: boolean;
  isFinalDesign: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssetPayload {
  requestId: string;
  customerPrompt: string;
}

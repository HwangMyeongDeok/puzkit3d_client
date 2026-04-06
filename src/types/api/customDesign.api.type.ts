export type CustomDesignRequestType = 'Idea' | 'Sketch';

export type CustomDesignRequestStatus =
  | 'Submitted'
  | 'MissingInformation'
  | 'Approved'
  | 'Processing'
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

export interface UpdateCustomDesignRequestDto extends Partial<CreateCustomDesignRequestDto> {
  status?: CustomDesignRequestStatus;
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
  sketches: string[];
  customerPrompt: string;
  staffNote?: string | null;
  desiredDeliveryDate: string;
  desiredQuantity: number;
  targetBudget: number;
  createdAt: string;
  updatedAt?: string | null;
}

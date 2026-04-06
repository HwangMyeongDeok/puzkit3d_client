export interface CustomDesignRequirement {
  id: string;
  code: string;
  topicId: string;
  materialId: string;
  assemblyMethodId: string;
  difficulty: 'Basic' | 'Intermediate' | 'Advanced' | string;
  minPartQuantity: number;
  maxPartQuantity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  capabilityIds: string[];
}

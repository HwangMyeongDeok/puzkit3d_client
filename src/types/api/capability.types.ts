export interface CapabilityDto {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface GetCapabilitiesRequest {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  isActive?: boolean;
}

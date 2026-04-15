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
  ascending: boolean;
  isActive?: boolean;
}

export interface MaterialDto {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface GetMaterialsRequest {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  ascending: boolean;
  isActive?: boolean;
}

export interface TopicDto {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface GetTopicsRequest {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  ascending: boolean;
  isActive?: boolean;
}

export interface AssemblyMethodDto {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface GetAssemblyMethodsRequest {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  ascending: boolean;
  isActive?: boolean;
}

import { apiSlice } from '../apiSlice';

export interface PartnerDto {
  id: string;
  importServiceConfigId: string;
  name: string;
  description: string | null;
  contactEmail: string;
  contactPhone: string;
  address: string;
  slug: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetPartnersResponse {
  items: PartnerDto[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface GetPartnersParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  ascending?: boolean;
}

export const partnerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPartners: builder.query<GetPartnersResponse, GetPartnersParams | void>({
      query: (params) => ({
        url: '/partners',
        method: 'GET',
        params: {
          pageNumber: params?.pageNumber ?? 1,
          pageSize: params?.pageSize ?? 100,
          searchTerm: params?.searchTerm || undefined,
          ascending: params?.ascending ?? true,
        },
      }),
      providesTags: ['Product'],
    }),
  }),
});

export const { useGetPartnersQuery } = partnerApi;

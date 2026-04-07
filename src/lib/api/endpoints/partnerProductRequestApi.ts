import { apiSlice } from '../apiSlice';

export interface CreatePartnerProductRequestItem {
  partnerProductId: string;
  quantity: number;
}

export interface CreatePartnerProductRequestBody {
  partnerId: string;
  desiredDeliveryDate: string;
  items: CreatePartnerProductRequestItem[];
}

export interface PartnerProductRequestItemDetail {
  id: string;
  partnerProductId: string;
  quantity: number;
  referencePrice?: number | null;
  referenceTotalAmount?: number | null;
}

export interface PartnerProductRequestListItem {
  id: string;
  code: string;
  partnerId: string;
  totalRequestedQuantity?: number;
  note?: string | null;
  status?: number | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PartnerProductRequestDetail extends PartnerProductRequestListItem {
  customerId?: string;
  details: PartnerProductRequestItemDetail[];
}

export interface PartnerProductRequestResponse {
  id?: string;
  partnerId: string;
  desiredDeliveryDate: string;
  items: CreatePartnerProductRequestItem[];
  status?: string | number;
}

export type PartnerProductRequestListParams = Record<string, unknown> & {
  status?: number;
  searchTerm?: string;
  ascending: boolean;
  pageNumber: number;
  pageSize: number;
};

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export const partnerProductRequestApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createPartnerProductRequest: builder.mutation<
      PartnerProductRequestResponse,
      CreatePartnerProductRequestBody
    >({
      query: (data) => ({
        url: '/partner-product-requests',
        method: 'POST',
        data,
      }),
    }),

    getMyPartnerProductRequests: builder.query<
      PaginatedResponse<PartnerProductRequestListItem>,
      PartnerProductRequestListParams
    >({
      query: (params) => ({
        url: '/partner-product-requests/my-requests',
        method: 'GET',
        params,
      }),
    }),

    getPartnerProductRequestById: builder.query<PartnerProductRequestListItem, string>({
      query: (id) => ({
        url: `/partner-product-requests/${id}`,
        method: 'GET',
      }),
    }),

    getPartnerProductRequestDetail: builder.query<PartnerProductRequestDetail, string>({
      query: (id) => ({
        url: `/partner-product-requests/${id}/detail`,
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useCreatePartnerProductRequestMutation,
  useGetMyPartnerProductRequestsQuery,
  useGetPartnerProductRequestByIdQuery,
  useGetPartnerProductRequestDetailQuery,
} = partnerProductRequestApi;

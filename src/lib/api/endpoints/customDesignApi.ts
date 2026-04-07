import apiSlice from '@/lib/api/apiSlice';
import {
  CreateCustomDesignRequestDto,
  CustomDesignRequestDto,
  PaginatedResponse,
  UpdateCustomDesignRequestDto,
  // Bác nhớ thêm 2 cái Type này vào file customDesign.api.type.ts nhé
  CustomDesignAsset,
  CreateAssetPayload,
} from '@/types/api/customDesign.api.type';

export interface GetCustomDesignRequestsParams {
  pageNumber?: number;
  pageSize?: number;
  status?: string;
}

export const customDesignRequestApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCustomDesignRequests: builder.query<
      PaginatedResponse<CustomDesignRequestDto>,
      GetCustomDesignRequestsParams | void
    >({
      query: (params) => ({
        url: `/custom-design-requests`,
        method: 'GET',
        params: (params ?? {}) as Record<string, unknown>,
      }),
      providesTags: ['CustomDesignRequest'],
    }),

    getCustomDesignRequestById: builder.query<CustomDesignRequestDto, string>({
      query: (id) => ({
        url: `/custom-design-requests/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'CustomDesignRequest', id }],
    }),

    createCustomDesignRequest: builder.mutation<string, CreateCustomDesignRequestDto>({
      query: (body) => ({
        url: `/custom-design-requests`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['CustomDesignRequest'],
    }),

    updateCustomDesignRequest: builder.mutation<
      void,
      { id: string; data: UpdateCustomDesignRequestDto }
    >({
      query: ({ id, data }) => ({
        url: `/custom-design-requests/${id}`,
        method: 'PUT',
        data: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'CustomDesignRequest', id },
        'CustomDesignRequest',
      ],
    }),

    deleteCustomDesignRequest: builder.mutation<void, string>({
      query: (id) => ({
        url: `/custom-design-requests/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CustomDesignRequest'],
    }),

    getCustomDesignAssetsByRequestId: builder.query<CustomDesignAsset[], string>({
      query: (requestId) => ({
        url: `/custom-design-requests/${requestId}/custom-design-assets`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'CustomDesignAsset', id }],
    }),

    createCustomDesignAsset: builder.mutation<CustomDesignAsset, CreateAssetPayload>({
      query: (body) => ({
        url: `/custom-design-assets`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'CustomDesignAsset', id: arg.requestId },
        { type: 'CustomDesignRequest', id: arg.requestId },
      ],
    }),
  }),
});

export const {
  useGetCustomDesignRequestsQuery,
  useGetCustomDesignRequestByIdQuery,
  useCreateCustomDesignRequestMutation,
  useUpdateCustomDesignRequestMutation,
  useDeleteCustomDesignRequestMutation,
  useGetCustomDesignAssetsByRequestIdQuery,
  useCreateCustomDesignAssetMutation,
} = customDesignRequestApi;

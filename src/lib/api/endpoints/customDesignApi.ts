import apiSlice from '@/lib/api/apiSlice';
import {
  CreateCustomDesignRequestDto,
  CustomDesignRequestDto,
  UpdateCustomDesignRequestDto,
} from '@/types/api/customDesign.api.type';

export const customDesignRequestApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCustomDesignRequests: builder.query<CustomDesignRequestDto[], void>({
      query: () => ({
        url: `/custom-design-requests`,
        method: 'GET',
      }),
      providesTags: ['CustomDesignRequest'], // Gắn tag để tự động invalidate cache
    }),

    // GET: Lấy chi tiết 1 Request
    getCustomDesignRequestById: builder.query<CustomDesignRequestDto, string>({
      query: (id) => ({
        url: `/custom-design-requests/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'CustomDesignRequest', id }],
    }),

    // POST: Tạo mới
    createCustomDesignRequest: builder.mutation<string, CreateCustomDesignRequestDto>({
      query: (body) => ({
        url: `/custom-design-requests`,
        method: 'POST',
        data: body, // Hoặc `body: body` tùy cách ông setup custom Axios adapter trong apiSlice
      }),
      invalidatesTags: ['CustomDesignRequest'], // Bấm tạo xong thì tự load lại GET list
    }),

    // PUT: Cập nhật (Dùng khi MissingInformation hoặc khách chủ động Cancel)
    updateCustomDesignRequest: builder.mutation<
      void,
      { id: string; data: UpdateCustomDesignRequestDto }
    >({
      query: ({ id, data }) => ({
        url: `/custom-design-requests/${id}`,
        method: 'PUT',
        data: data, // Hoặc `body: data`
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'CustomDesignRequest', id },
        'CustomDesignRequest',
      ],
    }),

    // DELETE: Xóa (Nếu cần)
    deleteCustomDesignRequest: builder.mutation<void, string>({
      query: (id) => ({
        url: `/custom-design-requests/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CustomDesignRequest'],
    }),
  }),
});

export const {
  useGetCustomDesignRequestsQuery,
  useGetCustomDesignRequestByIdQuery,
  useCreateCustomDesignRequestMutation,
  useUpdateCustomDesignRequestMutation,
  useDeleteCustomDesignRequestMutation,
} = customDesignRequestApi;

import { CapabilityDto, GetCapabilitiesRequest } from '@/types/api/capability.types';
import apiSlice from '../apiSlice';
import { PagedResultDto } from '@/types';

export const metaDataApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCapabilities: builder.query<PagedResultDto<CapabilityDto>, GetCapabilitiesRequest>({
      query: (params) => ({
        url: '/capabilities',
        method: 'GET',
        params: params as Record<string, unknown>,
      }),
      providesTags: ['Capability'],
    }),

    getMaterials: builder.query<PagedResultDto<any>, any>({
      query: (params) => ({
        url: '/materials',
        method: 'GET',
        params,
      }),
    }),

    getTopics: builder.query<PagedResultDto<any>, any>({
      query: (params) => ({
        url: '/topics',
        method: 'GET',
        params,
      }),
    }),

    getAssemblyMethods: builder.query<PagedResultDto<any>, any>({
      query: (params) => ({
        url: '/assembly-methods',
        method: 'GET',
        params,
      }),
    }),

    getCapabilityById: builder.query<CapabilityDto, string>({
      query: (id) => ({
        url: `/capabilities/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Capability', id }],
    }),

    getMaterialById: builder.query<any, string>({
      query: (id) => ({
        url: `/materials/${id}`,
        method: 'GET',
      }),
    }),

    getTopicById: builder.query<any, string>({
      query: (id) => ({
        url: `/topics/${id}`,
        method: 'GET',
      }),
    }),

    getAssemblyMethodById: builder.query<any, string>({
      query: (id) => ({
        url: `/assembly-methods/${id}`,
        method: 'GET',
      }),
    }),
  }),
});

// Export đầy đủ các hook để xài bên Component
export const {
  // Hooks List
  useGetCapabilitiesQuery,
  useGetMaterialsQuery,
  useGetTopicsQuery,
  useGetAssemblyMethodsQuery,

  // Hooks By ID (Dùng cho ProductDetailPage)
  useGetCapabilityByIdQuery,
  useGetMaterialByIdQuery,
  useGetTopicByIdQuery,
  useGetAssemblyMethodByIdQuery,
} = metaDataApi;

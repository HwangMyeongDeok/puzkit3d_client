import {
  AssemblyMethodDto,
  CapabilityDto,
  GetAssemblyMethodsRequest,
  GetCapabilitiesRequest,
  GetMaterialsRequest,
  GetTopicsRequest,
  MaterialDto,
  TopicDto,
} from '@/types/api/catalog.types';
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

    getMaterials: builder.query<PagedResultDto<MaterialDto>, GetMaterialsRequest>({
      query: (params) => ({
        url: '/materials',
        method: 'GET',
        params: params as Record<string, unknown>,
      }),
    }),

    getTopics: builder.query<PagedResultDto<TopicDto>, GetTopicsRequest>({
      query: (params) => ({
        url: '/topics',
        method: 'GET',
        params: params as Record<string, unknown>,
      }),
    }),

    getAssemblyMethods: builder.query<PagedResultDto<AssemblyMethodDto>, GetAssemblyMethodsRequest>(
      {
        query: (params) => ({
          url: '/assembly-methods',
          method: 'GET',
          params: params as Record<string, unknown>,
        }),
      }
    ),

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

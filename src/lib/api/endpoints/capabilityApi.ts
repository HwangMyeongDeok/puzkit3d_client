// Thêm đoạn này vào chỗ injectEndpoints của ông

import { CapabilityDto, GetCapabilitiesRequest } from '@/types/api/capability.types';
import apiSlice from '../apiSlice';
import { PagedResultDto } from '@/types';

export const capabilityApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCapabilities: builder.query<PagedResultDto<CapabilityDto>, GetCapabilitiesRequest>({
      query: (params) => ({
        url: '/capabilities',
        method: 'GET',
        params: params as Record<string, unknown>,
      }),
      providesTags: ['Capability'], // Khai báo tag để mốt thêm/xóa thì nó tự refetch
    }),
  }),
});

export const { useGetCapabilitiesQuery } = capabilityApi;

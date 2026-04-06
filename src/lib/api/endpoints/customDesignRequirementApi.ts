import apiSlice from '@/lib/api/apiSlice';
import { type CustomDesignRequirement } from '@/types/api/requirement.api.type';

export const requirementApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCustomDesignRequirements: builder.query<CustomDesignRequirement[], void>({
      query: () => ({
        url: `/custom-design-requirements`,
        method: 'GET',
      }),
      providesTags: ['CustomDesignRequirement'],
    }),
  }),
});

export const { useGetCustomDesignRequirementsQuery } = requirementApi;

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

    getCustomDesignRequirementById: builder.query<CustomDesignRequirement, string>({
      query: (id) => ({
        url: `/custom-design-requirements/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'CustomDesignRequirement', id }],
    }),
  }),
});

export const { useGetCustomDesignRequirementsQuery, useGetCustomDesignRequirementByIdQuery } =
  requirementApi;

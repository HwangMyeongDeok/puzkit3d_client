import { apiSlice } from '../apiSlice';

export interface ImportServiceConfigSelectItem {
  id: string;
  countryName: string;
  countryCode: string;
}

export const importServiceConfigApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getImportServiceConfigsSelect: builder.query<ImportServiceConfigSelectItem[], void>({
      query: () => ({
        url: '/import-service-configs/select',
        method: 'GET',
      }),
      providesTags: ['Product'],
    }),
  }),
});

export const { useGetImportServiceConfigsSelectQuery } = importServiceConfigApi;

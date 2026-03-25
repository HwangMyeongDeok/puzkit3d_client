import apiSlice from '../apiSlice';

export const uploadApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPresignedUrl: builder.mutation<
      { presignedUrl: string; path: string },
      { contentType: string; folder: string; fileName: string; path?: string }
    >({
      query: (body) => ({
        url: '/uploads/presigned-url',
        method: 'POST',
        data: body,
      }),
    }),
  }),
});

export const { useGetPresignedUrlMutation } = uploadApi;

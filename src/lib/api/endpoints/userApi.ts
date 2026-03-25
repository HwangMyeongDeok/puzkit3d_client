import { apiSlice } from '../apiSlice';
import type { User } from '@/types/auth.types';

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserById: builder.query<User, string>({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: 'GET',
      }),
      providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
    }),
  }),
});

export const { useGetUserByIdQuery } = userApi;

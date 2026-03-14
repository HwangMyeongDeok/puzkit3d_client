import { apiSlice } from '@/lib/api/apiSlice';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  LogoutResponse,
  AuthMappedResponse,
  ProfileResponse,
} from '@/types/api/auth.api.types';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthMappedResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        data: credentials,
      }),
      transformResponse: (response: LoginResponse): AuthMappedResponse => {
        return {
          user: {
            id: response.userId,
            email: response.email,
            firstName: '',
            lastName: '',
          },
          accessToken: response.token,
          refreshToken: response.refreshToken,
          expiresAt: response.expiresAt,
        };
      },
      invalidatesTags: ['User'],
    }),

    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        data: userData,
      }),
    }),

    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User', 'Cart', 'Order'],
    }),

    getProfile: builder.query<ProfileResponse, void>({
      query: () => ({
        url: '/profile',
        method: 'GET',
      }),
      providesTags: ['User'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useLazyGetProfileQuery,
} = authApi;

import { apiSlice } from '@/lib/api/apiSlice';

import type { User } from '@/types/auth.types';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ChangePasswordRequest,
  ConfirmEmailRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  UpdateProfileRequest,
  ResendVerificationEmailRequest,
} from '@/types/api/auth.api.types';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        data: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        data: userData,
      }),
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User', 'Cart', 'Order'],
    }),

    getProfile: builder.query<User, void>({
      query: () => ({
        url: '/profile',
        method: 'GET',
      }),
      providesTags: ['User'],
    }),

    updateProfile: builder.mutation<User, UpdateProfileRequest>({
      query: (userData) => ({
        url: '/profile',
        method: 'PUT',
        data: userData,
      }),
      invalidatesTags: ['User'],
    }),

    changePassword: builder.mutation<void, ChangePasswordRequest>({
      query: (data) => ({
        url: '/auth/change-password',
        method: 'POST',
        data,
      }),
    }),

    forgotPassword: builder.mutation<void, ForgotPasswordRequest>({
      query: (data) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        data,
      }),
    }),

    resetPassword: builder.mutation<void, ResetPasswordRequest>({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        data,
      }),
    }),

    confirmEmail: builder.mutation<void, ConfirmEmailRequest>({
      query: (data) => ({
        url: '/auth/confirm-email',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useLazyGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useConfirmEmailMutation,
} = authApi;

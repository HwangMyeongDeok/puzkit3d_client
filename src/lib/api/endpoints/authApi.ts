// import { apiSlice } from '@/lib/api/apiSlice';

// import type {
//   User,
//   LoginRequest,
//   LoginResponse,
//   RegisterRequest,
//   RegisterResponse,
//   ChangePasswordRequest,
//   ForgotPasswordRequest,
//   ResetPasswordRequest,
//   UpdateProfileRequest,
// } from '@/types';

// export const authApi = apiSlice.injectEndpoints({
//   endpoints: (builder) => ({
//     login: builder.mutation<LoginResponse, LoginRequest>({
//       query: (credentials) => ({
//         url: '/auth/login',
//         method: 'POST',
//         data: credentials,
//       }),
//       invalidatesTags: ['User'],
//     }),

//     register: builder.mutation<RegisterResponse, RegisterRequest>({
//       query: (userData) => ({
//         url: '/auth/register',
//         method: 'POST',
//         data: userData,
//       }),
//     }),

//     logout: builder.mutation<void, void>({
//       query: () => ({
//         url: '/auth/logout',
//         method: 'POST',
//       }),
//       invalidatesTags: ['User', 'Cart', 'Order'],
//     }),

//     getProfile: builder.query<User, void>({
//       query: () => ({
//         url: '/auth/profile',
//         method: 'GET',
//       }),
//       providesTags: ['User'],
//     }),

//     updateProfile: builder.mutation<User, UpdateProfileRequest>({
//       query: (userData) => ({
//         url: '/auth/profile',
//         method: 'PUT',
//         data: userData,
//       }),
//       invalidatesTags: ['User'],
//     }),

//     changePassword: builder.mutation<void, ChangePasswordRequest>({
//       query: (data) => ({
//         url: '/auth/change-password',
//         method: 'POST',
//         data,
//       }),
//     }),

//     forgotPassword: builder.mutation<void, ForgotPasswordRequest>({
//       query: (data) => ({
//         url: '/auth/forgot-password',
//         method: 'POST',
//         data,
//       }),
//     }),

//     resetPassword: builder.mutation<void, ResetPasswordRequest>({
//       query: (data) => ({
//         url: '/auth/reset-password',
//         method: 'POST',
//         data,
//       }),
//     }),
//   }),
// });

// export const {
//   useLoginMutation,
//   useRegisterMutation,
//   useLogoutMutation,
//   useGetProfileQuery,
//   useUpdateProfileMutation,
//   useChangePasswordMutation,
//   useForgotPasswordMutation,
//   useResetPasswordMutation,
// } = authApi;

import { apiSlice } from '@/lib/api/apiSlice';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  LogoutResponse,
  AuthMappedResponse,
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
            fullName: '',
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
  }),
  overrideExisting: false,
});

export const { useLoginMutation, useRegisterMutation, useLogoutMutation } = authApi;

import type { User } from '../auth.types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: string;
  email: string;
  token: string;
  refreshToken: string;
  /** Structured fields — used if the backend evolves */
  user?: User;
  accessToken?: string;
  expiresAt?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterResponse {
  message?: string;
}

export interface LogoutResponse {
  message?: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ConfirmEmailRequest {
  userId: string;
  token: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  userId: string;
  token: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  avatar?: string;
  streetAddress?: string;
  provinceId?: string;
  provinceName?: string;
  districtId?: string;
  districtName?: string;
  wardCode?: string;
  wardName?: string;
}

export interface ResendVerificationEmailRequest {
  email: string;
}

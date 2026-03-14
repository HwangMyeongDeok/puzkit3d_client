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
  expiresAt?: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  id?: string;
  email?: string;
  message?: string;
}

export interface LogoutResponse {
  message?: string;
}

export interface AuthMappedResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt?: string;
}

export interface ProfileResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  emailConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
  provinceId: string | null;
  provinceName: string | null;
  districtId: string | null;
  districtName: string | null;
  wardCode: string | null;
  wardName: string | null;
  streetAddress: string | null;
  role: string;
  isDeleted: boolean;
}

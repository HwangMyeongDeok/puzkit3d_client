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
  expiresAt: string;
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

export interface AuthMappedResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

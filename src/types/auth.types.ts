export type UserRole = 'Customer' | 'Staff' | 'Admin' | 'customer' | 'staff' | 'admin';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string | null;
  provinceName?: string | null;
  districtName?: string | null;
  wardName?: string | null;
  streetAddress?: string | null;
  role?: UserRole | string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthCredentials {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
}

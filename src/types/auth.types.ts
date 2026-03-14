export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  emailConfirmed?: boolean;
  createdAt?: string;
  updatedAt?: string;
  provinceId?: string;
  provinceName?: string;
  districtId?: string;
  districtName?: string;
  wardCode?: string;
  wardName?: string;
  streetAddress?: string;
  role?: string;
  isDeleted?: boolean;
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
  expiresAt?: string;
}

export interface AuthCredentials {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
}

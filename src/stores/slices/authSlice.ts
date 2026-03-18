import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Lưu ý: Nhớ vào file '@/types' xóa accessToken và refreshToken khỏi interface AuthState nhé!
import type { User, AuthState } from '@/types';

// Omit để báo TypeScript tạm bỏ qua 2 field token nếu bạn chưa kịp sửa file type
const initialState: Omit<AuthState, 'accessToken' | 'refreshToken'> = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Chỉ lưu user info, bỏ token đi
    setCredentials: (state, action: PayloadAction<{ user: User }>) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isLoading = false;
    },

    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;

      if (typeof window !== 'undefined') {
        // Xóa cookie token (Chỉ có tác dụng nếu Cookie của bạn KHÔNG có cờ HttpOnly)
        // Nếu backend set HttpOnly, bạn cần gọi 1 API /logout để backend tự xóa cookie
        document.cookie = 'puzkit3d_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'puzkit3d_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Khi F5, chỉ cần truyền user vào để khởi tạo lại state
    initializeAuth: (
      state,
      action: PayloadAction<{
        user: User | null;
      }>
    ) => {
      state.user = action.payload.user;
      state.isAuthenticated = !!action.payload.user;
      state.isLoading = false;
    },
  },
});

// Xóa updateAccessToken ra khỏi exports
export const { setCredentials, updateUser, logout, setLoading, initializeAuth } = authSlice.actions;

export default authSlice.reducer;

// Xóa selectAccessToken ra khỏi list selectors
export const selectCurrentUser = (state: {
  auth: Omit<AuthState, 'accessToken' | 'refreshToken'>;
}) => state.auth.user;
export const selectIsAuthenticated = (state: {
  auth: Omit<AuthState, 'accessToken' | 'refreshToken'>;
}) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: {
  auth: Omit<AuthState, 'accessToken' | 'refreshToken'>;
}) => state.auth.isLoading;

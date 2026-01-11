# PuzKit3D - Web Client Setup Guide

> **Tech Stack:** Next.js 15 | TypeScript | Tailwind CSS 3.4 | Shadcn/ui | Redux Toolkit + RTK Query | Axios | React Hook Form + Zod

---

## 📋 Mục lục

1. [Khởi tạo Project](#1-khởi-tạo-project)
2. [Cấu trúc thư mục](#2-cấu-trúc-thư-mục)
3. [Cấu hình ESLint & Prettier](#3-cấu-hình-eslint--prettier)
4. [Cấu hình Husky & Commitlint](#4-cấu-hình-husky--commitlint)
5. [Setup Tailwind & Design System](#5-setup-tailwind--design-system)
6. [Setup Shadcn/ui](#6-setup-shadcnui)
7. [Setup Redux Toolkit + RTK Query](#7-setup-redux-toolkit--rtk-query)
8. [Setup Axios với Interceptors](#8-setup-axios-với-interceptors)
9. [Setup React Hook Form + Zod](#9-setup-react-hook-form--zod)
10. [Environment Variables](#10-environment-variables)

---

## 1. Khởi tạo Project

```bash
# Tạo Next.js 15 project
npx create-next-app@latest puzkit3d_client --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

cd puzkit3d_client

# Cài đặt dependencies
npm install @reduxjs/toolkit react-redux axios react-hook-form zod @hookform/resolvers lucide-react clsx tailwind-merge class-variance-authority

# Dev dependencies
npm install -D @types/node prettier eslint-config-prettier eslint-plugin-prettier husky lint-staged @commitlint/cli @commitlint/config-conventional
```

---

## 2. Cấu trúc thư mục

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (main)/
│   │   ├── products/
│   │   ├── cart/
│   │   ├── orders/
│   │   ├── profile/
│   │   └── layout.tsx
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── orders/
│   │   └── layout.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/               # Shadcn components
│   ├── common/           # Header, Footer, Loading, etc.
│   ├── features/         # ProductCard, CartItem, OrderCard, etc.
│   └── layouts/          # MainLayout, AdminLayout, AuthLayout
├── lib/
│   ├── api/
│   │   ├── axiosInstance.ts
│   │   ├── baseQuery.ts
│   │   └── apiSlice.ts
│   ├── hooks/
│   ├── utils/
│   │   └── cn.ts
│   └── validations/
├── stores/
│   ├── store.ts
│   ├── authSlice.ts
│   └── cartSlice.ts
├── types/
│   ├── product.ts
│   ├── order.ts
│   ├── user.ts
│   └── api.ts
└── constants/
    ├── routes.ts
    └── config.ts
```

---

## 3. Cấu hình ESLint & Prettier

### `.eslintrc.json`
```json
{
  "extends": [
    "next/core-web-vitals",
    "next/typescript",
    "prettier"
  ],
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": "error",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

### `.prettierrc`
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### `package.json` scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,json}\""
  }
}
```

---

## 4. Cấu hình Husky & Commitlint

```bash
# Init Husky
npx husky init

# Tạo pre-commit hook
echo "npx lint-staged" > .husky/pre-commit

# Tạo commit-msg hook
echo "npx --no -- commitlint --edit \$1" > .husky/commit-msg
```

### `.lintstagedrc.json`
```json
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{css,json,md}": ["prettier --write"]
}
```

### `commitlint.config.js`
```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'revert']
    ]
  }
};
```

> **Commit format:** `feat: add product listing page`

---

## 5. Setup Tailwind & Design System

### `tailwind.config.ts`
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand colors
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        // UI colors
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        border: 'hsl(var(--border))',
        ring: 'hsl(var(--ring))',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

### `src/app/globals.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 215 70% 25%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --accent: 0 72% 51%;
    --accent-foreground: 210 40% 98%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --border: 214.3 31.8% 91.4%;
    --ring: 215 70% 25%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --border: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

---

## 6. Setup Shadcn/ui

```bash
# Init Shadcn
npx shadcn@latest init

# Chọn options:
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes

# Cài components cần thiết
npx shadcn@latest add button input label card dialog sheet toast dropdown-menu avatar badge separator skeleton table tabs
```

### `src/lib/utils/cn.ts`
```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 7. Setup Redux Toolkit + RTK Query

### `src/stores/store.ts`
```typescript
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { apiSlice } from '@/lib/api/apiSlice';
import authReducer from './authSlice';
import cartReducer from './cartSlice';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### `src/stores/authSlice.ts`
```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types/user';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
```

### `src/stores/cartSlice.ts`
```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem } from '@/types/cart';

interface CartState {
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
}

const initialState: CartState = {
  items: [],
  totalQuantity: 0,
  totalPrice: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find((item) => item.productId === action.payload.productId);
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      state.totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.totalPrice = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.productId !== action.payload);
      state.totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.totalPrice = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalPrice = 0;
    },
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
```

### `src/lib/hooks/redux.ts`
```typescript
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/stores/store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

---

## 8. Setup Axios với Interceptors

### `src/lib/api/axiosInstance.ts`
```typescript
import axios from 'axios';
import { store } from '@/stores/store';
import { logout, setCredentials } from '@/stores/authSlice';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Auto attach token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors & refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Token expired - attempt refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { refreshToken }
        );
        
        const { accessToken, user } = response.data;
        store.dispatch(setCredentials({ user, accessToken }));
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        store.dispatch(logout());
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
```

### `src/lib/api/baseQuery.ts`
```typescript
import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { AxiosRequestConfig, AxiosError } from 'axios';
import axiosInstance from './axiosInstance';

interface QueryArgs {
  url: string;
  method?: AxiosRequestConfig['method'];
  data?: unknown;
  params?: Record<string, unknown>;
}

interface QueryError {
  status?: number;
  data?: unknown;
}

export const axiosBaseQuery = (): BaseQueryFn<QueryArgs, unknown, QueryError> => {
  return async ({ url, method = 'GET', data, params }) => {
    try {
      const result = await axiosInstance({
        url,
        method,
        data,
        params,
      });
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as AxiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };
};
```

### `src/lib/api/apiSlice.ts`
```typescript
import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './baseQuery';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Product', 'Order', 'Cart', 'User', 'Category'],
  endpoints: () => ({}),
});
```

### `src/lib/api/endpoints/productApi.ts` (Example)
```typescript
import { apiSlice } from '../apiSlice';
import { Product, ProductListResponse } from '@/types/product';

export const productApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<ProductListResponse, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) => ({
        url: '/products',
        params: { page, limit },
      }),
      providesTags: ['Product'],
    }),
    getProductById: builder.query<Product, string>({
      query: (id) => ({ url: `/products/${id}` }),
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
  }),
});

export const { useGetProductsQuery, useGetProductByIdQuery } = productApi;
```

---

## 9. Setup React Hook Form + Zod

### `src/lib/validations/auth.ts`
```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Họ tên tối thiểu 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, 'Số điện thoại không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
```

### Example Form Component
```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    // Handle login
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register('email')} />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu</Label>
        <Input id="password" type="password" {...register('password')} />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </Button>
    </form>
  );
}
```

---

## 10. Environment Variables

### `.env.example`
```env
# API
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# App
NEXT_PUBLIC_APP_NAME=PuzKit3D
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Analytics, etc.
# NEXT_PUBLIC_GA_ID=
```

### `.env.local` (Không commit lên git)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 📌 Checklist sau khi Setup

- [ ] Chạy `npm run dev` - không lỗi
- [ ] Chạy `npm run build` - build thành công
- [ ] Chạy `npm run lint` - không warnings
- [ ] Test commit với format conventional - Husky chạy
- [ ] Shadcn components render đúng
- [ ] Redux DevTools thấy store

---

## 🔗 Tài liệu tham khảo

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Shadcn/ui](https://ui.shadcn.com)
- [Redux Toolkit](https://redux-toolkit.js.org)
- [RTK Query](https://redux-toolkit.js.org/rtk-query/overview)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)

---

> **Last Updated:** 2026-01-11  
> **Author:** Team Lead

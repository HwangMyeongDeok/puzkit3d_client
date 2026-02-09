import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { AxiosRequestConfig, AxiosError } from 'axios';

import axiosInstance from './axiosInstance';

export interface QueryArgs {
  url: string;
  method?: AxiosRequestConfig['method'];
  data?: unknown;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export interface QueryError {
  status?: number;
  data?: unknown;
  message?: string;
}

export const axiosBaseQuery = (): BaseQueryFn<QueryArgs, unknown, QueryError> => {
  return async ({ url, method = 'GET', data, params, headers }) => {
    try {
      const result = await axiosInstance({
        url,
        method,
        data,
        params,
        headers,
      });

      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as AxiosError<{ message?: string }>;

      return {
        error: {
          status: err.response?.status,
          data: err.response?.data,
          message: err.response?.data?.message || err.message,
        },
      };
    }
  };
};

export default axiosBaseQuery;

// lib/utils/error-handler.ts
import { toast } from 'sonner';

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
}

// Type Guard để check xem error có phải format của FetchBaseQueryError (RTK Query) không
function isFetchBaseQueryError(error: unknown): error is { data: ProblemDetails } {
  return typeof error === 'object' && error !== null && 'data' in error;
}

export const handleErrorToast = (
  error: unknown, // Dùng unknown thay vì any
  fallbackMessage = 'An unexpected error occurred. Please try again!'
): void => {
  // Thêm return type void
  if (isFetchBaseQueryError(error)) {
    const problemData = error.data;

    // Ưu tiên 1: Lỗi Validate form (errors array)
    if (problemData.errors && Object.keys(problemData.errors).length > 0) {
      const firstErrorField = Object.values(problemData.errors)[0];
      if (firstErrorField && firstErrorField.length > 0) {
        toast.error(firstErrorField[0]);
        return;
      }
    }

    // Ưu tiên 2 & 3: Lỗi detail hoặc title
    if (problemData.detail) {
      toast.error(problemData.detail);
      return;
    }

    if (problemData.title) {
      toast.error(problemData.title);
      return;
    }
  }

  // Fallback
  toast.error(fallbackMessage);
};

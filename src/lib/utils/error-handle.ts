import { toast } from 'sonner';

interface ApiErrorData {
  errors?: Record<string, unknown[]>;
  detail?: string;
  title?: string;
  [key: string]: unknown;
}

export const handleApiError = (error: unknown) => {
  // 1. Phân giải error của Axios hoặc RTK Query
  const err = error as Record<string, unknown>;
  const errorData = ((err as any)?.data || (err as any)?.response?.data || err) as ApiErrorData;
  if (!errorData || typeof errorData !== 'object') {
    toast.error('Lỗi kết nối server!');
    return;
  }

  // 2. Trường hợp lỗi 400 (Validation) - có mảng errors
  if (errorData.errors && typeof errorData.errors === 'object') {
    const errorMessages = Object.values(errorData.errors).flat();
    errorMessages.forEach((msg: unknown) => {
      if (typeof msg === 'string') toast.error(msg);
    });
    return;
  }

  // 3. Trường hợp lỗi có field "detail" (401, 409, 500...)
  if (errorData.detail) {
    toast.error(errorData.detail);
    return;
  }

  // 4. Fallback: Nếu không rơi vào các trường hợp trên thì lấy "title"
  if (errorData.title) {
    toast.error(errorData.title);
    return;
  }

  toast.error('Có lỗi xảy ra, thử lại sau!');
};

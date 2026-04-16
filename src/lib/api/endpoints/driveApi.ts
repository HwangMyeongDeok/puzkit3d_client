import apiSlice from '@/lib/api/apiSlice';

// -------------------------------------------------------------
// 1. TYPES & INTERFACES (Bạn có thể move cái này vào file types)
// -------------------------------------------------------------

export interface DriveDto {
  id: string;
  name: string;
  description: string;
  minVolume: number;
  quantityInStock: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedListOfDriveDto {
  items: DriveDto[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface GetDrivesParams {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  isActive?: boolean;
  ascending: boolean;
}

export interface CreateDriveRequest {
  name: string;
  description: string;
  minVolume: number;
  quantityInStock: number;
  isActive: boolean;
}

export interface UpdateDriveRequest {
  id: string;
  data: {
    name: string;
    description: string;
    minVolume: number;
    quantityInStock: number;
    isActive: boolean;
  };
}

// -------------------------------------------------------------
// 2. RTK QUERY ENDPOINTS
// -------------------------------------------------------------

export const driveApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET: Lấy danh sách Drive có phân trang
    getDrives: builder.query<PaginatedListOfDriveDto, GetDrivesParams>({
      query: (params) => ({
        url: '/drives', // Thêm '/api' phía trước nếu apiSlice của bạn chưa có baseUrl là /api
        method: 'GET',
        params: params as unknown as Record<string, unknown>, // RTK Query sẽ tự động chuyển object này thành query string (?pageNumber=1&...)
      }),
    }),

    // GET: Lấy chi tiết 1 Drive theo ID
    getDriveById: builder.query<DriveDto, string>({
      query: (id) => ({
        url: `/drives/${id}`,
        method: 'GET',
      }),
    }),

    // POST: Tạo mới Drive
    createDrive: builder.mutation<string, CreateDriveRequest>({
      query: (data) => ({
        url: '/drives',
        method: 'POST',
        data,
      }),
    }),

    // PUT: Cập nhật Drive
    updateDrive: builder.mutation<void, UpdateDriveRequest>({
      query: ({ id, data }) => ({
        url: `/drives/${id}`,
        method: 'PUT',
        data: data,
      }),
    }),

    // DELETE: Xóa Drive
    deleteDrive: builder.mutation<void, string>({
      query: (id) => ({
        url: `/drives/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
  overrideExisting: false,
});

// Export các hooks để sử dụng trong Component
export const {
  useGetDrivesQuery,
  useGetDriveByIdQuery,
  useCreateDriveMutation,
  useUpdateDriveMutation,
  useDeleteDriveMutation,
} = driveApi;

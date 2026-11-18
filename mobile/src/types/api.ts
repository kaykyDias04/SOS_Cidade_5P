export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
};

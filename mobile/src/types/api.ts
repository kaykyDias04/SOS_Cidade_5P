export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  /** Código HTTP, quando a API respondeu. */
  status?: number;
  /** true quando não foi possível falar com o servidor (sem rede ou tempo esgotado). */
  offline?: boolean;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
};

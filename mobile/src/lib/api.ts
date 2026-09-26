import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const token = await SecureStore.getItemAsync('authToken');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || errorData.message || `API Error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export const authAPI = {
  login: async (email: string, password: string) => {
    return apiCall<{
      user: {
        id: number;
        email: string;
        name: string;
        role: string;
      };
      token: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  logout: async () => {
    return apiCall<{ success: boolean }>('/auth/logout', {
      method: 'POST',
    });
  },
};

export interface Denuncia {
  id: number;
  tipoDenuncia: string;
  identificacao: boolean;
  nomeDenunciante: string;
  userId?: number;
  bairroOcorrencia: string;
  descricaoOcorrencia: string;
  dataOcorrencia: string;
  protocolo: string;
  situacao: string;
  imagens?: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export const denunciasAPI = {
  list: async (page = 1, limit = 50) => {
    return apiCall<PaginatedResponse<Denuncia>>(
      `/denuncias?_page=${page}&_limit=${limit}&_meta=1`
    );
  },

  getById: async (id: number) => {
    return apiCall<Denuncia>(`/denuncias/${id}`);
  },

  create: async (data: Omit<Denuncia, 'id' | 'createdAt' | 'updatedAt'>) => {
    return apiCall<Denuncia>('/denuncias', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    });
  },

  update: async (id: number, data: Partial<Denuncia>) => {
    return apiCall<Denuncia>(`/denuncias/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number) => {
    return apiCall<void>(`/denuncias/${id}`, {
      method: 'DELETE',
    });
  },
};

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export const usersAPI = {
  create: async (data: {
    email: string;
    name: string;
    password: string;
    role: string;
  }) => {
    return apiCall<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  list: async (role?: string) => {
    const url = role ? `/users?role=${role}` : '/users';
    return apiCall<User[]>(url);
  },

  delete: async (id: number) => {
    return apiCall<void>(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

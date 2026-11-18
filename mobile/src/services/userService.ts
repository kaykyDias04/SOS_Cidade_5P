import { apiCall } from '@/services/http';
import type { User } from '@/types';

export const usersAPI = {
  create: async (data: {
    email: string;
    name: string;
    password: string;
    role: string;
  }) => apiCall<User>('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  list: async (role?: string) => {
    const url = role ? `/users?role=${role}` : '/users';
    return apiCall<User[]>(url);
  },

  delete: async (id: number) => apiCall<void>(`/users/${id}`, {
    method: 'DELETE',
  }),
};

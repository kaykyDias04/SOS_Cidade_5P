import { apiRequest } from '@/services/http';
import type { CreateUserInput, User } from '@/types';

export const usersAPI = {
  create: async (data: CreateUserInput) => apiRequest<User>('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  list: async (role?: string) => {
    const url = role ? `/users?role=${role}` : '/users';
    return apiRequest<User[]>(url);
  },

  delete: async (id: number) => apiRequest<void>(`/users/${id}`, {
    method: 'DELETE',
  }),
};

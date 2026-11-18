import { useAuthStore } from '@/store/useAuthStore';
import type { UserRole } from '@/types';

type GuardRedirect = '/login' | '/home' | '/denuncias';

export function useRoleGuard(requiredRole: UserRole | null): GuardRedirect | null {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return requiredRole === null ? null : '/login';
  if (!user) return null;

  if (requiredRole === null) {
    return user.role === 'GESTOR' ? '/denuncias' : '/home';
  }

  if (user.role !== requiredRole) {
    return user.role === 'GESTOR' ? '/denuncias' : '/home';
  }

  return null;
}

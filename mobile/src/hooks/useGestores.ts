import { useCallback, useEffect, useState } from 'react';
import { usersAPI } from '@/services/userService';
import type { CreateGestorInput, User } from '@/types';

export function useGestores() {
  const [gestores, setGestores] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listar = useCallback(async () => {
    setLoading(true);
    setError(null);
    const response = await usersAPI.list('GESTOR');
    if (response.success && response.data) {
      setGestores(response.data);
    } else {
      setError(response.error || 'Falha ao carregar gestores');
    }
    setLoading(false);
  }, []);

  const criar = useCallback(async (data: CreateGestorInput) => {
    const response = await usersAPI.createGestor(data);
    if (response.success) {
      await listar();
    } else {
      setError(response.error || 'Falha ao criar gestor');
    }
    return response;
  }, [listar]);

  const excluir = useCallback(async (id: number) => {
    const response = await usersAPI.delete(id);
    if (response.success) {
      setGestores((current) => current.filter((gestor) => gestor.id !== id));
    } else {
      setError(response.error || 'Falha ao remover gestor');
    }
    return response;
  }, []);

  useEffect(() => {
    void listar();
  }, [listar]);

  return { gestores, loading, error, listar, criar, excluir };
}

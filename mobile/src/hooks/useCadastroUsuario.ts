import { useState } from 'react';
import { usersAPI } from '@/services/userService';
import type { CreateUserInput } from '@/types';

export function useCadastroUsuario() {
  const [loading, setLoading] = useState(false);

  const cadastrar = async (data: CreateUserInput) => {
    setLoading(true);
    try {
      return await usersAPI.create(data);
    } finally {
      setLoading(false);
    }
  };

  return { loading, cadastrar };
}

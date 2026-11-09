import { z } from 'zod';
import { emailSchema } from './common';

export const loginSchema = z.object({
  email: emailSchema,
  // A senha não é alterada (sem trim): vale exatamente o que foi digitada.
  password: z
    .string({ required_error: 'Campo obrigatório' })
    .min(1, 'Informe a senha')
    .max(128, 'Senha longa demais'),
});

import './errorMap';
import { z } from 'zod';

// Mínimo de caracteres da senha. Para o grupo subir para 8, altere só esta constante.
export const MIN_PASSWORD_LENGTH = 6;
export const MAX_PASSWORD_LENGTH = 72; // limite do bcrypt

export const emailSchema = z
  .string({ required_error: 'Campo obrigatório' })
  .trim()
  .toLowerCase()
  .max(254, 'E-mail longo demais')
  .email('E-mail inválido');

// id inteiro positivo, mantido como string (os controllers fazem parseInt).
// Rejeita "1e3", "0x10", " 5 ", "-1", "0" e valores acima do Int do Postgres.
export const idParamSchema = z.object({
  id: z
    .string({ required_error: 'Campo obrigatório' })
    .regex(/^\d{1,10}$/, 'ID inválido')
    .refine((v) => Number(v) >= 1 && Number(v) <= 2147483647, 'ID inválido'),
});

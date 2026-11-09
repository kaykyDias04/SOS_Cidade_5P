import { z } from 'zod';
import { emailSchema, MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from './common';

export const createUserSchema = z.object({
  name: z
    .string({ required_error: 'Campo obrigatório' })
    .trim()
    .min(2, 'Nome curto demais')
    .max(100, 'Nome longo demais'),
  email: emailSchema,
  password: z
    .string({ required_error: 'Campo obrigatório' })
    .min(MIN_PASSWORD_LENGTH, `A senha deve ter no mínimo ${MIN_PASSWORD_LENGTH} caracteres.`)
    .max(MAX_PASSWORD_LENGTH, `A senha deve ter no máximo ${MAX_PASSWORD_LENGTH} caracteres.`)
    // O bcrypt só usa os primeiros 72 BYTES; caracteres acentuados ocupam mais de um.
    .refine((s) => Buffer.byteLength(s, 'utf8') <= MAX_PASSWORD_LENGTH, 'Senha longa demais'),
});

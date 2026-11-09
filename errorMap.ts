import { z } from 'zod';

// Mensagens em português e sem eco do valor enviado (o Zod padrão chega a incluir o valor
// recebido em alguns erros).
z.setErrorMap((issue) => {
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      return { message: issue.received === 'undefined' ? 'Campo obrigatório' : 'Tipo de dado inválido' };
    case z.ZodIssueCode.too_small:
      return { message: 'Valor menor que o mínimo permitido' };
    case z.ZodIssueCode.too_big:
      return { message: 'Valor maior que o máximo permitido' };
    case z.ZodIssueCode.invalid_string:
      return { message: 'Formato inválido' };
    default:
      return { message: 'Valor inválido' };
  }
});

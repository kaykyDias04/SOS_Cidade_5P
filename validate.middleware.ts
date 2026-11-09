import { NextFunction, Request, Response } from 'express';
import { ZodTypeAny } from 'zod';
import '../schemas/errorMap';

export type OrigemValidacao = 'body' | 'query' | 'params';

// Valida body, query ou params. Em caso de erro responde 400 sem devolver os valores enviados;
// em caso de sucesso substitui a origem pelos dados já validados (campos desconhecidos saem).
export function validate(schema: ZodTypeAny, origem: OrigemValidacao = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const resultado = schema.safeParse((req as any)[origem] ?? {});

    if (!resultado.success) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: resultado.error.issues.map((i) => ({
          campo: i.path.join('.') || origem,
          mensagem: i.message,
        })),
      });
    }

    (req as any)[origem] = resultado.data;
    next();
  };
}

/**
 * Model: Denuncia
 * Espelha o formato de denúncia do backend (schema.prisma / denuncia.service.ts).
 * Só a forma do dado, sem lógica.
 */
export interface Denuncia {
  id: number;
  tipoDenuncia: string;
  bairroOcorrencia: string;
  descricaoOcorrencia: string;
  identificacao: boolean;
  nomeDenunciante: string;
  situacao: string;
  protocolo: string;
  dataOcorrencia: string;
}

/**
 * O que o app ENVIA para criar uma denúncia — note que não inclui
 * userId/userEmail: o backend já pega isso do token autenticado
 * (ver denuncia.controller.ts: create), então o app não precisa mandar.
 */
export interface NovaDenunciaInput {
  tipoDenuncia: string;
  bairroOcorrencia: string;
  descricaoOcorrencia: string;
  identificacao: boolean;
  nomeDenunciante?: string;
}

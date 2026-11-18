export type Denuncia = {
  id: number;
  tipoDenuncia: string;
  identificacao: boolean;
  nomeDenunciante: string;
  userId?: number;
  bairroOcorrencia: string;
  descricaoOcorrencia: string;
  dataOcorrencia: string;
  protocolo: string;
  situacao: string;
  imagens?: string[] | null;
  createdAt: string;
  updatedAt: string;
};

export type DenunciaFiltros = {
  tipoDenuncia?: string;
  bairroOcorrencia?: string;
  situacao?: string;
};

export type NovaDenunciaInput = {
  tipoDenuncia: string;
  bairroOcorrencia: string;
  descricaoOcorrencia: string;
  identificacao: boolean;
  nomeDenunciante?: string;
};
